import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          🔥 Pokémon Hub
        </Link>
        <div className="nav-menu">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/pokemon" className="nav-link">
            Pokémon
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;