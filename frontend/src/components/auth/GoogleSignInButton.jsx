export default function GoogleSignInButton() {
  return (
    <button
      className="flex items-center gap-3 text-white font-semibold px-6 py-3 rounded-full shadow-md hover:opacity-90 transition"
      style={{ backgroundColor: '#CF3030' }}
      onClick={() => console.log('Google Sign-In clicked')}
    >
      <span className="text-lg">👤</span>
      Sign in with Google
    </button>
  );
}