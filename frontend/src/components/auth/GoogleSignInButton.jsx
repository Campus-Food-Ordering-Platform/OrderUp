import { useAuth0 } from '@auth0/auth0-react';
import { UserRound } from 'lucide-react';

export default function GoogleSignInButton({ color = '#C0474A', textColor = 'white' }) {
  const { loginWithRedirect } = useAuth0();

  return (
    <button
      className="flex items-center gap-3 font-semibold rounded-full shadow-md hover:opacity-90 transition"
      style={{
        backgroundColor: color,
        color: textColor,
        fontSize: '1.1rem',
        padding: '0.85rem 2rem',
        border: 'none',
        cursor: 'pointer',
      }}
      onClick={() =>
        loginWithRedirect({
    authorizationParams: { 
      connection: 'google-oauth2',
      redirect_uri: `${window.location.origin}/auth/callback`
    },
  })
      }
    >
      <UserRound size={20} color={textColor} strokeWidth={2} />
      Sign in with Google
    </button>
  );
}