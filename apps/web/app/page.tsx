import { authClient } from "@/lib/better-auth/client"
import { headers } from "next/headers"
import { redirect } from "next/navigation";

export default async function Page() {
  const { data, error } = await authClient.getSession({
    fetchOptions: {
      headers: await headers()
    }
  });

  if (!data?.session || error) {
    return redirect("/login");
  }

  const getOrganization = await authClient.organization.list({
    fetchOptions: {
      headers: await headers()
    }
  });
  if(getOrganization.data && !getOrganization.error) {
    const organization = getOrganization.data[0];
    if(!organization) {
      return redirect("/onboarding");
    }
    return redirect(`/${organization.id}`);
  }

  return null;
}
