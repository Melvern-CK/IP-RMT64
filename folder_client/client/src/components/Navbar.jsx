import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isLoggedIn, username, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of your account.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/');
        
        Swal.fire({
          title: 'Logged out!',
          text: 'You have been successfully logged out.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };
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
          <div className="nav-auth">
            {isLoggedIn ? (
              <>
                <span className="nav-welcome">
                  Welcome, {username}!
                </span>
                <button onClick={handleLogout} className="nav-link nav-logout">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link nav-login">
                  Sign In
                </Link>
                <Link to="/register" className="nav-link nav-register">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;