/**
 * Access Control Component
 * Enforces role-based access control on the frontend
 * Prevents citizens from accessing official and admin portals
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AccessControlProps {
  children: React.ReactNode;
  allowedRoles: string[];
  userRole?: string;
}

const AccessControl: React.FC<AccessControlProps> = ({ 
  children, 
  allowedRoles, 
  userRole 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Get user role from localStorage or token
        const token = localStorage.getItem('auth_token');
        const storedUserRole = localStorage.getItem('user_role');
        
        // If no token, redirect to login
        if (!token) {
          console.log('No auth token found, redirecting to login');
          navigate('/');
          return;
        }

        // Use provided userRole or stored role
        const currentUserRole = userRole || storedUserRole;
        
        if (!currentUserRole) {
          console.log('No user role found, redirecting to login');
          navigate('/');
          return;
        }

        // Check if user role is allowed for this route
        if (!allowedRoles.includes(currentUserRole)) {
          console.log(`Access denied: Role ${currentUserRole} not allowed for ${location.pathname}`);
          
          // Redirect based on user role
          if (currentUserRole === 'citizen') {
            navigate('/citizen');
          } else if (currentUserRole === 'official') {
            navigate('/official');
          } else if (currentUserRole === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
          return;
        }

        // Access granted
        setIsAuthorized(true);
        
      } catch (error) {
        console.error('Error checking access:', error);
        navigate('/');
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [allowedRoles, userRole, navigate, location.pathname]);

  if (isChecking) {
    return (
      <div className="access-control-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <button 
            className="glass-btn glass-btn-primary"
            onClick={() => navigate('/')}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AccessControl;












