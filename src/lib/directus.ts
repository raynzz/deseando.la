import type { 
  WishesQueryParams,
  EventsQueryParams,
  GiftsQueryParams,
  UserInfo,
  Wish,
  Event,
  Gift
} from '../features/wishes/types';

// Environment variables
const DIRECTUS_URL = import.meta.env?.VITE_DIRECTUS_URL || '';
const DIRECTUS_TOKEN = import.meta.env?.VITE_DIRECTUS_TOKEN || '';

// API response types
interface ApiResponse<T> {
  data: T[];
  meta?: {
    total_count: number;
  };
}

interface ApiItemResponse<T> {
  data: T;
}

// Helper function to add authentication headers
const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };
  
  if (DIRECTUS_TOKEN && DIRECTUS_TOKEN.trim()) {
    headers['Authorization'] = `Bearer ${DIRECTUS_TOKEN.trim()}`;
  }
  
  return headers;
};

// API helper function
export const api = async <T>(
  path: string, 
  params: Record<string, any> = {}
): Promise<ApiResponse<T> | ApiItemResponse<T>> => {
  try {
    const url = new URL(DIRECTUS_URL.replace(/\/$/, '') + path);
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
    
    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('No autorizado. Verifica tu token o permisos.');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Directus API Error:', error);
    throw error;
  }
};

// Public wishes filter (when no token is provided)
export const getPublicWishesFilter = () => {
  return {
    'filter[visibility][_eq]': 'public'
  };
};

// User info endpoint
export const getCurrentUser = async (): Promise<UserInfo | null> => {
  try {
    if (!DIRECTUS_TOKEN || !DIRECTUS_TOKEN.trim()) {
      return null;
    }
    
    const response = await api<{ data: UserInfo }>('/users/me', {});
    return (response as any).data;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// API endpoints
export const wishApi = {
  // List wishes with pagination and filters
  getWishes: async (params: WishesQueryParams = {}) => {
    const defaultParams = {
      fields: 'id,title,description,status,visibility,goal_amount,collected_amount,cover_image',
      sort: '-id',
      limit: 12,
      offset: 0,
      ...getPublicWishesFilter(),
      ...params,
    };
    
    // Add search functionality
    if (params.search) {
      (defaultParams as any)['_or[0][title][_icontains]'] = params.search;
      (defaultParams as any)['_or[1][description][_icontains]'] = params.search;
    }
    
    return api<Wish>('/items/wishes', defaultParams);
  },
  
  // Get single wish
  getWish: async (id: number) => {
    return api<Wish>(`/items/wishes/${id}`, {
      fields: 'id,title,description,status,visibility,goal_amount,collected_amount,cover_image,owner'
    });
  },
  
  // Get events for a wish
  getEvents: async (wishId: number, params: EventsQueryParams = {}) => {
    return api<Event>('/items/events', {
      fields: 'id,title,description,date,location',
      'filter[wish][_eq]': wishId,
      sort: '-date',
      limit: 20,
      ...params,
    });
  },
  
  // Get gifts for a wish
  getGifts: async (wishId: number, params: GiftsQueryParams = {}) => {
    return api<Gift>('/items/gifts', {
      fields: 'id,title,description,price,status,image',
      'filter[wish][_eq]': wishId,
      sort: '-id',
      limit: 20,
      ...params,
    });
  },
  
  // Create wish (prepared for future use)
  createWish: async (wishData: Partial<Wish>) => {
    if (!DIRECTUS_TOKEN || !DIRECTUS_TOKEN.trim()) {
      throw new Error('Authentication required to create wishes');
    }
    
    return api<Wish>('/items/wishes', {
      method: 'POST',
      body: wishData,
    });
  },
};

// Export types for convenience
export type { Wish, Event, Gift };