import { QueryClient } from '@tanstack/react-query'

// Create a React Query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 3,
    },
  },
})