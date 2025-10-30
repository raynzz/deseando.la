import type { Gift } from '../features/wishes/types';

// Mock component for development
export const GiftCard = ({ gift }: { gift: Gift }) => {
  return {
    render: () => `GiftCard for: ${gift.title}`,
  };
};