import { env } from '../config/env';
import { logger } from '../../shared/logger/logger';
import twilio from 'twilio';
import { ISmsService } from '../../application/interface/common/sms-service.interface';

export class TwilioSmsService implements ISmsService {
  private client: twilio.Twilio | null = null;
  private fromNumber: string | undefined;

  constructor() {
    const accountSid = env.TWILIO_ACCOUNT_SID;
    const authToken = env.TWILIO_AUTH_TOKEN;
    this.fromNumber = env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken);
    } else {
      logger.warn('Twilio credentials not found in environment variables. SMS service is disabled.');
    }
  }

  async sendSms(to: string, message: string): Promise<void> {
    if (!this.client || !this.fromNumber) {
      logger.warn('Cannot send SMS: Twilio client not initialized.');
      return;
    }

    try {
      await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to,
      });
      logger.info(`SMS sent to ${to}`);
    } catch (error) {
      logger.error('Error sending SMS via Twilio:', error);
      throw new Error('Failed to send SMS');
    }
  }
}
