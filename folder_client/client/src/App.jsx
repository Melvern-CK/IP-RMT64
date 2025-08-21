import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Navbar from './components/Navbar'
import AllPokemon from './pages/AllPokemon'
import PokemonDetail from './pages/PokemonDetail'
import Register from './pages/Register'
import Login from './pages/Login'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pokemon" element={<AllPokemon />} />
            <Route path="/pokemon/:id" element={<PokemonDetail />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

// Simple Home component
function Home() {
  return (
    <div className="home">
      <div className="hero">
        <h1>Welcome to Pokémon Battle Hub</h1>
        <p>Discover, collect, and battle with your favorite Pokémon!</p>
        <Link to="/pokemon" className="cta-button">
          Explore Pokémon
        </Link>
      </div>
    </div>
  )
}

export default App
