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

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-12 bg-gradient-to-r from-brand/10 to-brand/5 rounded-lg border border-line">
        <h1 className="text-4xl md:text-5xl font-bold text-brand mb-4">
          Deseandola
        </h1>
        <p className="text-xl text-muted mb-6 max-w-2xl mx-auto">
          Comparte tus deseos y sueños con el mundo. Una plataforma para transformar tus aspiraciones en realidad.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <div className="bg-white rounded-lg border border-line px-6 py-3">
            <div className="text-2xl font-bold text-brand">{wishes?.length || 0}</div>
            <div className="text-sm text-muted">Deseos Compartidos</div>
          </div>
          <div className="bg-white rounded-lg border border-line px-6 py-3">
            <div className="text-2xl font-bold text-brand">∞</div>
            <div className="text-sm text-muted">Posibilidades</div>
          </div>
        </div>
      </section>

      {/* Wishes Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-brand">
            Deseos Recientes
          </h2>
          <div className="text-sm text-muted">
            Mostrando {wishes?.length || 0} deseos
          </div>
        </div>

        {!wishes || wishes.length === 0 ? (
          <EmptyState
            title="No se encontraron deseos"
            description="Aún no hay deseos públicos disponibles. ¡Sé el primero en compartir uno!"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishes.map((wish) => (
              <WishCard key={wish.id} wish={wish} />
            ))}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gradient-to-r from-brand/5 to-transparent rounded-lg border border-line">
        <h2 className="text-2xl font-bold text-brand mb-8 text-center">
          Características de Deseandola
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-3">🌟</div>
            <h3 className="font-semibold text-brand mb-2">Comparte tus Deseos</h3>
            <p className="text-sm text-muted">
              Expresa tus aspiraciones y sueños de manera sencilla y visual.
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold text-brand mb-2">Define Metas</h3>
            <p className="text-sm text-muted">
              Establece objetivos claros y seguimiento de progreso para cada deseo.
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">🤝</div>
            <h3 className="font-semibold text-brand mb-2">Conecta con Otros</h3>
            <p className="text-sm text-muted">
              Comparte experiencias y apoya a otros en su camino hacia sus metas.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home