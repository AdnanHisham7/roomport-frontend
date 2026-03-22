import type { Request, Response } from 'express';
import { IAgreementUseCases } from '../../application/interface/agreement/agreement-usecase.impl';
import { AppError } from '../../shared/error/app-error';


export class AgreementController {
  constructor(private readonly agreementUseCases: IAgreementUseCases) {}

  // ── Admin: POST /agreements ─────────────────────────────────────────────────
  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { tenantId, buildingId, unitId, title, body, terms, monthlyRent, startDate, endDate } = req.body;
      const errors: string[] = [];

      if (!tenantId?.trim())   errors.push('tenantId is required.');
      if (!buildingId?.trim()) errors.push('buildingId is required.');
      if (!title?.trim())      errors.push('title is required.');
      if (!body?.trim())       errors.push('body is required.');
      if (monthlyRent === undefined || isNaN(Number(monthlyRent)))
        errors.push('monthlyRent must be a number.');
      if (!startDate) errors.push('startDate is required.');
      if (!endDate)   errors.push('endDate is required.');

      if (errors.length > 0) {
        return res.status(422).json({ message: 'Validation failed.', errors });
      }

      const agreement = await this.agreementUseCases.create({
        tenantId, buildingId, unitId,
        createdBy:   req.user!.userId,
        title, body, terms,
        monthlyRent: Number(monthlyRent),
        startDate, endDate,
      });

      return res.status(201).json({ message: 'Agreement draft created.', data: agreement });
    } catch (err) { return this.handleError(res, err, 'Failed to create agreement.'); }
  };

  // ── Admin: GET /agreements ──────────────────────────────────────────────────
  getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { tenantId, buildingId, status } = req.query as Record<string, string>;
      const agreements = await this.agreementUseCases.getAll({ tenantId, buildingId, status: status as any });
      return res.status(200).json({ message: 'Agreements fetched.', count: agreements.length, data: agreements });
    } catch (err) { return this.handleError(res, err, 'Failed to fetch agreements.'); }
  };

  // ── Admin: GET /agreements/:id ─────────────────────────────────────────────
  getById = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
    try {
      const agreement = await this.agreementUseCases.getById(req.params.id);
      return res.status(200).json({ message: 'Agreement fetched.', data: agreement });
    } catch (err) { return this.handleError(res, err, 'Failed to fetch agreement.'); }
  };

  // ── Admin: POST /agreements/:id/send ───────────────────────────────────────
  sendSigningLink = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
    try {
      const expiresInHours = req.body.expiresInHours ? Number(req.body.expiresInHours) : 72;
      const result = await this.agreementUseCases.sendSigningLink(req.params.id, expiresInHours);
      return res.status(200).json(result);
    } catch (err) { return this.handleError(res, err, 'Failed to send signing link.'); }
  };

  // ── Admin: PATCH /agreements/:id/cancel ────────────────────────────────────
  cancel = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
    try {
      const agreement = await this.agreementUseCases.cancel(req.params.id);
      return res.status(200).json({ message: 'Agreement cancelled.', data: agreement });
    } catch (err) { return this.handleError(res, err, 'Failed to cancel agreement.'); }
  };

  // ── Public: GET /sign/:token ────────────────────────────────────────────────
  viewByToken = async (req: Request<{ token: string }>, res: Response): Promise<Response> => {
    try {
      const agreement = await this.agreementUseCases.viewByToken({
        rawToken:        req.params.token,
        signerIp:        req.ip,
        signerUserAgent: req.headers['user-agent'],
      });
      return res.status(200).json({ message: 'Agreement retrieved.', data: agreement });
    } catch (err) { return this.handleError(res, err, 'Failed to retrieve agreement.'); }
  };

  // ── Public: POST /sign/:token/initiate ─────────────────────────────────────
  initiateSigning = async (req: Request<{ token: string }>, res: Response): Promise<Response> => {
    try {
      const { typedSignatureName } = req.body;
      if (!typedSignatureName?.trim()) {
        return res.status(422).json({
          message:    'Validation failed.',
          suggestion: 'Please type your full legal name exactly as it appears on your ID.',
          errors:     ['typedSignatureName is required.'],
        });
      }

      const result = await this.agreementUseCases.initiateSigning({
        rawToken: req.params.token,
        typedSignatureName,
        signerIp:        req.ip,
        signerUserAgent: req.headers['user-agent'],
      });
      return res.status(200).json(result);
    } catch (err) { return this.handleError(res, err, 'Failed to initiate signing.'); }
  };

  // ── Public: POST /sign/:token/verify-otp ──────────────────────────────────
  verifySigningOtp = async (req: Request<{ token: string }>, res: Response): Promise<Response> => {
    try {
      const { otp } = req.body;
      if (!otp?.trim()) {
        return res.status(422).json({
          message: 'Validation failed.',
          errors:  ['otp is required.'],
        });
      }

      const result = await this.agreementUseCases.verifySigningOtp({
        rawToken: req.params.token,
        otp,
        signerIp:        req.ip,
        signerUserAgent: req.headers['user-agent'],
      });
      return res.status(200).json(result);
    } catch (err) { return this.handleError(res, err, 'Failed to verify OTP.'); }
  };

  private handleError(res: Response, error: unknown, fallback: string): Response {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message, suggestion: error.suggestion });
    }
    return res.status(500).json({
      message: fallback, suggestion: 'Please try again later.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
