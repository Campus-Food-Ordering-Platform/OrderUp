import { ShoppingCart } from 'lucide-react';
import GoogleSignInButton from '../components/auth/GoogleSignInButton.jsx';
import FeaturesSection from './FeaturesSection.jsx';
import VendorSection from './VendorSection.jsx';

const BRAND = '#C0474A';

export default function WelcomePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      <section
        style={{
          minHeight: '100vh',
          backgroundColor: '#F7F5F2',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <header
          style={{ backgroundColor: BRAND }}
          className="text-white px-8 py-4 flex items-center gap-4 shadow-md"
        >
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center flex-shrink-0">
            <ShoppingCart size={26} color={BRAND} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-tight">OrderUp</h1>
            <p className="text-sm opacity-90 leading-tight">University Food Ordering Platform</p>
          </div>
        </header>

        {/* Hero Banner */}
        <div
          style={{
            margin: '24px',
            background: 'linear-gradient(135deg, #C0474A 0%, #E8726A 100%)',
            borderRadius: '24px',
            padding: '48px 40px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <h2
            style={{
              fontSize: '4rem',
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.1,
              marginBottom: '8px',
            }}
          >
            Skip the Queue,
          </h2>
          <h2
            style={{
              fontSize: '4rem',
              fontWeight: 800,
              color: 'rgba(255,255,255,0.85)',
              lineHeight: 1.1,
              marginBottom: '24px',
            }}
          >
            Order Ahead
          </h2>
          <p
            style={{
              fontSize: '1.1rem',
              color: 'rgba(255,255,255,0.85)',
              maxWidth: '420px',
              lineHeight: 1.7,
              marginBottom: '36px',
            }}
          >
            OrderUp is your university food court's digital ordering platform.
            Browse menus from multiple vendors, place your order, and collect
            your food without the wait.
          </p>
          <div>
            <GoogleSignInButton color="white" textColor={BRAND} />
          </div>
        </div>
      </section>

      <FeaturesSection />
      <VendorSection />
    </div>
  );
}