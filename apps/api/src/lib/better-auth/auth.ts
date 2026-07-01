import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../../core/db/client.js';
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
  basePath: '/v1/auth',
  trustedOrigins: [process.env.BETTER_AUTH_URL!, "http://localhost:3000", "http://localhost:3001"],
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    organization()
  ]
});
