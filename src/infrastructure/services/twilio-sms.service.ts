import twilio from 'twilio';
import { ISmsService } from '../../application/interface/common/sms-service.interface';

export class TwilioSmsService implements ISmsService {
  private client: twilio.Twilio | null = null;
  private fromNumber: string | undefined;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken);
    } else {
      console.warn('Twilio credentials not found in environment variables. SMS service is disabled.');
    }
  }

  async sendSms(to: string, message: string): Promise<void> {
    if (!this.client || !this.fromNumber) {
      console.warn('Cannot send SMS: Twilio client not initialized.');
      return;
    }

    try {
      await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to,
      });
      console.log(`SMS sent to ${to}`);
    } catch (error) {
      console.error('Error sending SMS via Twilio:', error);
      throw new Error('Failed to send SMS');
    }
  }
}
