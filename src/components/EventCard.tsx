import type { Event } from '../features/wishes/types'

interface EventCardProps {
  event: Event
}

const EventCard = ({ event }: EventCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-white rounded-lg border border-line p-4">
      <h4 className="font-semibold text-brand mb-2">{event.title}</h4>
      <div className="text-sm text-muted space-y-1">
        <div>📅 {event.date ? formatDate(event.date) : 'Fecha no especificada'}</div>
        {event.location && <div>📍 {event.location}</div>}
      </div>
    </div>
  )
}

export default EventCard