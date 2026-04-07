import { UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GoogleSignInButton({ color = '#C0474A' }) {
  const navigate = useNavigate();
  return (
    <button
      className="flex items-center gap-3 text-white font-semibold rounded-full shadow-md hover:opacity-90 transition"
      style={{ backgroundColor: color, fontSize: '1.1rem', padding: '0.85rem 2rem' }}
     onClick={() => navigate('/role-selection')}
    >
      <UserRound size={20} color="white" strokeWidth={2} />
      Sign in with Google
    </button>
  );
}