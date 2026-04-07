import VendorSection from './VendorSection.jsx';
import { ShoppingCart } from 'lucide-react';
import GoogleSignInButton from '../components/auth/GoogleSignInButton.jsx';
import FeaturesSection from './FeaturesSection.jsx';

const BRAND = '#C0474A';

export default function WelcomePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* ── Hero Section ── */}
      <section
        style={{
          minHeight: '100vh',
          background: ' #FFFBFB ',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <header
          style={{ backgroundColor: BRAND }}
          className="text-white px-8 py-4 flex items-center gap-4 shadow-md"
        >
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center flex-shrink-0">
            <ShoppingCart size={26} color={BRAND} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-tight">OrderUp</h1>
            <p className="text-sm opacity-90 leading-tight">
              University Food Ordering Platform
            </p>
          </div>
        </header>

        <main className="flex-1 flex flex-col justify-center px-16 py-20">
          <div className="max-w-2xl">
            <h2
              className="font-extrabold leading-tight text-gray-900"
              style={{ fontSize: '4.5rem' }}
            >
              Skip the Queue,
            </h2>
            <h2
              className="font-extrabold leading-tight"
              style={{ fontSize: '4.5rem', color: BRAND }}
            >
              Order Ahead
            </h2>
            <p
              className="text-gray-800 mt-8 leading-relaxed max-w-md"
              style={{ fontSize: '1.15rem' }}
            >
              OrderUp is your university food court's digital ordering platform.
              Browse menus from multiple vendors, place your order, and collect
              your food without the wait.
            </p>
            <div className="mt-12">
              <GoogleSignInButton color={BRAND} />
            </div>
          </div>
        </main>
      </section>

      {/* ── Features and Vendor Section ── */}
      <FeaturesSection />
<VendorSection />
    </div>
  );
}