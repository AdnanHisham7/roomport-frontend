import type { Request, Response } from 'express';
import { AppError } from '../../shared/error/app-error';
import { IExpenseUseCases } from '../../application/interface/expence/expense-usecase.impl';


export class ExpenseController {
  constructor(private readonly expenseUseCases: IExpenseUseCases) {}

  private err(res: Response, e: unknown, fb: string): Response {
    if (e instanceof AppError) return res.status(e.statusCode).json({ message: e.message, suggestion: e.suggestion });
    return res.status(500).json({ message: fb, error: e instanceof Error ? e.message : 'Unknown error' });
  }

  // ── GET /expenses ──────────────────────────────────────────────────────────
  getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { buildingId, unitId, category, status } = req.query as Record<string, string>;
      const expenses = await this.expenseUseCases.getAll({ buildingId, unitId, category: category as any, status });
      return res.status(200).json({ message: 'Expenses fetched.', count: expenses.length, data: expenses });
    } catch (e) { return this.err(res, e, 'Failed to fetch expenses.'); }
  };

  // ── GET /expenses/:id ──────────────────────────────────────────────────────
  getById = async (req: Request, res: Response): Promise<Response> => {
    try { return res.status(200).json({ data: await this.expenseUseCases.getById(req.params.id) }); }
    catch (e) { return this.err(res, e, 'Failed to fetch expense.'); }
  };

  // ── POST /expenses ─────────────────────────────────────────────────────────
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

      const expense = await this.expenseUseCases.create({
        ...req.body,
        amount:     Number(amount),
        recordedBy: req.user!.userId,
      });
      return res.status(201).json({ message: 'Expense recorded.', data: expense });
    } catch (e) { return this.err(res, e, 'Failed to record expense.'); }
  };

  // ── PUT /expenses/:id ──────────────────────────────────────────────────────
  update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const expense = await this.expenseUseCases.update(req.params.id, req.body);
      return res.status(200).json({ message: 'Expense updated.', data: expense });
    } catch (e) { return this.err(res, e, 'Failed to update expense.'); }
  };

  // ── DELETE /expenses/:id ───────────────────────────────────────────────────
  delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      await this.expenseUseCases.delete(req.params.id);
      return res.status(200).json({ message: 'Expense deleted.' });
    } catch (e) { return this.err(res, e, 'Failed to delete expense.'); }
  };

  // ── GET /expenses/tracker/:buildingId/summary ──────────────────────────────
  // The main expense tracker view — income vs expenses for any period
  summary = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { buildingId } = req.params;
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

  // ── GET /expenses/tracker/:buildingId/range ────────────────────────────────
  // Custom date range query
  getByDateRange = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { buildingId } = req.params;
      const { from, to, category } = req.query as Record<string, string>;

      if (!from || !to) {
        return res.status(422).json({ message: 'from and to dates are required. Format: YYYY-MM-DD' });
      }

      const expenses = await this.expenseUseCases.getByDateRange(buildingId, from, to, category as any);
      return res.status(200).json({ message: 'Expenses fetched.', count: expenses.length, data: expenses });
    } catch (e) { return this.err(res, e, 'Failed to fetch expenses by date range.'); }
  };
}
