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
import type { IEmailService } from '../../interface/common/email-service-usecase.impl';
import { NotificationModel } from '../../../infrastructure/db/model/notification-model';

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

  /** Admin creates subscription for a builder manually */
  async createBuilderSubscription(data: CreateBuilderSubscriptionDTO, adminUserId: string): Promise<{ subscription: SubscriptionResponseDTO; firstPeriod: SubscriptionPeriodResponseDTO }> {
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
      description: `Subscription created for builder ${user.first_name} ${user.last_name}. Cycle: ${data.billingCycle}, Buildings: ${data.numberOfBuildings}, Units: ${data.numberOfUnits}, Amount: ₹${data.amount}.`,
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
    // Check if current period has a paid period
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

    // Advance subscription to next period
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

      // Create next period record
      await this.subscriptionRepo.createPeriod({
        subscriptionId: sub._id!,
        userId:         sub.userId,
        periodStart:    nextStart,
        periodEnd:      nextEnd,
        periodLabel:    nextLabel,
        amount:         sub.amount,
        status:         'pending',
      });
    }

    this.activityLogUc.logActivity({
      action:      ActivityLogAction.SUBSCRIPTION_PERIOD_PAID,
      entityType:  ActivityLogEntityType.SUBSCRIPTION,
      entityId:    periodId,
      userId:      adminUserId,
      description: `Subscription period "${updated!.periodLabel}" marked as paid. Amount: ₹${updated!.amount}.`,
      metadata:    { periodLabel: updated!.periodLabel, amount: updated!.amount },
    }).catch(console.error);

    return toPeriodResponse(updated!);
  }

  async adminUpdate(id: string, data: AdminUpdateSubscriptionDTO, adminUserId: string): Promise<SubscriptionResponseDTO> {
    const existing = await this.subscriptionRepo.findById(id);
    if (!existing) throw new NotFoundError('Subscription not found.');

    const updated = await this.subscriptionRepo.update(id, data as Partial<ISubscription>);

    this.activityLogUc.logActivity({
      action:      ActivityLogAction.SUBSCRIPTION_UPGRADED,
      entityType:  ActivityLogEntityType.SUBSCRIPTION,
      entityId:    id,
      userId:      adminUserId,
      description: `Subscription updated. Buildings: ${data.numberOfBuildings ?? existing.numberOfBuildings}, Units: ${data.numberOfUnits ?? existing.numberOfUnits}.`,
    }).catch(console.error);

    return toResponse(updated!);
  }

  /** Public demo booking — no payment */
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

    // Notify admin via notification + email
    try {
      // Create in-system notification for super admin
      await NotificationModel.create({
        recipientId:  undefined,
        recipientRole: 'super_admin',
        type:          'demo_request',
        title:         'New Demo Request',
        message:       `${data.firstName} ${data.lastName} (${data.email}) requested a demo. Buildings: ${data.numberOfBuildings}, Units: ${data.numberOfUnits}.`,
        metadata:      { demoRequestId: demo._id.toString() },
      });

      // Email notification
      await this.emailService.sendNotificationEmail?.(
        process.env.ADMIN_EMAIL ?? 'admin@rentflow.in',
        `New Demo Request from ${data.firstName} ${data.lastName}`,
        `
          <h2>New Demo Request</h2>
          <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone ?? 'Not provided'}</p>
          <p><strong>Company:</strong> ${data.companyName ?? 'Not provided'}</p>
          <p><strong>Buildings:</strong> ${data.numberOfBuildings}</p>
          <p><strong>Rooms:</strong> ${data.numberOfUnits}</p>
          <p><strong>Message:</strong> ${data.message ?? 'None'}</p>
        `,
      );
    } catch (e) {
      console.error('Demo request notification failed:', e);
    }

    return { message: 'Demo request received. Our team will contact you within 24 hours.' };
  }

  /** Builder submits upgrade/renewal request */
  async requestUpgrade(data: UpgradeRequestDTO, adminEmail: string): Promise<{ message: string }> {
    try {
      const user = await this.userRepo.findById(data.userId);
      const userName = user ? `${user.first_name} ${user.last_name}` : data.userId;

      await NotificationModel.create({
        recipientRole: 'super_admin',
        type:          'upgrade_request',
        title:         'Upgrade / Renewal Request',
        message:       `Builder ${userName} has requested an upgrade. Additional buildings: ${data.additionalBuildings ?? 0}, Additional units: ${data.additionalUnits ?? 0}.`,
        metadata:      { ...data },
      });

      await this.emailService.sendNotificationEmail?.(
        adminEmail,
        `Upgrade Request from ${userName}`,
        `
          <h2>Subscription Upgrade / Renewal Request</h2>
          <p><strong>Builder:</strong> ${userName}</p>
          <p><strong>Additional Buildings:</strong> ${data.additionalBuildings ?? 0}</p>
          <p><strong>Additional Units:</strong> ${data.additionalUnits ?? 0}</p>
          ${data.additionalBuildingData?.length ? `<p><strong>New Building Details:</strong><br>${data.additionalBuildingData.map(b => `${b.name}: ${b.rooms} rooms`).join('<br>')}</p>` : ''}
          <p><strong>Message:</strong> ${data.message ?? 'None'}</p>
        `,
      );

      this.activityLogUc.logActivity({
        action:      ActivityLogAction.UPGRADE_REQUEST_RECEIVED,
        entityType:  ActivityLogEntityType.SUBSCRIPTION,
        userId:      data.userId,
        description: `Builder requested upgrade: +${data.additionalBuildings ?? 0} buildings, +${data.additionalUnits ?? 0} units.`,
        metadata:    { ...data },
      }).catch(console.error);
    } catch (e) {
      console.error('Upgrade request notification failed:', e);
    }

    return { message: 'Upgrade request submitted. Admin will reach out to confirm and apply changes.' };
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
