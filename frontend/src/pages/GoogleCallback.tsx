import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GoogleCallback: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');

    if (code) {
      // In a real app, you'd send this to your backend to exchange for a token
      console.log('Authorization code:', code);

      const backendUrl = `${import.meta.env.VITE_API_URL}/auth/google/callback`;

      fetch(`${backendUrl}?code=${code}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(data => {
          console.log('Backend response:', data);
          // TODO: Handle the JWT token (e.g., store it in context/local storage)
        })
        .catch(error => {
          console.error('Error exchanging code for token:', error);
        });
    }
  }, [location]);

  return <div>Loading...</div>;
};

export default GoogleCallback;
