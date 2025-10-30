import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './routes/Home'
import WishDetail from './routes/WishDetail'
import Admin from './routes/Admin'

function App() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/wish/:id" element={<WishDetail />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </div>
  )
}

export default App