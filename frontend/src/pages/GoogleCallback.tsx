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
    const code = searchParams.get('code');

    if (code) {
      const backendUrl = `${import.meta.env.VITE_API_URL}/auth/google/callback`;
      const redirectUri = `${window.location.origin}/auth/google/callback`;

      fetch(`${backendUrl}?code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
        .then(response => response.json())
        .then(data => {
          if (data.access_token) {
            return fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
              headers: { 'Authorization': `Bearer ${data.access_token}` },
            })
              .then(res => res.json())
              .then(user => {
                login(data.access_token, user);
                navigate('/dashboard');
              });
          } else {
            console.error('No token in response:', data);
            navigate('/auth');
          }
        })
        .catch(error => {
          console.error('Error during Google login:', error);
          navigate('/auth');
        });
    }
  }, [location, navigate, login]);

  return <div>Loading...</div>;
};

export default GoogleCallback;
