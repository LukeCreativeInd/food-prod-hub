export type CurrentProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

export type CurrentOrganisation = {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

export type CurrentMembership = {
  id: string;
  organisation_id: string;
  profile_id: string;
  role_key: string;
  team: string | null;
  access_level: string;
  status: string;
  invited_at: string | null;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  organisation: CurrentOrganisation | null;
};
