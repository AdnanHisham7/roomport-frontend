import type { Request, Response, NextFunction } from 'express';
import { SubscriptionModel, SubscriptionPeriodModel } from '../db/model/subscription-model';
import mongoose from 'mongoose';

/**
 * requireActiveSubscription middleware
 * Attach after `authenticate` on any builder-facing route group.
 * Super admins always pass through.
 */
export const requireActiveSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) { res.status(401).json({ message: 'Unauthenticated.' }); return; }

    // Super admins are exempt
    if (user.role === 'super_admin') { next(); return; }

    const userId = user.userId;
    const sub = await SubscriptionModel.findOne({ userId: new mongoose.Types.ObjectId(userId), status: 'active' }).lean();

    if (!sub) {
      res.status(402).json({
        message:    'Subscription not active.',
        suggestion: 'Contact your administrator to activate or renew your subscription.',
        code:       'SUBSCRIPTION_INACTIVE',
      });
      return;
    }

    const now = new Date();
    const activePeriod = await SubscriptionPeriodModel.findOne({
      subscriptionId: sub._id,
      status:         'paid',
      periodStart:    { $lte: now },
      periodEnd:      { $gte: now },
    }).lean();

    if (!activePeriod) {
      res.status(402).json({
        message:    'Subscription payment pending for current period.',
        suggestion: 'Contact your administrator to mark the current period as paid.',
        code:       'SUBSCRIPTION_PERIOD_UNPAID',
      });
      return;
    }

    next();
  } catch (err) {
    console.error('[requireActiveSubscription] Error:', err);
    // Fail open — don't block on middleware errors
    next();
  }
};
