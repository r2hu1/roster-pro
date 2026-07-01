import type { User } from "../user/types";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  logoKey: string | null;
  createdAt: Date;
  metadata: string | null;
  websiteId: string | null;
}

export interface Member {
  id: string;
  organizationId: Organization['id'];
  userId: User['id'];
  role: string;
  createdAt: Date;
}

export interface Invitation {
  id: string;
  organizationId: Organization['id'];
  email: string;
  role: string | null;
  status: string;
  createdAt: Date;
  expiresAt: Date;
  inviterId: User['id'];
}
