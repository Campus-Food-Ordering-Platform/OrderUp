import { ShoppingCart } from 'lucide-react';
import GoogleSignInButton from '../components/auth/GoogleSignInButton.jsx';

export default function WelcomePage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(to right, #FFFBFB 0%, #FFCDD8 60%, #FF8FA3 100%)' }}
    >
      <header
        className="text-white px-8 py-4 flex items-center gap-4 shadow-md"
        style={{ backgroundColor: '#BA1C1C' }}
      >
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center flex-shrink-0">
          {/* Lucide cart icon, colored to match brand */}
          <ShoppingCart size={26} color="#BA1C1C" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-2xl font-bold leading-tight">OrderUp</h1>
          <p className="text-sm opacity-90 leading-tight">University Food Ordering Platform</p>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center px-16 py-20">
        <div className="max-w-2xl">
          <h2 className="font-extrabold leading-tight text-gray-900" style={{ fontSize: '4.5rem' }}>
            Skip the Queue,
          </h2>
          <h2 className="font-extrabold leading-tight" style={{ fontSize: '4.5rem', color: '#BA1C1C' }}>
            Order Ahead
          </h2>
          <p className="text-gray-800 mt-8 leading-relaxed max-w-md" style={{ fontSize: '1.15rem' }}>
            OrderUp is your university food court's digital ordering platform.
            Browse menus from multiple vendors, place your order, and collect your food without the wait.
          </p>
          <div className="mt-12">
            <GoogleSignInButton />
          </div>
        </div>
      </main>
    </div>
  );
}