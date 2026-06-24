import { ISubscriptionRepository } from "../../../domain/repository/subscription-repository-impl";
import { IPlatformSettingRepository } from "../../../domain/repository/platform-setting-repository-impl";
import { ISubscription } from "../../../domain/entities/Subscription";
import { BadRequestError, NotFoundError } from "../../../shared/error/app-error";
import { AdminUpdateSubscriptionDTO, CreateSubscriptionQuoteDTO, SubscriptionResponseDTO } from "../../dtos/subscription/subscription.dto";
import { ISubscriptionUseCases } from "../../interface/subscription/subscription-usecase.impl";

function toResponse(s: ISubscription): SubscriptionResponseDTO {
  return {
    _id: s._id!.toString(), userId: s.userId.toString(), amount: s.amount,
    numberOfBuildings: s.numberOfBuildings, numberOfUnits: s.numberOfUnits,
    dueDate: s.dueDate, paidAt: s.paidAt, status: s.status,
    paymentMethod: s.paymentMethod, invoicenumber: s.invoicenumber,
    createdAt: s.createdAt, updatedAt: s.updatedAt,
  };
}

export class SubscriptionUseCases implements ISubscriptionUseCases {
  constructor(
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly settingRepo: IPlatformSettingRepository
  ) {}

  async getPricing(): Promise<{ pricePerBuilding: number; pricePerUnit: number; currency: string }> {
    const s = await this.settingRepo.get();
    return { pricePerBuilding: s.pricePerBuilding, pricePerUnit: s.pricePerUnit, currency: s.currency };
  }

  async createQuote(userId: string, data: CreateSubscriptionQuoteDTO): Promise<SubscriptionResponseDTO> {
    const numberOfBuildings = Number(data.numberOfBuildings);
    const numberOfUnits = Number(data.numberOfUnits);

    if (!numberOfBuildings || numberOfBuildings < 1) throw new BadRequestError('numberOfBuildings must be at least 1.');
    if (!numberOfUnits || numberOfUnits < 1) throw new BadRequestError('numberOfUnits must be at least 1.');

    const settings = await this.settingRepo.get();
    const amount = Math.round((numberOfBuildings * settings.pricePerBuilding + numberOfUnits * settings.pricePerUnit) * 100) / 100;

    const dueDate = new Date();
    dueDate.setFullYear(dueDate.getFullYear() + 1);

    const sub = await this.subscriptionRepo.create({
      userId, amount, numberOfBuildings, numberOfUnits, dueDate, status: 'pending',
    });
    return toResponse(sub);
  }

  async getMine(userId: string): Promise<SubscriptionResponseDTO | null> {
    const sub = await this.subscriptionRepo.findByUserId(userId);
    return sub ? toResponse(sub) : null;
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

  async adminUpdate(id: string, data: AdminUpdateSubscriptionDTO): Promise<SubscriptionResponseDTO> {
    const existing = await this.subscriptionRepo.findById(id);
    if (!existing) throw new NotFoundError('Subscription not found.');

    const updated = await this.subscriptionRepo.update(id, data as Partial<ISubscription>);
    return toResponse(updated!);
  }
}
