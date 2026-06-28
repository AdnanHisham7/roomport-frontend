import { ISubscriptionRepository } from '../../../domain/repository/subscription-repository-impl';
import { IPlatformSettingRepository } from '../../../domain/repository/platform-setting-repository-impl';
import { ISubscription, ISubscriptionPeriod, BillingCycle } from '../../../domain/entities/Subscription';
import { BadRequestError, NotFoundError } from '../../../shared/error/app-error';
import {
  CreateBuilderSubscriptionDTO,
  AdminUpdateSubscriptionDTO,
  MarkPeriodPaidDTO,
  SubscriptionResponseDTO,
  SubscriptionPeriodResponseDTO,
  DemoRequestDTO,
  UpgradeRequestDTO,
} from '../../dtos/subscription/subscription.dto';
import { IUserRepository } from '../../../domain/repository/user-repository-impl';
import { IActivityLogUsecase } from '../activity-log/activity-log-usecase';
import { ActivityLogAction, ActivityLogEntityType } from '../../../domain/entities/ActivityLog';
import { DemoRequestModel } from '../../../infrastructure/db/model/demo-request-model';
import { NotificationModel } from '../../../infrastructure/db/model/notification-model';
import { UpgradeRequestModel, IUpgradeRequest } from '../../../infrastructure/db/model/upgrade-request-model';
import type { IEmailService } from '../../interface/common/email-service-usecase.impl';

function toResponse(s: ISubscription): SubscriptionResponseDTO {
  return {
    _id:                s._id!.toString(),
    userId:             s.userId.toString(),
    amount:             s.amount,
    numberOfBuildings:  s.numberOfBuildings,
    numberOfUnits:      s.numberOfUnits,
    billingCycle:       s.billingCycle,
    currentPeriodStart: s.currentPeriodStart,
    currentPeriodEnd:   s.currentPeriodEnd,
    dueDate:            s.dueDate,
    paidAt:             s.paidAt,
    status:             s.status,
    paymentMethod:      s.paymentMethod,
    invoicenumber:      s.invoicenumber,
    notes:              s.notes,
    createdAt:          s.createdAt,
    updatedAt:          s.updatedAt,
  };
}

function toPeriodResponse(p: ISubscriptionPeriod): SubscriptionPeriodResponseDTO {
  return {
    _id:            p._id!.toString(),
    subscriptionId: p.subscriptionId.toString(),
    userId:         p.userId.toString(),
    periodStart:    p.periodStart,
    periodEnd:      p.periodEnd,
    periodLabel:    p.periodLabel,
    amount:         p.amount,
    status:         p.status,
    paidAt:         p.paidAt,
    notes:          p.notes,
    createdAt:      p.createdAt,
  };
}

function buildPeriodDates(start: Date, cycle: BillingCycle): { end: Date; label: string } {
  const end = new Date(start);
  if (cycle === 'monthly') {
    end.setMonth(end.getMonth() + 1);
    return { end, label: start.toLocaleString('default', { month: 'long', year: 'numeric' }) };
  } else {
    end.setFullYear(end.getFullYear() + 1);
    return { end, label: `${start.getFullYear()}–${end.getFullYear()}` };
  }
}

export class SubscriptionUseCases {
  constructor(
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly settingRepo: IPlatformSettingRepository,
    private readonly userRepo: IUserRepository,
    private readonly activityLogUc: IActivityLogUsecase,
    private readonly emailService: IEmailService,
  ) {}

  async getPricing(): Promise<{
    monthlyPricePerBuilding: number; monthlyPricePerUnit: number;
    yearlyPricePerBuilding: number; yearlyPricePerUnit: number;
    currency: string;
  }> {
    const s = await this.settingRepo.get();
    return {
      monthlyPricePerBuilding: s.monthlyPricePerBuilding ?? s.pricePerBuilding,
      monthlyPricePerUnit:     s.monthlyPricePerUnit     ?? s.pricePerUnit,
      yearlyPricePerBuilding:  s.yearlyPricePerBuilding  ?? s.pricePerBuilding * 10,
      yearlyPricePerUnit:      s.yearlyPricePerUnit      ?? s.pricePerUnit * 10,
      currency:                s.currency,
    };
  }

