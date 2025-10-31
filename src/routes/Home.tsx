import { useGifts } from '../features/gifts/hooks'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'
import GiftCard from '../components/GiftCard'

const Home = () => {
  const { data: gifts, isLoading, error } = useGifts()

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
        description="No se pudieron cargar los regalos. Por favor, intenta de nuevo más tarde."
      />
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-12 bg-gradient-to-r from-brand/10 to-brand/5 rounded-lg border border-line">
        <h1 className="text-4xl md:text-5xl font-bold text-brand mb-4">
          Regalos
        </h1>
        <p className="text-xl text-muted mb-6 max-w-2xl mx-auto">
          Comparte tus regalos y deseos con el mundo. Una plataforma para transformar tus aspiraciones en realidad.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <div className="bg-white rounded-lg border border-line px-6 py-3">
            <div className="text-2xl font-bold text-brand">{gifts?.length || 0}</div>
            <div className="text-sm text-muted">Regalos Compartidos</div>
          </div>
          <div className="bg-white rounded-lg border border-line px-6 py-3">
            <div className="text-2xl font-bold text-brand">🎁</div>
            <div className="text-sm text-muted">Deseos Cumplidos</div>
          </div>
        </div>
      </section>

      {/* Gifts Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-brand">
            Regalos Recientes
          </h2>
          <div className="text-sm text-muted">
            Mostrando {gifts?.length || 0} regalos
          </div>
        </div>

        {!gifts || gifts.length === 0 ? (
          <EmptyState 
            title="No se encontraron regalos"
            description="Aún no hay regalos públicos disponibles. ¡Sé el primero en compartir uno!"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gifts.map((gift) => (
              <GiftCard key={gift.id} gift={gift} />
            ))}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gradient-to-r from-brand/5 to-transparent rounded-lg border border-line">
        <h2 className="text-2xl font-bold text-brand mb-8 text-center">
          Características de Regalos
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-3">🎁</div>
            <h3 className="font-semibold text-brand mb-2">Comparte tus Regalos</h3>
            <p className="text-sm text-muted">
              Expresa tus deseos y regalos soñados de manera sencilla y visual.
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold text-brand mb-2">Define Metas</h3>
            <p className="text-sm text-muted">
              Establece objetivos claros y seguimiento de progreso para cada regalo.
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">🤝</div>
            <h3 className="font-semibold text-brand mb-2">Conecta con Otros</h3>
            <p className="text-sm text-muted">
              Comparte experiencias y apoya a otros en su camino hacia sus regalos soñados.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
