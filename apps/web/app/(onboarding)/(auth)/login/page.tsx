import LoginPageView from "@/modules/onboarding/views/ui/auth/auth-page-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
   <LoginPageView />
  )
}
