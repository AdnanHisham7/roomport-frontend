export interface IEmailService {
  sendOtpEmail(to: string, otp: string, purpose: string): Promise<void>;
}