import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './routes/Home'
import WishDetail from './routes/WishDetail'
import Admin from './routes/Admin'
import Login from './routes/Login'
import Register from './routes/Register'

function App() {
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/wish/:id" element={<WishDetail />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App