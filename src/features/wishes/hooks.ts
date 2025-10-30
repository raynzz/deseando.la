// Mock hooks for development - will be replaced with actual React Query hooks
import { wishApi, getCurrentUser } from '../../lib/directus';
import type { Wish, Event, Gift, UserInfo } from './types';

// Hook para obtener la información del usuario actual
export const useCurrentUser = () => {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
};

// Hook para obtener la lista de deseos
export const useWishes = (params: {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
} = {}) => {
  return {
    data: [],
    isLoading: false,
    error: null,
  };
};

// Hook para obtener un deseo específico
export const useWish = (id: number) => {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
};

// Hook para obtener eventos de un deseo
export const useWishEvents = (wishId: number) => {
  return {
    data: [],
    isLoading: false,
    error: null,
  };
};

// Hook para obtener regalos de un deseo
export const useWishGifts = (wishId: number) => {
  return {
    data: [],
    isLoading: false,
    error: null,
  };
};

// Mock mutations for development
export const useCreateWish = () => ({
  mutate: () => {},
  isLoading: false,
});

export const useUpdateWish = () => ({
  mutate: () => {},
  isLoading: false,
});

export const useDeleteWish = () => ({
  mutate: () => {},
  isLoading: false,
});

export const useCreateEvent = () => ({
  mutate: () => {},
  isLoading: false,
});

export const useCreateGift = () => ({
  mutate: () => {},
  isLoading: false,
});

export const useUpdateGift = () => ({
  mutate: () => {},
  isLoading: false,
});

export const useDeleteGift = () => ({
  mutate: () => {},
  isLoading: false,
});