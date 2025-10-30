export type Visibility = 'public' | 'private';
export type WishStatus = 'active' | 'completed' | 'archived';
export type GiftStatus = 'available' | 'reserved' | 'completed';

export interface Wish {
  id: number;
  title: string;
  description?: string | null;
  visibility: Visibility;           // default: 'public'
  goal_amount?: number | null;      // decimal
  collected_amount?: number | null; // decimal (default 0)
  status: WishStatus;               // default: 'active'
  owner?: string | null;            // uuid -> directus_users.id
  cover_image?: string | null;      // uuid -> directus_files.id
}

export interface Event {
  id: number;
  wish: number;          // m2o -> wishes.id
  title: string;
  description?: string | null;
  date?: string | null;  // ISO
  location?: string | null;
}

export interface Gift {
  id: number;
  wish: number;          // m2o -> wishes.id
  title: string;
  description?: string | null;
  price?: number | null; // decimal
  status: GiftStatus;    // default: 'available'
  image?: string | null; // uuid -> directus_files.id
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
export interface WishesQueryParams {
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

export interface GiftsQueryParams {
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