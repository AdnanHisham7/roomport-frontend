import type { Request, Response, NextFunction } from 'express';
import { SubscriptionModel, SubscriptionPeriodModel } from '../db/model/subscription-model';
import mongoose from 'mongoose';

/**
 * requireActiveSubscription middleware
 * Blocks access when:
 *   1. No subscription exists for the builder
 *   2. Subscription status is not 'active'
 *   3. No paid period covers the current date
 *
 * Super admins always pass through.
 * Managers pass through if their owner has an active paid subscription.
 */
export const requireActiveSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) { res.status(401).json({ message: 'Unauthenticated.' }); return; }

    if (user.role === 'super_admin') { next(); return; }

    const userId = new mongoose.Types.ObjectId(user.userId);

    const sub = await SubscriptionModel.findOne({
      userId,
      status: 'active',
    }).lean();

    if (!sub) {
      res.status(402).json({
        message:    'No active subscription found.',
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
        message:    'Your subscription payment for the current period is pending.',
        suggestion: 'Please pay for the current billing period to regain access.',
        code:       'SUBSCRIPTION_PERIOD_UNPAID',
      });
      return;
    }

    next();
  } catch (err) {
    console.error('[requireActiveSubscription] Error:', err);
    next();
  }
};