  async createBuilderSubscription(
    data: CreateBuilderSubscriptionDTO,
    adminUserId: string
  ): Promise<{ subscription: SubscriptionResponseDTO; firstPeriod: SubscriptionPeriodResponseDTO }> {
    if (data.numberOfBuildings < 1) throw new BadRequestError('numberOfBuildings must be at least 1.');
    if (data.numberOfUnits < 1)     throw new BadRequestError('numberOfUnits must be at least 1.');

    const user = await this.userRepo.findById(data.userId);
    if (!user) throw new NotFoundError('Builder not found.');

    const periodStart = new Date();
    const { end: periodEnd, label: periodLabel } = buildPeriodDates(periodStart, data.billingCycle);

    const sub = await this.subscriptionRepo.create({
      userId:             data.userId,
      amount:             data.amount,
      numberOfBuildings:  data.numberOfBuildings,
      numberOfUnits:      data.numberOfUnits,
      billingCycle:       data.billingCycle,
      currentPeriodStart: periodStart,
      currentPeriodEnd:   periodEnd,
      dueDate:            periodEnd,
      status:             'active',
      notes:              data.notes,
    });

    const firstPeriod = await this.subscriptionRepo.createPeriod({
      subscriptionId: sub._id!,
      userId:         data.userId,
      periodStart,
      periodEnd,
      periodLabel,
      amount:         data.amount,
      status:         'pending',
    });

    await this.activityLogUc.logActivity({
      action:      ActivityLogAction.SUBSCRIPTION_CREATED,
      entityType:  ActivityLogEntityType.SUBSCRIPTION,
      entityId:    sub._id!.toString(),
      userId:      adminUserId,
      description: `Subscription created for ${user.first_name} ${user.last_name}. Cycle: ${data.billingCycle}, Buildings: ${data.numberOfBuildings}, Units: ${data.numberOfUnits}, Amount: ₹${data.amount}.`,
      metadata:    { billingCycle: data.billingCycle, numberOfBuildings: data.numberOfBuildings, numberOfUnits: data.numberOfUnits, amount: data.amount },
    });

    return { subscription: toResponse(sub), firstPeriod: toPeriodResponse(firstPeriod) };
  }

  async getMine(userId: string): Promise<SubscriptionResponseDTO | null> {
    const sub = await this.subscriptionRepo.findByUserId(userId);
    return sub ? toResponse(sub) : null;
  }

  async getMyPeriods(userId: string): Promise<SubscriptionPeriodResponseDTO[]> {
    const sub = await this.subscriptionRepo.findByUserId(userId);
    if (!sub) return [];
    const periods = await this.subscriptionRepo.findPeriodsBySubscriptionId(sub._id!.toString());
    return periods.map(toPeriodResponse);
  }

  async isSubscriptionActive(userId: string): Promise<boolean> {
    const sub = await this.subscriptionRepo.findByUserId(userId);
    if (!sub) return false;
    if (sub.status !== 'active') return false;
    const periods = await this.subscriptionRepo.findPeriodsBySubscriptionId(sub._id!.toString());
    const now = new Date();
    const activePeriod = periods.find(p =>
      p.status === 'paid' &&
      new Date(p.periodStart) <= now &&
      new Date(p.periodEnd) >= now
    );
    return !!activePeriod;
  }

  async getHistory(userId: string): Promise<SubscriptionResponseDTO[]> {
    const subs = await this.subscriptionRepo.findAllByUserId(userId);
    return subs.map(toResponse);
  }

  async listAll(filter: { userId?: string; status?: string }, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const { data, total } = await this.subscriptionRepo.findAllPaginated(filter, skip, limit);
    return { data: data.map(toResponse), total, page, limit };
  }

  async listPeriods(filter: { userId?: string; subscriptionId?: string; status?: string }, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const { data, total } = await this.subscriptionRepo.findAllPeriodsPaginated(filter, skip, limit);
    return { data: data.map(toPeriodResponse), total, page, limit };
  }

