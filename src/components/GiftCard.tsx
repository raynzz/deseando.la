import type { Gift } from '../features/wishes/types'

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
      
      {gift.price && (
        <div className="text-right">
          <span className="font-semibold text-brand">
            ${gift.price.toLocaleString('es-AR')}
          </span>
        </div>
      )}
    </div>
  )
}

export default GiftCard