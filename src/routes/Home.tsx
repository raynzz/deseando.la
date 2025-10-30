import { useWishes } from '../features/wishes/hooks'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'
import WishCard from '../components/WishCard'

const Home = () => {
  const { data: wishes, isLoading, error } = useWishes()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState 
        title="Error al cargar"
        description="No se pudieron cargar los deseos. Por favor, intenta de nuevo más tarde."
      />
    )
  }

  if (!wishes || wishes.length === 0) {
    return (
      <EmptyState 
        title="No se encontraron deseos"
        description="Aún no hay deseos públicos disponibles."
      />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {wishes.map((wish) => (
        <WishCard key={wish.id} wish={wish} />
      ))}
    </div>
  )
}

export default Home