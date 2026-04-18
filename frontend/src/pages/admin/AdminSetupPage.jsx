import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { ShieldAlert } from 'lucide-react';

export default function AdminSetupPage() {
  const { user, getAccessTokenSilently, isAuthenticated, loginWithRedirect, isLoading } = useAuth0();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Initializing admin setup...');

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    let mounted = true;

    const setupAdmin = async () => {
      try {
        if (mounted) setStatus('Preparing admin credentials...');
        const token = await getAccessTokenSilently();
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            auth0Id: user?.sub,   
            name: user?.name || user?.given_name || 'System Admin',
            role: 'admin'
          })
        });

        if (response.ok) {
          if (mounted) setStatus('Admin account successfully set up! Redirecting to dashboard...');
          setTimeout(() => navigate('/admin-dashboard'), 1500);
        } else {
          if (mounted) setStatus('Failed to register setup. You might already be assigned a role.');
          setTimeout(() => navigate('/'), 2500);
        }
      } catch (error) {
        console.error('Admin setup error:', error);
        if (mounted) setStatus('An error occurred during setup. Check console.');
      }
    };

    setupAdmin();

    return () => {
      mounted = false;
    };
  }, [isLoading, isAuthenticated, user, getAccessTokenSilently, navigate]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#F7F5F2' 
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '2.5rem 2rem', 
        borderRadius: '16px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)', 
        textAlign: 'center', 
        maxWidth: '400px',
        width: '100%' 
      }}>
        <ShieldAlert size={48} color="#C0474A" style={{ marginBottom: '1.5rem', display: 'inline-block' }} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1a2e', marginBottom: '0.75rem' }}>
          Secret Admin Setup
        </h1>
        <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          {status}
        </p>
        
        {!isAuthenticated && !isLoading && (
          <button 
            onClick={() => loginWithRedirect({ appState: { returnTo: '/admin/setup' } })}
            style={{ 
              padding: '12px 24px', 
              background: 'linear-gradient(135deg, #C0474A 0%, #E8726A 100%)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '2rem', 
              fontWeight: 700, 
              cursor: 'pointer',
              width: '100%',
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(192,71,74,0.2)'
            }}
          >
            Log In via Google to Continue
          </button>
        )}
      </div>
    </div>
  );
}
