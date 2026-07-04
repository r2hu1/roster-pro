import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { polarClient } from "@polar-sh/better-auth/client";

const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL!,
  basePath: "/v1/auth",
  plugins: [organizationClient(), polarClient()],
});

export { authClient };

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  resetPassword,
  accountInfo,
  deleteUser,
  listSessions,
  refreshToken,
} = authClient;
