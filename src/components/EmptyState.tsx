interface EmptyStateProps {
  title: string
  description: string
}

const EmptyState = ({ title, description }: EmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📭</div>
      <h3 className="text-xl font-semibold text-brand mb-2">{title}</h3>
      <p className="text-muted">{description}</p>
    </div>
  )
}

export default EmptyState