import React, { useState } from 'react';
import { GoogleLogin as GoogleLoginButton, GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';

interface GoogleLoginProps {
  onSuccess: (user: any) => void;
  onError: (error: any) => void;
  disabled?: boolean;
}

const GoogleLogin: React.FC<GoogleLoginProps> = ({ onSuccess, onError, disabled = false }) => {
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
    setLoading(true);
    try {
      if ('getAuthResponse' in response) {
        const authResponse = response.getAuthResponse();
        const profile = response.getBasicProfile();
        
        // Extract user information
        const userInfo = {
          googleId: profile.getId(),
          email: profile.getEmail(),
          name: profile.getName(),
          givenName: profile.getGivenName(),
          familyName: profile.getFamilyName(),
          imageUrl: profile.getImageUrl(),
          idToken: authResponse.id_token
        };

        // Send to backend for verification and user creation
        const backendResponse = await fetch(`${process.env.REACT_APP_API_URL || 'https://publicpulse-backend.onrender.com'}/api/users/auth/google/verify-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id_token: authResponse.id_token
          })
        });

        if (backendResponse.ok) {
          const authData = await backendResponse.json();
          
          // Store auth token
          localStorage.setItem('auth_token', authData.access_token);
          localStorage.setItem('user', JSON.stringify(authData.user));
          
          onSuccess(authData.user);
        } else {
          const errorData = await backendResponse.json();
          onError(errorData.detail || 'Authentication failed');
        }
      }
    } catch (error) {
      console.error('Google login error:', error);
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (error: any) => {
    console.error('Google login failed:', error);
    onError(error);
  };

  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

  if (!clientId) {
    return (
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#f8f9fa', 
        border: '1px solid #dee2e6', 
        borderRadius: '4px',
        textAlign: 'center',
        color: '#6c757d'
      }}>
        Google Login not configured. Please set REACT_APP_GOOGLE_CLIENT_ID environment variable.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '300px' }}>
      <GoogleLoginButton
        clientId={clientId}
        buttonText={loading ? "Signing in..." : "Sign in with Google"}
        onSuccess={handleSuccess}
        onFailure={handleError}
        cookiePolicy={'single_host_origin'}
        isSignedIn={false}
        disabled={disabled || loading}
        style={{
          width: '100%',
          height: '40px',
          fontSize: '14px',
          fontWeight: '500',
          backgroundColor: '#4285f4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
          opacity: disabled || loading ? 0.6 : 1,
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
        render={renderProps => (
          <button
            onClick={renderProps.onClick}
            disabled={renderProps.disabled || disabled || loading}
            style={{
              width: '100%',
              height: '40px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: disabled || loading ? 'not-allowed' : 'pointer',
              opacity: disabled || loading ? 0.6 : 1,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #ffffff40',
                  borderTop: '2px solid #ffffff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Signing in...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </>
            )}
          </button>
        )}
      />
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default GoogleLogin;
