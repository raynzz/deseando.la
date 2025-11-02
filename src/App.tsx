import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './routes/Home'
import WishDetail from './routes/WishDetail'
import Admin from './routes/Admin'
import Login from './routes/Login'
import Register from './routes/Register'
import Dashboard from './routes/Dashboard'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-bg text-text flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/wish/:id" element={<WishDetail />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}

export default App