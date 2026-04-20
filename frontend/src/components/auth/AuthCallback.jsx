import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    if (!user) return;

    const checkUser = async () => {
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
          localStorage.setItem('orderup_user', JSON.stringify(data));
          if (data.role === 'customer') navigate('/student-dashboard');
          else if (data.role === 'vendor') navigate('/vendor-dashboard');
          else navigate('/role-selection');
        } else {
          navigate('/role-selection');
        }
      } catch (error) {
        console.error('Error checking user:', error);
        navigate('/role-selection');
      }
    };

    checkUser();
  }, [user]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <p>Loading...</p>
    </div>
  );
}