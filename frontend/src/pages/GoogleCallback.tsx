import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const GoogleCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const searchParams = new URLSearchParams(location.search);
    const accessToken = searchParams.get('access_token');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      navigate('/auth');
      return;
    }

    if (accessToken) {
      fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      })
        .then(res => res.json())
        .then(user => {
          login(accessToken, user);
          navigate('/dashboard');
        })
        .catch(error => {
          console.error('Error fetching user info:', error);
          navigate('/auth');
        });
    } else {
      navigate('/auth');
    }
  }, [location, navigate, login]);

  return <div>Loading...</div>;
};

export default GoogleCallback;
