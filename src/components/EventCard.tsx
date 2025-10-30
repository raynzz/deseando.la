import type { Event } from '../features/wishes/types';

// Mock component for development
export const EventCard = ({ event }: { event: Event }) => {
  return {
    render: () => `EventCard for: ${event.title}`,
  };
};