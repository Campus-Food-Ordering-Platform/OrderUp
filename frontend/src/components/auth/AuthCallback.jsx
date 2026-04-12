import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

export default function AuthCallback() {
  const { user, getAccessTokenSilently, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      if (isLoading || !user) return;

      try {
        const token = await getAccessTokenSilently();

        // Check if user exists in your backend
        const response = await fetch(
  `http://localhost:3000/api/auth/me/${user.sub}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.ok) {
          // User exists → get their role and redirect
          const data = await response.json();
          if (data.role === 'customer') navigate('/student-dashboard');
          if (data.role === 'vendor') navigate('/vendor-dashboard');
        } else {
          // User doesn't exist → go to role selection
          navigate('/role-selection');
        }
      } catch (error) {
        console.error('Error checking user:', error);
        navigate('/role-selection');
      }
    };

    checkUser();
  }, [user, isLoading]);

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