import { UserRound } from 'lucide-react';

export default function GoogleSignInButton({ color = '#C0474A' }) {
  return (
    <button
      className="flex items-center gap-3 text-white font-semibold rounded-full shadow-md hover:opacity-90 transition"
      style={{ backgroundColor: color, fontSize: '1.1rem', padding: '0.85rem 2rem' }}
      onClick={() => console.log('Google Sign-In clicked')}
    >
      <UserRound size={20} color="white" strokeWidth={2} />
      Sign in with Google
    </button>
  );
}