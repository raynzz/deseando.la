import type { Contribution } from '../features/gifts/types'

interface ContributionCardProps {
  contribution: Contribution
}

const ContributionCard = ({ contribution }: ContributionCardProps) => {
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
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-brand">Contribución anónima</h4>
        <span className="px-2 py-1 bg-pill text-muted text-xs rounded-full border border-line">
          {contribution.date ? formatDate(contribution.date) : 'Fecha no especificada'}
        </span>
      </div>
      
      {contribution.amount && (
        <div className="text-right mb-3">
          <span className="font-semibold text-brand">
            ${contribution.amount.toLocaleString('es-AR', {
              style: 'currency',
              currency: 'ARS'
            })}
          </span>
        </div>
      )}
      
      {contribution.message && (
        <p className="text-muted text-sm italic">"{contribution.message}"</p>
      )}
    </div>
  )
}

export default ContributionCard