  async markPeriodPaid(periodId: string, adminUserId: string, data: MarkPeriodPaidDTO): Promise<SubscriptionPeriodResponseDTO> {
    const period = await this.subscriptionRepo.findPeriodById(periodId);
    if (!period) throw new NotFoundError('Subscription period not found.');

    const updated = await this.subscriptionRepo.updatePeriod(periodId, {
      status: 'paid',
      paidAt: data.paidAt ?? new Date(),
      paidBy: adminUserId,
      notes:  data.notes,
    });

    const sub = await this.subscriptionRepo.findById(period.subscriptionId.toString());
    if (sub) {
      const nextStart = new Date(updated!.periodEnd);
      const { end: nextEnd, label: nextLabel } = buildPeriodDates(nextStart, sub.billingCycle);

      await this.subscriptionRepo.update(sub._id!.toString(), {
        currentPeriodStart: nextStart,
        currentPeriodEnd:   nextEnd,
        dueDate:            nextEnd,
        status:             'active',
        paidAt:             updated!.paidAt,
      });

      await this.subscriptionRepo.createPeriod({
        subscriptionId: sub._id!,
        userId:         sub.userId,
        periodStart:    nextStart,
        periodEnd:      nextEnd,
        periodLabel:    nextLabel,
        amount:         sub.amount,
        status:         'pending',
      });

      // Notify the builder that their payment was confirmed
      try {
        await NotificationModel.create({
          userId:           sub.userId,
          title:            'Payment Confirmed',
          message:          `Your subscription payment for "${updated!.periodLabel}" (₹${updated!.amount}) has been confirmed. Next period: ${nextLabel}.`,
          notificationType: 'general',
          channel:          'in_app',
          type:             'payment_confirmed',
          metadata:         { periodLabel: updated!.periodLabel, nextPeriodLabel: nextLabel, amount: updated!.amount },
        });
      } catch (e) {
        console.error('Failed to notify builder of payment:', e);
      }
    }

    this.activityLogUc.logActivity({
      action:      ActivityLogAction.SUBSCRIPTION_PERIOD_PAID,
      entityType:  ActivityLogEntityType.SUBSCRIPTION,
      entityId:    periodId,
      userId:      adminUserId,
      description: `Period "${updated!.periodLabel}" marked paid. Amount: ₹${updated!.amount}.`,
      metadata:    { periodLabel: updated!.periodLabel, amount: updated!.amount },
    }).catch(console.error);

    return toPeriodResponse(updated!);
  }

  async adminUpdate(id: string, data: AdminUpdateSubscriptionDTO, adminUserId: string): Promise<SubscriptionResponseDTO> {
    const existing = await this.subscriptionRepo.findById(id);
    if (!existing) throw new NotFoundError('Subscription not found.');
    const updated = await this.subscriptionRepo.update(id, data as Partial<ISubscription>);

    // Notify the builder
    try {
      await NotificationModel.create({
        userId:           existing.userId,
        title:            'Subscription Updated',
        message:          `Your subscription has been updated by the admin. Buildings: ${data.numberOfBuildings ?? existing.numberOfBuildings}, Units: ${data.numberOfUnits ?? existing.numberOfUnits}.`,
        notificationType: 'general',
        channel:          'in_app',
        type:             'subscription_updated',
        metadata:         { numberOfBuildings: data.numberOfBuildings, numberOfUnits: data.numberOfUnits, status: data.status },
      });
    } catch (e) {
      console.error('Failed to notify builder of subscription update:', e);
    }

    this.activityLogUc.logActivity({
      action:      ActivityLogAction.SUBSCRIPTION_UPGRADED,
      entityType:  ActivityLogEntityType.SUBSCRIPTION,
      entityId:    id,
      userId:      adminUserId,
      description: `Subscription updated. Buildings: ${data.numberOfBuildings ?? existing.numberOfBuildings}, Units: ${data.numberOfUnits ?? existing.numberOfUnits}.`,
    }).catch(console.error);

    return toResponse(updated!);
  }

  /** Public demo booking — no auth required */
  async bookDemo(data: DemoRequestDTO): Promise<{ message: string }> {
    const demo = await DemoRequestModel.create({
      firstName:         data.firstName,
      lastName:          data.lastName,
      email:             data.email,
      phone:             data.phone,
      companyName:       data.companyName,
      numberOfBuildings: data.numberOfBuildings,
      numberOfUnits:     data.numberOfUnits,
      message:           data.message,
    });

    try {
      // Create in-app notification for super_admin (via recipientRole — no userId needed)
      await NotificationModel.create({
        recipientRole:    'super_admin',
        title:            'New Demo Request',
        message:          `${data.firstName} ${data.lastName} (${data.email}) requested a demo. Buildings: ${data.numberOfBuildings}, Units: ${data.numberOfUnits}.`,
        notificationType: 'general',
        channel:          'in_app',
        type:             'demo_request',
        metadata:         { demoRequestId: demo._id.toString(), email: data.email, name: `${data.firstName} ${data.lastName}` },
      });

      await this.emailService.sendNotificationEmail?.(
        process.env.ADMIN_EMAIL ?? 'admin@brift.in',
        `New Demo Request from ${data.firstName} ${data.lastName}`,
        `<h2>New Demo Request</h2><p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p><p><strong>Email:</strong> ${data.email}</p><p><strong>Phone:</strong> ${data.phone ?? 'Not provided'}</p><p><strong>Company:</strong> ${data.companyName ?? 'Not provided'}</p><p><strong>Buildings:</strong> ${data.numberOfBuildings}</p><p><strong>Rooms:</strong> ${data.numberOfUnits}</p><p><strong>Message:</strong> ${data.message ?? 'None'}</p>`,
      );
    } catch (e) {
      console.error('Demo request notification failed:', e);
    }

    return { message: 'Demo request received. Our team will contact you within 24 hours.' };
  }

