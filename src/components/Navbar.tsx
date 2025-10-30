import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm border-b border-line">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-brand">
            Deseandola
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-muted hover:text-brand transition-colors">
              Inicio
            </Link>
            <Link to="/admin" className="text-muted hover:text-brand transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar