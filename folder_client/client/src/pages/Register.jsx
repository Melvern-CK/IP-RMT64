import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Register.css';
import http from '../libs/http';
const Register = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [username, setName] = useState("")
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate()


  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h1>Create Account</h1>
            <p>Join the Pokémon Battle Hub community</p>
          </div>

          <form className="register-form" onSubmit= {async (event) => {
            event.preventDefault();
            setLoading(true);
            try {
              const response = await http.post('/auth/register', {
                email: email,
                password: password,
                username: username
              });
              navigate("/login");
            } catch (error) {
                console.log(error);
                
              let message = error && error.response && error.response.data && error.response.data.message;
              Swal.fire({
                title: 'Error!',
                text: message || "Something went wrong!",
                icon: 'error',
              });
            } finally {
              setLoading(false);
            }
          }}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={event => {setName(event.target.value)}}
                placeholder="Enter your username"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={event => {setEmail(event.target.value)}}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={event => {setPassword(event.target.value)}}
                placeholder="Enter your password"
                required
                disabled={loading}
                minLength="6"
              />
            </div>


            <button 
              type="submit" 
              className="register-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="register-footer">
            <p>
              Already have an account? 
              <Link to="/login" className="login-link"> Sign in here</Link>
            </p>
            <p>
              <Link to="/" className="home-link">← Back to Home</Link>
            </p>
          </div>
        </div>

        <div className="register-artwork">
          <div className="pokemon-silhouettes">
            <div className="pokemon-silhouette pokemon-1">⚡</div>
            <div className="pokemon-silhouette pokemon-2">🔥</div>
            <div className="pokemon-silhouette pokemon-3">💧</div>
            <div className="pokemon-silhouette pokemon-4">🌿</div>
          </div>
          <h2>Start Your Journey</h2>
          <p>Create an account to build your team, track your progress, and battle with other trainers!</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
