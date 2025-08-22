import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import http from '../libs/http';

const GoogleLoginButton = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Send the Google token to your backend for verification
      const response = await http.post('/auth/google', {
        token: credentialResponse.credential
      });

      if (response.data.success) {
        // Store the token and user info
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Update auth context - fix parameter order
        login(response.data.access_token, response.data.user);
        
        // Redirect to home page
        navigate('/');
      }
    } catch (error) {
      console.error('Google login error:', error);
      alert('Google login failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    console.error('Google login failed');
    alert('Google login failed. Please try again.');
  };

  return (
    <div className="google-login-container">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        theme="filled_blue"
        size="large"
        text="signin_with"
        shape="rectangular"
      />
    </div>
  );
};

export default GoogleLoginButton;
