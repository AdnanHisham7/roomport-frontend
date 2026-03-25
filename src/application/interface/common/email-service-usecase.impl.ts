export interface IEmailService {
  sendOtpEmail(to: string, otp: string, purpose: string): Promise<void>;
  sendWelcomeCredentials(to: string, name: string, tempPassword: string): Promise<void>;
}