// Create a simple query client for now
// Will be replaced with actual React Query client after dependencies are installed
export const queryClient = {
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
};

// Mock React Query hooks for development
export const useQuery = () => ({ data: null, isLoading: false, error: null });
export const useMutation = () => ({ mutate: () => {}, isLoading: false });