  /** Builder submits upgrade/renewal request — persists to DB and notifies admin */
  async requestUpgrade(data: UpgradeRequestDTO, adminEmail: string): Promise<{ message: string }> {
    const user = await this.userRepo.findById(data.userId);
    const userName = user ? `${user.first_name} ${user.last_name}` : data.userId;

    // Find the builder's subscription
    const sub = await this.subscriptionRepo.findByUserId(data.userId);

    // Persist the upgrade request
    const upgradeRequest = await UpgradeRequestModel.create({
      userId:               data.userId,
      subscriptionId:       sub?._id?.toString() ?? null,
      additionalBuildings:  data.additionalBuildings ?? 0,
      additionalUnits:      data.additionalUnits ?? 0,
      additionalBuildingData: data.additionalBuildingData ?? [],
      message:              data.message ?? null,
      status:               'pending',
    });

    try {
      // Notify super_admin via recipientRole (no userId)
      await NotificationModel.create({
        recipientRole:    'super_admin',
        title:            'Upgrade / Renewal Request',
        message:          `${userName} has requested an upgrade. +${data.additionalBuildings ?? 0} buildings, +${data.additionalUnits ?? 0} units.`,
        notificationType: 'general',
        channel:          'in_app',
        type:             'upgrade_request',
        metadata:         {
          upgradeRequestId:    upgradeRequest._id.toString(),
          userId:              data.userId,
          builderName:         userName,
          builderEmail:        user?.email,
          additionalBuildings: data.additionalBuildings ?? 0,
          additionalUnits:     data.additionalUnits ?? 0,
          message:             data.message,
          subscriptionId:      sub?._id?.toString(),
        },
      });

      await this.emailService.sendNotificationEmail?.(
        adminEmail,
        `Upgrade Request from ${userName}`,
        `<h2>Subscription Upgrade / Renewal Request</h2><p><strong>Builder:</strong> ${userName} (${user?.email})</p><p><strong>Additional Buildings:</strong> ${data.additionalBuildings ?? 0}</p><p><strong>Additional Units:</strong> ${data.additionalUnits ?? 0}</p>${data.additionalBuildingData?.length ? `<p><strong>New Building Details:</strong><br>${data.additionalBuildingData.map(b => `${b.name}: ${b.rooms} rooms`).join('<br>')}</p>` : ''}<p><strong>Message:</strong> ${data.message ?? 'None'}</p><p><a href="${process.env.ADMIN_URL ?? 'https://admin.brift.in'}/super-admin/upgrade-requests/${upgradeRequest._id}">View Request</a></p>`,
      );
    } catch (e) {
      console.error('Upgrade request notification failed:', e);
    }

    this.activityLogUc.logActivity({
      action:      ActivityLogAction.UPGRADE_REQUEST_RECEIVED,
      entityType:  ActivityLogEntityType.SUBSCRIPTION,
      entityId:    upgradeRequest._id.toString(),
      userId:      data.userId,
      description: `${userName} requested upgrade: +${data.additionalBuildings ?? 0} buildings, +${data.additionalUnits ?? 0} units.`,
      metadata:    { upgradeRequestId: upgradeRequest._id.toString(), ...data },
    }).catch(console.error);

    return { message: 'Upgrade request submitted. Admin will reach out to confirm and apply changes.' };
  }

