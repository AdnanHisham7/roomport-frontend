import type { Request, Response } from 'express';
import { AppError, ForbiddenError } from '../../shared/error/app-error';
import { IExpenseUseCases } from '../../application/interface/expence/expense-usecase.impl';
import { IBuildingRepository } from '../../domain/repository/building-repository-impl';

export class ExpenseController {
  constructor(
    private readonly expenseUseCases: IExpenseUseCases,
    private readonly buildingRepo: IBuildingRepository,
  ) {}

  private err(res: Response, e: unknown, fb: string): Response {
    if (e instanceof AppError) return res.status(e.statusCode).json({ message: e.message, suggestion: e.suggestion });
    return res.status(500).json({ message: fb, error: e instanceof Error ? e.message : 'Unknown error' });
  }

  private async assertBuildingOwnership(buildingId: string, userId: string, role: string): Promise<void> {
    if (role === 'super_admin') return;
    const building = await this.buildingRepo.findById(buildingId);
    if (!building) throw new ForbiddenError('Building not found or access denied.', 'Provide a valid buildingId you own or manage.');
    if (building.ownerId !== userId && building.managerId !== userId) {
      throw new ForbiddenError('You do not have access to this building.', 'This building belongs to a different builder.');
    }
  }

  getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { buildingId, unitId, category, status } = req.query as Record<string, string>;
      const user = req.user!;

      if (user.role !== 'super_admin' && buildingId) {
        await this.assertBuildingOwnership(buildingId, user.userId, user.role);
      }

      const filter: any = { category: category as any, status };
      if (buildingId) {
        filter.buildingId = buildingId;
      } else if (user.role !== 'super_admin') {
        const buildings = await this.buildingRepo.findAll({ ownerId: user.userId });
        const managerBuildings = await this.buildingRepo.findAll({ managerId: user.userId });
        const allBuildingIds = [...new Set([...buildings, ...managerBuildings].map(b => b._id!))];
        if (!allBuildingIds.length) return res.status(200).json({ message: 'Expenses fetched.', count: 0, data: [] });
        const expenses = await Promise.all(allBuildingIds.map(bid => this.expenseUseCases.getAll({ buildingId: bid, unitId, category: category as any, status })));
        const all = expenses.flat();
        return res.status(200).json({ message: 'Expenses fetched.', count: all.length, data: all });
      }
      if (unitId) filter.unitId = unitId;

      const expenses = await this.expenseUseCases.getAll(filter);
      return res.status(200).json({ message: 'Expenses fetched.', count: expenses.length, data: expenses });
    } catch (e) { return this.err(res, e, 'Failed to fetch expenses.'); }
  };

  getById = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
    try {
      const expense = await this.expenseUseCases.getById(req.params.id);
      const user = req.user!;
      if (user.role !== 'super_admin') {
        await this.assertBuildingOwnership(expense.buildingId, user.userId, user.role);
      }
      return res.status(200).json({ data: expense });
    } catch (e) { return this.err(res, e, 'Failed to fetch expense.'); }
  };

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { buildingId, category, title, amount, date, method } = req.body;
      const errs: string[] = [];
      if (!buildingId?.trim()) errs.push('buildingId is required.');
      if (!category)           errs.push('category is required (repair, utility, salary, tax, renovation, cleaning, insurance, security, commission, legal, marketing, other).');
      if (!title?.trim())      errs.push('title is required.');
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) errs.push('amount must be a positive number.');
      if (!date)               errs.push('date is required.');
      if (!method)             errs.push('method is required (cash, bank_transfer, upi, cheque, card).');

      if (errs.length) return res.status(422).json({ message: 'Validation failed.', errors: errs });

      const user = req.user!;
      if (user.role !== 'super_admin') {
        await this.assertBuildingOwnership(buildingId, user.userId, user.role);
      }

      const expense = await this.expenseUseCases.create({
        ...req.body,
        amount:     Number(amount),
        recordedBy: user.userId,
      });
      return res.status(201).json({ message: 'Expense recorded.', data: expense });
    } catch (e) { return this.err(res, e, 'Failed to record expense.'); }
  };

  update = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
    try {
      const existing = await this.expenseUseCases.getById(req.params.id);
      const user = req.user!;
      if (user.role !== 'super_admin') {
        await this.assertBuildingOwnership(existing.buildingId, user.userId, user.role);
      }
      const expense = await this.expenseUseCases.update(req.params.id, req.body);
      return res.status(200).json({ message: 'Expense updated.', data: expense });
    } catch (e) { return this.err(res, e, 'Failed to update expense.'); }
  };

  delete = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
    try {
      const existing = await this.expenseUseCases.getById(req.params.id);
      const user = req.user!;
      if (user.role !== 'super_admin') {
        await this.assertBuildingOwnership(existing.buildingId, user.userId, user.role);
      }
      await this.expenseUseCases.delete(req.params.id);
      return res.status(200).json({ message: 'Expense deleted.' });
    } catch (e) { return this.err(res, e, 'Failed to delete expense.'); }
  };

  summary = async (req: Request<{ buildingId: string }>, res: Response): Promise<Response> => {
    try {
      const { buildingId } = req.params;
      const user = req.user!;
      if (user.role !== 'super_admin') {
        await this.assertBuildingOwnership(buildingId, user.userId, user.role);
      }
      const { period = 'monthly', year, month, week } = req.query as Record<string, string>;

      const currentYear  = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      if (!['daily','weekly','monthly','yearly'].includes(period)) {
        return res.status(422).json({ message: 'period must be: daily, weekly, monthly, or yearly.' });
      }

      const data = await this.expenseUseCases.getSummary(
        buildingId,
        period as any,
        Number(year  ?? currentYear),
        month ? Number(month) : currentMonth,
        week  ? Number(week)  : undefined,
      );

      return res.status(200).json({ message: 'Expense tracker summary.', data });
    } catch (e) { return this.err(res, e, 'Failed to get expense tracker summary.'); }
  };

  getByDateRange = async (req: Request<{ buildingId: string }>, res: Response): Promise<Response> => {
    try {
      const { buildingId } = req.params;
      const user = req.user!;
      if (user.role !== 'super_admin') {
        await this.assertBuildingOwnership(buildingId, user.userId, user.role);
      }
      const { from, to, category } = req.query as Record<string, string>;

      if (!from || !to) {
        return res.status(422).json({ message: 'from and to dates are required. Format: YYYY-MM-DD' });
      }

      const expenses = await this.expenseUseCases.getByDateRange(buildingId, from, to, category as any);
      return res.status(200).json({ message: 'Expenses fetched.', count: expenses.length, data: expenses });
    } catch (e) { return this.err(res, e, 'Failed to fetch expenses by date range.'); }
  };
}
