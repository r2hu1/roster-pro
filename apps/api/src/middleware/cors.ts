import { cors } from 'hono/cors';

export const corsMiddleware = cors({
  origin: async (origin) => {
    if (!origin) return null;

    const appDomain = process.env.BETTER_AUTH_URL!.replace(/^https?:\/\//, '');

    if (origin.endsWith(appDomain) || origin.includes(appDomain)) return origin;
    if (origin.startsWith('http://localhost')) return origin;

    return null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-KEY'],
  credentials: true,
  maxAge: 86400,
});
