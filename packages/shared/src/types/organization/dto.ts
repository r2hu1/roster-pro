export interface UpdateOrganizationDto {
  name?: string;
  slug?: string;
  logo?: string | null;
  logoKey?: string | null;
  metadata?: string | null;
  websiteId?: string | null;
}

export interface UpdateMemberDto {
  role?: string;
}
