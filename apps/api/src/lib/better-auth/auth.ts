import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "../../core/db/client.js"
import { organization } from "better-auth/plugins"
import { polarClient } from "../../core/polar/client.js"
import { polar, checkout, portal, webhooks } from "@polar-sh/better-auth"
import { user as userSchema } from "../../core/db/schemas/auth.js"
import { eq } from "drizzle-orm"

export const auth = betterAuth({
  basePath: "/v1/auth",
  trustedOrigins: [
    process.env.BETTER_AUTH_URL!,
    "http://localhost:3000",
    "http://localhost:3001",
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  user: {
    additionalFields: {
      organizationId: { type: "string", optional: true },
    },
  },
  plugins: [
    organization({
      organizationHooks: {
        afterCreateOrganization: async ({ organization, user }) => {
          try {
            await db
              .update(userSchema)
              .set({ organizationId: organization.id })
              .where(eq(userSchema.id, user.id))
          } catch {}
        },
        afterDeleteOrganization: async ({ user }) => {
          try {
            await db
              .update(userSchema)
              .set({ organizationId: null })
              .where(eq(userSchema.id, user.id))
          } catch {}
        },
      },
    }),
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: process.env.POLAR_MONTHLY_PRODUCT_ID!,
              slug: "pro",
            },
          ],
          authenticatedUsersOnly: true,
        }),
        portal(),
        webhooks({
          secret: process.env.POLAR_WEBHOOK_SECRET!,
        }),
      ],
    }),
  ],
})
