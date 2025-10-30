import Navbar from '../components/Navbar'
import WishCard from '../components/WishCard'
import EventCard from '../components/EventCard'
import GiftCard from '../components/GiftCard'
import Loader from '../components/Loader'
import { useWish, useWishEvents, useWishGifts } from '../features/wishes/hooks'
import { useParams } from 'react-router-dom'

const WishDetail = () => {
  const { id } = useParams<{ id: string }>()
  const wishId = id ? parseInt(id, 10) : 0
  
  const { data: wish, isLoading: wishLoading, error: wishError } = useWish(wishId)
  const { data: events, isLoading: eventsLoading, error: eventsError } = useWishEvents(wishId)
  const { data: gifts, isLoading: giftsLoading, error: giftsError } = useWishGifts(wishId)

  const isLoading = wishLoading || eventsLoading || giftsLoading
  const hasError = wishError || eventsError || giftsError

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-brand mb-4">Error al cargar</h2>
        <p className="text-muted">No se pudieron cargar los detalles del deseo. Por favor, intenta de nuevo más tarde.</p>
      </div>
    )
  }

  if (!wish) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-brand mb-4">Deseo no encontrado</h2>
        <p className="text-muted">No se encontró el deseo que buscas.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <WishCard wish={wish} />
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">Eventos</h3>
          {events && events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-muted">No hay eventos asociados a este deseo.</p>
          )}
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-4">Regalos</h3>
          {gifts && gifts.length > 0 ? (
            <div className="space-y-4">
              {gifts.map((gift) => (
                <GiftCard key={gift.id} gift={gift} />
              ))}
            </div>
          ) : (
            <p className="text-muted">No hay regalos asociados a este deseo.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default WishDetail