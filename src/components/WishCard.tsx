import type { Wish } from '../features/wishes/types'
import { Link } from 'react-router-dom'

interface WishCardProps {
  wish: Wish
}

const WishCard = ({ wish }: WishCardProps) => {
  return (
    <div className="bg-white rounded-lg border border-line p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-brand">{wish.title}</h3>
        <span className="px-2 py-1 bg-pill text-pill-text text-xs rounded-full">
          {wish.status}
        </span>
      </div>
      
      {wish.description && (
        <p className="text-muted mb-4 line-clamp-2">{wish.description}</p>
      )}
      
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-pill text-pill-text text-xs rounded-full">
            {wish.visibility}
          </span>
          {typeof wish.goal_amount === 'number' && (
            <span className="px-2 py-1 bg-pill text-pill-text text-xs rounded-full">
              Meta: ${wish.goal_amount}
            </span>
          )}
        </div>
        
        <Link 
          to={`/wish/${wish.id}`} 
          className="text-brand hover:text-brand/80 text-sm font-medium"
        >
          Ver detalles →
        </Link>
      </div>
    </div>
  )
}

export default WishCard