import { ShoppingCart, Clock, Bell } from 'lucide-react';

const BRAND = '#C0474A';

function FeatureCard({ iconBg, title, description, children }) {
  return (
    <article
      style={{
        backgroundColor: '#FFF8F6',
        borderRadius: '1.25rem',
        padding: '2rem 1.75rem',
        border: '1px solid #F0E0DE',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '14px',
          backgroundColor: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        {children}
      </div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.95rem', color: '#888', margin: 0, lineHeight: 1.6 }}>
        {description}
      </p>
    </article>
  );
}

export default function FeaturesSection() {
  return (
    <section
      id="features"
      style={{
        minHeight: '100vh',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
      }}
    >
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.6rem', fontWeight: 800, color: '#1a1a2e' }}>
          Why Students Love{' '}
          <span style={{ color: BRAND }}>Orderup</span>
        </h2>
        <p style={{ fontSize: '1.1rem', color: '#888', marginTop: '0.75rem' }}>
          Save time and never miss a class because of long queues
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
          maxWidth: '900px',
          width: '100%',
        }}
      >
        <FeatureCard
          iconBg={BRAND}
          title="Multi-vendor Ordering"
          description="Browse and order from multiple food vendors in one platform. Pizza, burgers, sushi, and more - all in one cart."
        >
          <ShoppingCart size={26} color="white" strokeWidth={2} />
        </FeatureCard>

        <FeatureCard
          iconBg="#4A90D9"
          title="Real-Time Tracking"
          description="Track your order status from confirmation to ready for pickup. Get notified when your food is ready to collect."
        >
          <Clock size={26} color="white" strokeWidth={2} />
        </FeatureCard>

        <FeatureCard
          iconBg="#4CAF50"
          title="Smart Notifications"
          description="Receive instant notifications when your order is confirmed, being prepared, and ready for collection."
        >
          <Bell size={26} color="white" strokeWidth={2} />
        </FeatureCard>
      </div>
    </section>
  );
}