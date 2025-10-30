import { Navbar } from '../components/Navbar';
import { WishCard } from '../components/WishCard';
import { EventCard } from '../components/EventCard';
import { GiftCard } from '../components/GiftCard';
import { Loader } from '../components/Loader';
import { useWish, useWishEvents, useWishGifts } from '../features/wishes/hooks';

export const WishDetail = ({ id }: { id: number }) => {
  const { data: wish, isLoading: wishLoading, error: wishError } = useWish(id);
  const { data: events, isLoading: eventsLoading, error: eventsError } = useWishEvents(id);
  const { data: gifts, isLoading: giftsLoading, error: giftsError } = useWishGifts(id);

  const isLoading = wishLoading || eventsLoading || giftsLoading;
  const hasError = wishError || eventsError || giftsError;

  return {
    render: () => {
      if (isLoading) return 'Loading...';
      if (hasError) return 'Error loading wish details';
      if (!wish) return 'Wish not found';
      
      return 'Wish Detail page';
    },
  };
};