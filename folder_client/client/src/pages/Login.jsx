import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import Swal from 'sweetalert2'
import http from '../libs/http';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();


  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Welcome Back</h1>
            <p>Sign in to your Pokémon Battle Hub account</p>
          </div>

          <form className="login-form" onSubmit={ async  (event) => {
            event.preventDefault();
            setLoading(true);
            try {
                const response = await http.post('/auth/login', {
                    email: email,
                    password: password
                })
                
                // Use the AuthContext login function
                login(response.data.token, response.data.user);
                
                setLoading(false);
                navigate("/pokemon")                         
            } catch (error) {
                console.log(error, "<<<<");
                setLoading(false);
                let message = error && error.response && error.response.data && error.response.data.message
                Swal.fire({
                    title: 'Error!',
                    text: message || "Something went wrong!",
                    icon: 'error',
                })
            }
          }}>
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
              />
            </div>


            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Don't have an account? 
              <Link to="/register" className="register-link"> Create one here</Link>
            </p>
            <p>
              <Link to="/" className="home-link">← Back to Home</Link>
            </p>
          </div>
        </div>

        <div className="login-artwork">
          <div className="pokeball-animation">
            <div className="pokeball">
              <div className="pokeball-top"></div>
              <div className="pokeball-middle"></div>
              <div className="pokeball-bottom"></div>
              <div className="pokeball-center"></div>
            </div>
          </div>
          <h2>Ready to Battle?</h2>
          <p>Sign in to access your teams, continue your journey, and challenge other trainers!</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
