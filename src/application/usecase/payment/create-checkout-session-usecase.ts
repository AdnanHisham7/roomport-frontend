import { IStripeService } from '../../interface/common/stripe-service.interface';
import { IUserRepository } from '../../../domain/repository/user-repository-impl';
import { ISubscriptionRepository } from '../../../domain/repository/subscription-repository-impl';

export class CreateCheckoutSessionUseCase {
  constructor(
    private stripeService: IStripeService,
    private userRepository: IUserRepository,
    private subscriptionRepository: ISubscriptionRepository
  ) {}

  async execute(userId: string, subscriptionId: string, successUrl: string, cancelUrl: string): Promise<string> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    const subscription = await this.subscriptionRepository.findById(subscriptionId);
    if (!subscription || subscription.userId !== userId) throw new Error('Subscription not found');

    const sessionUrl = await this.stripeService.createCheckoutSession(
      subscriptionId,
      user.email,
      subscription.amount,
      successUrl,
      cancelUrl
    );

    return sessionUrl;
  }

  async executePublic(
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    numberOfBuildings: number,
    numberOfUnits: number,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    // Basic calculation for now: adjust this to the correct Math!
    const amount = (numberOfBuildings * 10) + (numberOfUnits * 5);

    const metadata = {
      firstName,
      lastName,
      email,
      phone,
      numberOfBuildings: numberOfBuildings.toString(),
      numberOfUnits: numberOfUnits.toString(),
      amount: amount.toString()
    };

    const sessionUrl = await this.stripeService.createPublicCheckoutSession(
      email,
      amount,
      metadata,
      successUrl,
      cancelUrl
    );

    return sessionUrl;
  }
}
