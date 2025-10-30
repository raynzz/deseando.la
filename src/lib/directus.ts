import type { 
  WishesQueryParams,
  EventsQueryParams,
  GiftsQueryParams,
  UserInfo,
  Wish,
  Event,
  Gift
} from '../features/wishes/types';

// Environment variables - Vite usa import.meta.env
const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'https://hoztlat-regalos.6vlrrp.easypanel.host';
const DIRECTUS_TOKEN = import.meta.env.VITE_DIRECTUS_TOKEN || '8CzN175Z3ibcoDZQRnD3v86AkZAcoaeh';

console.log('Configuración Directus:', { 
  DIRECTUS_URL, 
  DIRECTUS_TOKEN: DIRECTUS_TOKEN ? '***' : 'No configurado' 
});

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
const getAuthHeaders = (_method: string = 'GET') => {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  
  if (DIRECTUS_TOKEN && DIRECTUS_TOKEN.trim()) {
    headers['Authorization'] = `Bearer ${DIRECTUS_TOKEN.trim()}`;
  }
  
  return headers;
};

// API helper function
export const api = async <T>(
  path: string, 
  options: {
    method?: string;
    body?: any;
    params?: Record<string, any>;
  } = {}
): Promise<ApiResponse<T> | ApiItemResponse<T>> => {
  try {
    const { method = 'GET', body, params = {} } = options;
    
    console.log(`Llamando a API: ${method} ${path}`, { params, body });
    
    // Asegurarse de que la URL no esté vacía
    if (!DIRECTUS_URL) {
      throw new Error('DIRECTUS_URL no está configurada');
    }
    
    const url = new URL(DIRECTUS_URL.replace(/\/$/, '') + path);
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
    
    const fetchOptions: RequestInit = {
      method,
      headers: getAuthHeaders(method),
    };
    
    if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
      fetchOptions.body = JSON.stringify(body);
    }
    
    console.log('URL completa:', url.toString());
    console.log('Headers:', fetchOptions.headers);
    
    const response = await fetch(url.toString(), fetchOptions);
    
    console.log(`Respuesta HTTP: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(`No autorizado. Verifica tu token o permisos. Status: ${response.status}`);
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    console.log('Respuesta JSON:', responseData);
    
    return responseData;
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
      console.log('No hay token configurado, no se puede obtener usuario');
      return null;
    }
    
    console.log('Intentando obtener usuario actual...');
    const response = await api<{ data: UserInfo }>('/users/me', { method: 'GET' });
    console.log('Usuario obtenido:', (response as any).data);
    return (response as any).data;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// API endpoints
export const wishApi = {
  // List wishes with pagination and filters
  getWishes: async (params: WishesQueryParams = {}): Promise<ApiResponse<Wish>> => {
    console.log('Obteniendo lista de deseos con params:', params);
    
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
    
    console.log('Params finales para obtener deseos:', defaultParams);
    
    const response = await api<Wish>('/items/wishes', {
      method: 'GET',
      params: defaultParams
    });
    
    console.log('Respuesta de deseos:', response);
    return response as ApiResponse<Wish>;
  },
  
  // Get single wish
  getWish: async (id: number): Promise<ApiItemResponse<Wish>> => {
    console.log(`Obteniendo deseo con id: ${id}`);
    
    const response = await api<Wish>(`/items/wishes/${id}`, {
      method: 'GET',
      params: {
        fields: 'id,title,description,status,visibility,goal_amount,collected_amount,cover_image,owner'
      }
    });
    
    console.log(`Respuesta de deseo ${id}:`, response);
    return response as ApiItemResponse<Wish>;
  },
  
  // Get events for a wish
  getEvents: async (wishId: number, params: EventsQueryParams = {}): Promise<ApiResponse<Event>> => {
    console.log(`Obteniendo eventos para deseo: ${wishId}`, params);
    
    const response = await api<Event>('/items/events', {
      method: 'GET',
      params: {
        fields: 'id,title,description,date,location',
        'filter[wish][_eq]': wishId,
        sort: '-date',
        limit: 20,
        ...params,
      }
    });
    
    console.log(`Respuesta de eventos ${wishId}:`, response);
    return response as ApiResponse<Event>;
  },
  
  // Get gifts for a wish
  getGifts: async (wishId: number, params: GiftsQueryParams = {}): Promise<ApiResponse<Gift>> => {
    console.log(`Obteniendo regalos para deseo: ${wishId}`, params);
    
    const response = await api<Gift>('/items/gifts', {
      method: 'GET',
      params: {
        fields: 'id,title,description,price,status,image',
        'filter[wish][_eq]': wishId,
        sort: '-id',
        limit: 20,
        ...params,
      }
    });
    
    console.log(`Respuesta de regalos ${wishId}:`, response);
    return response as ApiResponse<Gift>;
  },
  
  // Create wish (prepared for future use)
  createWish: async (wishData: Partial<Wish>): Promise<ApiItemResponse<Wish>> => {
    if (!DIRECTUS_TOKEN || !DIRECTUS_TOKEN.trim()) {
      throw new Error('Authentication required to create wishes');
    }
    
    const response = await api<Wish>('/items/wishes', {
      method: 'POST',
      body: wishData
    });
    return response as ApiItemResponse<Wish>;
  },
};

// Export types for convenience
export type { Wish, Event, Gift };