export interface CreateOrganizationDto {
  name: string;
  slug: string;
  logo?: string | null;
  logoKey?: string | null;
  metadata?: Record<string, unknown>;
  websiteId?: string | null;
  address?: string | null;
}

export interface UpdateOrganizationDto {
  name?: string;
  slug?: string;
  logo?: string | null;
  logoKey?: string | null;
  metadata?: Record<string, unknown> | null;
  websiteId?: string | null;
  address?: string | null;
}

export interface UpdateMemberDto {
  role?: string;
}
