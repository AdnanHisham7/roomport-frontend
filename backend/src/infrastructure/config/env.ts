/**
 * Centralised environment configuration.
 * All process.env access lives here — nothing else in the codebase reads process.env directly.
 * Missing required variables throw at startup so misconfiguration is caught immediately.
 */

const getRequired = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
};

const optional = (key: string, fallback = ''): string =>
  process.env[key] ?? fallback;

export const env = {
  NODE_ENV:  optional('NODE_ENV', 'development'),
  PORT:      optional('PORT', '5000'),
  APP_URL:   optional('APP_URL', 'http://localhost:3000'),

  MONGO_URI: getRequired('MONGO_URI'),

  JWT_ACCESS_SECRET:       getRequired('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET:      getRequired('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRES_IN:   optional('JWT_ACCESS_EXPIRES_IN',  '15m'),
  JWT_REFRESH_EXPIRES_IN:  optional('JWT_REFRESH_EXPIRES_IN', '7d'),
  JWT_AGREEMENT_SECRET:    getRequired('JWT_AGREEMENT_SECRET'),

  CLOUDINARY_CLOUD_NAME: getRequired('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY:    getRequired('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: getRequired('CLOUDINARY_API_SECRET'),

  EMAIL_HOST:     optional('EMAIL_HOST', 'smtp.gmail.com'),
  EMAIL_PORT:     optional('EMAIL_PORT', '587'),
  EMAIL_USER:     optional('EMAIL_USER'),
  EMAIL_PASS:     optional('EMAIL_PASS'),
  EMAIL_FROM:     optional('EMAIL_FROM', 'no-reply@brift.in'),

  TWILIO_ACCOUNT_SID:   optional('TWILIO_ACCOUNT_SID'),
  TWILIO_AUTH_TOKEN:    optional('TWILIO_AUTH_TOKEN'),
  TWILIO_PHONE_NUMBER:  optional('TWILIO_PHONE_NUMBER'),

  STRIPE_SECRET_KEY:          optional('STRIPE_SECRET_KEY'),
  STRIPE_WEBHOOK_SECRET:      optional('STRIPE_WEBHOOK_SECRET'),
  STRIPE_PAYMENT_SUCCESS_URL: optional('STRIPE_PAYMENT_SUCCESS_URL'),
  STRIPE_PAYMENT_CANCEL_URL:  optional('STRIPE_PAYMENT_CANCEL_URL'),

  REDIS_URL: optional('REDIS_URL', 'redis://localhost:6379'),

  FRONTEND_URL: optional('FRONTEND_URL', 'http://localhost:3000'),
} as const;

export type Env = typeof env;