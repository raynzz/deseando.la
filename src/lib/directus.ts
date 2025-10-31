import type { 
  GiftsQueryParams,
  EventsQueryParams,
  ContributionsQueryParams,
  UserInfo,
  Gift,
  Event,
  Contribution
} from '../features/gifts/types';

// Environment variables - Vite usa import.meta.env
const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'https://hoztlat-regalos.6vlrrp.easypanel.host';
const DIRECTUS_TOKEN = import.meta.env.VITE_DIRECTUS_TOKEN || '8CzN175Z3ibcoDZQRnD3v86AkZAcoaeh';

console.log('🔗 Configuración Directus:', { 
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

// Public gifts filter (when no token is provided)
export const getPublicGiftsFilter = () => {
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
export const giftApi = {
  // List gifts with pagination and filters
  getGifts: async (params: GiftsQueryParams = {}): Promise<ApiResponse<Gift>> => {
    console.log('Obteniendo lista de regalos con params:', params);
    
    const defaultParams = {
      sort: '-id',
      limit: 12,
      offset: 0,
      ...getPublicGiftsFilter(),
      ...params,
    };
    
    // Add search functionality
    if (params.search) {
      (defaultParams as any)['_or[0][title][_icontains]'] = params.search;
      (defaultParams as any)['_or[1][description][_icontains]'] = params.search;
    }
    
    console.log('Params finales para obtener regalos:', defaultParams);
    
    const response = await api<Gift>('/items/gifts', {
      method: 'GET',
      params: defaultParams
    });
    
    console.log('Respuesta de regalos:', response);
    return response as ApiResponse<Gift>;
  },
  
  // Get single gift
  getGift: async (id: number): Promise<ApiItemResponse<Gift>> => {
    console.log(`Obteniendo regalo con id: ${id}`);
    
    const response = await api<Gift>(`/items/gifts/${id}`, {
      method: 'GET',
      params: {}
    });
    
    console.log(`Respuesta de regalo ${id}:`, response);
    return response as ApiItemResponse<Gift>;
  },
  
  // Get events for a gift
  getEvents: async (giftId: number, params: EventsQueryParams = {}): Promise<ApiResponse<Event>> => {
    console.log(`Obteniendo eventos para regalo: ${giftId}`, params);
    
    const response = await api<Event>('/items/events', {
      method: 'GET',
      params: {
        'filter[gift][_eq]': giftId,
        sort: '-date',
        limit: 20,
        ...params,
      }
    });
    
    console.log(`Respuesta de eventos ${giftId}:`, response);
    return response as ApiResponse<Event>;
  },
  
  // Get contributions for a gift
  getContributions: async (giftId: number, params: ContributionsQueryParams = {}): Promise<ApiResponse<Contribution>> => {
    console.log(`Obteniendo contribuciones para regalo: ${giftId}`, params);
    
    const response = await api<Contribution>('/items/contributions', {
      method: 'GET',
      params: {
        'filter[gift][_eq]': giftId,
        sort: '-date',
        limit: 20,
        ...params,
      }
    });
    
    console.log(`Respuesta de contribuciones ${giftId}:`, response);
    return response as ApiResponse<Contribution>;
  },
  
  // Create gift (prepared for future use)
  createGift: async (giftData: Partial<Gift>): Promise<ApiItemResponse<Gift>> => {
    if (!DIRECTUS_TOKEN || !DIRECTUS_TOKEN.trim()) {
      throw new Error('Authentication required to create gifts');
    }
    
    const response = await api<Gift>('/items/gifts', {
      method: 'POST',
      body: giftData
    });
    return response as ApiItemResponse<Gift>;
  },
};

// Collections API
export const collectionsApi = {
  // List collections
  getCollections: async () => {
    console.log('Obteniendo lista de colecciones...');
    
    const response = await api('/collections', {
      method: 'GET',
      params: {
        fields: 'collection,meta.icon',
        limit: -1
      }
    });
    
    console.log('Respuesta de colecciones:', response);
    return response as ApiResponse<any>;
  },
};

// Export types for convenience
export type { Gift, Event, Contribution };
