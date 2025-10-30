import type { Wish } from '../features/wishes/types';

// Mock component for development
export const WishCard = ({ wish }: { wish: Wish }) => {
  return {
    render: () => `WishCard for: ${wish.title}`,
  };
};