  /** Super admin: list all upgrade requests */
  async listUpgradeRequests(
    filter: { status?: string; userId?: string },
    page: number,
    limit: number
  ): Promise<{ data: IUpgradeRequest[]; total: number; page: number; limit: number; totalPages: number }> {
    const query: Record<string, any> = {};
    if (filter.status) query.status = filter.status;
    if (filter.userId) query.userId = filter.userId;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      UpgradeRequestModel.find(query)
        .populate('userId', 'first_name last_name email phone_number')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UpgradeRequestModel.countDocuments(query),
    ]);

    const mapped = data.map((d: any) => ({
      ...d,
      _id:    d._id.toString(),
      userId: d.userId?._id ? { ...d.userId, _id: d.userId._id.toString() } : d.userId?.toString(),
    }));

    return { data: mapped, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  }

  /** Super admin: resolve (approve/reject) an upgrade request */
  async resolveUpgradeRequest(
    requestId: string,
    adminUserId: string,
    resolution: {
      status:       'approved' | 'rejected';
      adminNotes?:  string;
      // If approved — these get applied to the subscription:
      numberOfBuildings?: number;
      numberOfUnits?:     number;
      amount?:            number;
    }
  ): Promise<{ message: string }> {
    const request = await UpgradeRequestModel.findById(requestId)
      .populate('userId', 'first_name last_name email')
      .lean() as any;

    if (!request) throw new NotFoundError('Upgrade request not found.');
    if (request.status !== 'pending') {
      throw new BadRequestError(`This request has already been ${request.status}.`);
    }

    await UpgradeRequestModel.findByIdAndUpdate(requestId, {
      status:     resolution.status,
      adminNotes: resolution.adminNotes ?? null,
      resolvedBy: adminUserId,
      resolvedAt: new Date(),
    });

    const builderUserId = request.userId?._id?.toString() ?? request.userId?.toString();
    const builderName   = request.userId?.first_name
      ? `${request.userId.first_name} ${request.userId.last_name}`
      : 'Builder';
    const builderEmail  = request.userId?.email;

    if (resolution.status === 'approved' && request.subscriptionId) {
      const sub = await this.subscriptionRepo.findById(request.subscriptionId.toString());
      if (sub) {
        const updates: Partial<ISubscription> = {};
        if (resolution.numberOfBuildings != null)
          updates.numberOfBuildings = resolution.numberOfBuildings;
        if (resolution.numberOfUnits != null)
          updates.numberOfUnits = resolution.numberOfUnits;
        if (resolution.amount != null)
          updates.amount = resolution.amount;

        if (Object.keys(updates).length > 0) {
          await this.subscriptionRepo.update(request.subscriptionId.toString(), updates);
        }
      }
    }

    // Notify the builder of the resolution
    try {
      const isApproved = resolution.status === 'approved';
      await NotificationModel.create({
        userId:           builderUserId,
        title:            isApproved ? 'Upgrade Request Approved' : 'Upgrade Request Rejected',
        message:          isApproved
          ? `Your upgrade request has been approved. Your subscription has been updated.${resolution.adminNotes ? ` Note: ${resolution.adminNotes}` : ''}`
          : `Your upgrade request was not approved at this time.${resolution.adminNotes ? ` Reason: ${resolution.adminNotes}` : ' Please contact support for more details.'}`,
        notificationType: 'general',
        channel:          'in_app',
        type:             'upgrade_request_resolved',
        metadata:         { requestId, status: resolution.status, adminNotes: resolution.adminNotes },
      });

      if (builderEmail) {
        await this.emailService.sendNotificationEmail?.(
          builderEmail,
          isApproved ? 'Subscription Upgrade Approved' : 'Subscription Upgrade Request Update',
          isApproved
            ? `<h2>Upgrade Approved</h2><p>Your subscription upgrade request has been approved and applied. Please log in to your dashboard to confirm the changes.</p>${resolution.adminNotes ? `<p><strong>Note:</strong> ${resolution.adminNotes}</p>` : ''}`
            : `<h2>Upgrade Request Update</h2><p>Your upgrade request has not been approved at this time.</p>${resolution.adminNotes ? `<p><strong>Reason:</strong> ${resolution.adminNotes}</p>` : ''}<p>Please contact our support team if you have any questions.</p>`
        );
      }
    } catch (e) {
      console.error('Failed to notify builder of upgrade resolution:', e);
    }

    this.activityLogUc.logActivity({
      action:      resolution.status === 'approved' ? ActivityLogAction.SUBSCRIPTION_UPGRADED : ActivityLogAction.SUBSCRIPTION_CANCELED,
      entityType:  ActivityLogEntityType.SUBSCRIPTION,
      entityId:    requestId,
      userId:      adminUserId,
      description: `Upgrade request for ${builderName} ${resolution.status}. ${resolution.adminNotes ?? ''}`,
    }).catch(console.error);

    return {
      message: resolution.status === 'approved'
        ? `Upgrade request approved and subscription updated for ${builderName}.`
        : `Upgrade request rejected for ${builderName}.`,
    };
  }

  async listDemoRequests(filter: { status?: string }, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const query: Record<string, any> = {};
    if (filter.status) query.status = filter.status;
    const [data, total] = await Promise.all([
      DemoRequestModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      DemoRequestModel.countDocuments(query),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  }

  async updateDemoRequest(id: string, body: { status?: string; adminNotes?: string }) {
    const doc = await DemoRequestModel.findByIdAndUpdate(id, { $set: body }, { new: true }).lean();
    if (!doc) throw new NotFoundError('Demo request not found.');
    return doc;
  }
}
