// src/pages/FeaturesSection.jsx
import { ShoppingCart, Clock, Bell } from 'lucide-react';

const BRAND = '#C0474A';

const features = [
  {
    icon: <ShoppingCart size={26} color="white" strokeWidth={2} />,
    iconBg: '#E03C3C',
    title: 'Multi-vendor Ordering',
    description:
      'Browse and order from multiple food vendors in one platform. Pizza, burgers, sushi, and more - all in one cart.',
    highlighted: false,
  },
  {
    icon: <Clock size={26} color="white" strokeWidth={2} />,
    iconBg: '#4A90D9',
    title: 'Real-Time Tracking',
    description:
      'Track your order status from confirmation to ready for pickup. Get notified when your food is ready to collect.',
    highlighted: false,
  },
  {
    icon: <Bell size={26} color="white" strokeWidth={2} />,
    iconBg: '#4CAF50',
    title: 'Smart Notifications',
    description:
      'Receive instant notifications when your order is confirmed, being prepared, and ready for collection.',
    highlighted: true,
  },
];

function FeatureCard({ icon, iconBg, title, description, highlighted }) {
  return (
    <article
      style={{
        backgroundColor: 'white',
        borderRadius: '1.25rem',
        padding: '2rem 1.75rem',
        border: highlighted ? '2px solid #4A90D9' : '1px solid #EBEBEB',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
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
        }}
      >
        {icon}
      </div>

      <h3
        className="font-bold text-gray-900"
        style={{ fontSize: '1.2rem', margin: 0 }}
      >
        {title}
      </h3>

      <p
        className="text-gray-500 leading-relaxed"
        style={{ fontSize: '0.95rem', margin: 0 }}
      >
        {description}
      </p>
    </article>
  );
}

export default function FeaturesSection() {
  return (
    <section
      style={{
        minHeight: '100vh',
        backgroundColor: '#FAFAF8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
      }}
    >
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2
          className="font-bold text-gray-900"
          style={{ fontSize: '2.6rem' }}
        >
          Why Students Love{' '}
          <span style={{ color: BRAND }}>Orderup</span>
        </h2>
        <p
          className="text-gray-500 mt-3"
          style={{ fontSize: '1.1rem' }}
        >
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
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
}