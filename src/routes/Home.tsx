// Mock page for development
import { useWishes } from '../features/wishes/hooks';

export const Home = () => {
  const { data: wishes, isLoading, error } = useWishes();

  return {
    render: () => {
      if (isLoading) return 'Loading...';
      if (error) return 'Error loading wishes';
      if (!wishes || wishes.length === 0) return 'No wishes found';
      return `Home page with ${wishes.length} wishes`;
    },
  };
};