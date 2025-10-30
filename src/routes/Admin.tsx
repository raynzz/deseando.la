const Admin = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-line p-8">
        <h1 className="text-3xl font-bold text-brand mb-6">Panel de Administración</h1>
        
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-semibold text-brand mb-4">En Desarrollo</h2>
          <p className="text-muted">
            La funcionalidad de administración está en construcción. Pronto podrás gestionar deseos, eventos y regalos.
          </p>
        </div>
        
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-6 border border-line">
            <h3 className="font-semibold text-brand mb-2">Gestión de Deseos</h3>
            <p className="text-muted text-sm">Crear, editar y eliminar deseos</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 border border-line">
            <h3 className="font-semibold text-brand mb-2">Gestión de Eventos</h3>
            <p className="text-muted text-sm">Administrar eventos asociados a deseos</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 border border-line">
            <h3 className="font-semibold text-brand mb-2">Gestión de Regalos</h3>
            <p className="text-muted text-sm">Gestionar regalos y contribuciones</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin