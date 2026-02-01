import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.BACKEND_PORT || '5000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:5000',
  
  // Database
  databaseUrl: process.env.DATABASE_URL!,
  
  // JWT & Sessions
  jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret',
  sessionSecret: process.env.SESSION_SECRET || 'your-session-secret',
  jwtExpiry: '7d',
  
  // OAuth GitHub
  github: {
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    callbackUrl: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback',
  },
  
  // OAuth Google
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
  },
  
  // Discord Webhooks
  discord: {
    webhookGeneral: process.env.DISCORD_WEBHOOK_GENERAL,
    webhookAdmin: process.env.DISCORD_WEBHOOK_ADMIN,
    webhookPro: process.env.DISCORD_WEBHOOK_PRO,
    webhookCtf: process.env.DISCORD_WEBHOOK_CTF,
  },
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
