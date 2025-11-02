import { useEffect, useState } from 'react'

const Footer = () => {
  const [buildInfo, setBuildInfo] = useState({
    version: '1.0.0',
    buildTime: new Date().toLocaleString('es-AR'),
    commit: 'local'
  })

  useEffect(() => {
    // En producción, esta información vendrá de las variables de entorno
    const version = import.meta.env.VITE_APP_VERSION || '1.0.0'
    const buildTime = import.meta.env.VITE_BUILD_TIME || new Date().toLocaleString('es-AR')
    const commit = import.meta.env.VITE_GIT_COMMIT || 'local'
    
    setBuildInfo({
      version,
      buildTime,
      commit
    })
  }, [])

  return (
    <footer className="bg-white border-t border-line mt-12 py-6">
      <div className="mx-auto max-w-1560px px-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted">
          <div className="mb-2 md:mb-0">
            <span className="font-medium">Deseandola</span> - Plataforma de Deseos
          </div>
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 text-xs">
            <span>
              Versión: <span className="font-mono bg-pill px-2 py-1 rounded border border-line">{buildInfo.version}</span>
            </span>
            <span>
              Build: <span className="font-mono bg-pill px-2 py-1 rounded border border-line">{buildInfo.commit.substring(0, 7)}</span>
            </span>
            <span>
              Actualizado: <span className="font-mono bg-pill px-2 py-1 rounded border border-line">{buildInfo.buildTime}</span>
            </span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-line text-center text-xs text-muted">
          <p>Frontend: <span className="font-mono">hoztlat-deseandola.6vlrrp.easypanel.host</span></p>
          <p>Backend: <span className="font-mono">hoztlat-regalos.6vlrrp.easypanel.host</span></p>
          <p className="mt-1">© 2024 Deseandola. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer