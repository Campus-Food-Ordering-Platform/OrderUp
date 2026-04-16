import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

export default function AuthCallback() {
  const { user, getAccessTokenSilently, isLoading, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      // Still loading, wait
      if (isLoading) return;

      // Not authenticated at all, go to welcome page
      if (!isAuthenticated) {
        navigate('/');
        return;
      }

      // Authenticated but user not ready yet, wait
      if (!user) return;

      try {
        const token = await getAccessTokenSilently();

        const response = await fetch(
          `http://localhost:3000/api/auth/me/${user.sub}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.role === 'customer') navigate('/student-dashboard');
          if (data.role === 'vendor') navigate('/vendor-dashboard');
        } else {
          navigate('/role-selection');
        }
      } catch (error) {
        console.error('Error checking user:', error);
        navigate('/role-selection');
      }
    };

    checkUser();
  }, [user, isLoading, isAuthenticated]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh' 
    }}>
      <p>Loading...</p>
    </div>
  );
}