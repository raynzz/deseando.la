import type { Gift } from '../features/gifts/types'
import { Link } from 'react-router-dom'

interface GiftCardProps {
  gift: Gift
}

const GiftCard = ({ gift }: GiftCardProps) => {
  return (
    <div className="bg-white rounded-lg border border-line p-4">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-brand">{gift.title}</h4>
        <span className="px-2 py-1 bg-pill text-muted text-xs rounded-full border border-line">
          {gift.status}
        </span>
      </div>
      
      {gift.description && (
        <p className="text-muted text-sm mb-3">{gift.description}</p>
      )}
      
      {gift.goal_amount && (
        <div className="text-right">
          <span className="font-semibold text-brand">
            Meta: ${gift.goal_amount.toLocaleString('es-AR')}
          </span>
        </div>
      )}
      
      {gift.collected_amount && gift.collected_amount > 0 && (
        <div className="text-right">
          <span className="font-semibold text-brand">
            Recaudado: ${gift.collected_amount.toLocaleString('es-AR')}
          </span>
        </div>
      )}
      
      <div className="flex justify-between items-center mt-4">
        <Link
          to={`/gift/${gift.id}`}
          className="text-brand hover:text-brand/80 text-sm font-medium"
        >
          Ver detalles →
        </Link>
      </div>
    </div>
  )
}

export default GiftCard