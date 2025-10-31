export type Visibility = 'public' | 'private';
export type GiftStatus = 'available' | 'reserved' | 'completed';
export type EventStatus = 'active' | 'completed' | 'cancelled';

export interface Gift {
  id: number;
  title: string;
  description?: string | null;
  visibility: Visibility;           // default: 'public'
  goal_amount?: number | null;      // decimal
  collected_amount?: number | null; // decimal (default 0)
  status: GiftStatus;               // default: 'available'
  owner?: string | null;            // uuid -> directus_users.id
  cover_image?: string | null;      // uuid -> directus_files.id
}

export interface Event {
  id: number;
  gift: number;          // m2o -> gifts.id
  title: string;
  description?: string | null;
  date?: string | null;  // ISO
  location?: string | null;
  status: EventStatus;
}

export interface Contribution {
  id: number;
  gift: number;          // m2o -> gifts.id
  amount: number;         // decimal
  message?: string | null;
  contributor?: string | null; // uuid -> directus_users.id
  date?: string | null;   // ISO
}

// Directus response types
export interface DirectusResponse<T> {
  data: T[];
  meta: {
    total_count: number;
  };
}

export interface DirectusItemResponse<T> {
  data: T;
}

// API query parameters
export interface GiftsQueryParams {
  fields?: string;
  filter?: Record<string, any>;
  sort?: string;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface EventsQueryParams {
  fields?: string;
  filter?: Record<string, any>;
  sort?: string;
  limit?: number;
}

export interface ContributionsQueryParams {
  fields?: string;
  filter?: Record<string, any>;
  sort?: string;
  limit?: number;
}

// User info from Directus
export interface UserInfo {
  id: string;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
}