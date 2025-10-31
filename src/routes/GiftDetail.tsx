import React from 'react'
import { useParams } from 'react-router-dom'
import { useGift, useGiftEvents, useGiftContributions } from '../features/gifts/hooks'
import type { Gift } from '../features/gifts/types'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'
import GiftCard from '../components/GiftCard'
import EventCard from '../components/EventCard'
import ContributionCard from '../components/ContributionCard'

const GiftDetail = () => {
  const { id } = useParams<{ id: string }>()
  const giftId = id ? parseInt(id, 10) : 0
  
  const { data: gift, isLoading: giftLoading, error: giftError } = useGift(giftId)
  const { data: events, isLoading: eventsLoading, error: eventsError } = useGiftEvents(giftId)
  const { data: contributions, isLoading: contributionsLoading, error: contributionsError } = useGiftContributions(giftId)

  const isLoading = giftLoading || eventsLoading || contributionsLoading
  const hasError = giftError || eventsError || contributionsError

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
        <p className="text-muted">No se pudieron cargar los detalles del regalo. Por favor, intenta de nuevo más tarde.</p>
      </div>
    )
  }

  if (!gift) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-brand mb-4">Regalo no encontrado</h2>
        <p className="text-muted">No se encontró el regalo que buscas.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="mb-8">
        <GiftCard gift={gift} />
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
            <p className="text-muted">No hay eventos asociados a este regalo.</p>
          )}
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-4">Contribuciones</h3>
          {contributions && contributions.length > 0 ? (
            <div className="space-y-4">
              {contributions.map((contribution) => (
                <ContributionCard key={contribution.id} contribution={contribution} />
              ))}
            </div>
          ) : (
            <p className="text-muted">No hay contribuciones asociadas a este regalo.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default GiftDetail