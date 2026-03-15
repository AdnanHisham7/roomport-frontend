import type { IEmailService } from "../../application/interface/common/email-service-usecase.impl";
import nodemailer from 'nodemailer';
import { OtpPurpose } from "../../shared/enums/OtpPurpose.enum";

export class EmailService implements IEmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendOtpEmail(to: string, otp: string, purpose: string): Promise<void> {
    const { subject, body } = this.buildEmailContent(otp, purpose);

    await this.transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'App'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html: body,
    });
  }

  private buildEmailContent(otp: string, purpose: string): { subject: string; body: string } {
    const expiryMinutes = 10;

    if (purpose === OtpPurpose.FORGOT_PASSWORD) {
      return {
        subject: 'Password Reset OTP',
        body: `
          <h2>Password Reset Request</h2>
          <p>Your OTP for password reset is:</p>
          <h1 style="letter-spacing:6px; color:#333;">${otp}</h1>
          <p>This OTP expires in <strong>${expiryMinutes} minutes</strong>.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
        `,
      };
    }

    return {
      subject: 'Email Verification OTP',
      body: `
        <h2>Verify Your Email</h2>
        <p>Your OTP for email verification is:</p>
        <h1 style="letter-spacing:6px; color:#333;">${otp}</h1>
        <p>This OTP expires in <strong>${expiryMinutes} minutes</strong>.</p>
        <p>If you did not create an account, please ignore this email.</p>
      `,
    };
  }
}