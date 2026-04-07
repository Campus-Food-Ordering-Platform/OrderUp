// src/pages/VendorSection.jsx
import { CheckCircle } from 'lucide-react';

const BRAND = '#C0474A';

export default function VendorSection() {
  return (
    <section
      style={{
        minHeight: '100vh',
        backgroundColor: '#FFFBFB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          borderRadius: '2rem',
          overflow: 'hidden',
          maxWidth: '900px',
          width: '100%',
          backgroundColor: BRAND,
           boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        {/* Left: Text content */}
        <div
          style={{
            flex: 1,
            padding: '3rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '1.5rem',
          }}
        >
          <h2
            style={{
              fontSize: '2.4rem',
              fontWeight: 800,
              color: 'white',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Are You a Vendor?
          </h2>

          <p
            style={{
              fontSize: '1rem',
              color: 'white',
              margin: 0,
              lineHeight: 1.7,
            }}
          >
            Join OrderUp to streamline your operations, reduce queues, and
            increase sales with our vendor dashboard featuring menu management,
            order tracking, and analytics.
          </p>

          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              'Manage your menu and pricing in real-time',
              'Track orders and update status instantly',
              'View analytics and sales reports',
            ].map((item) => (
              <li
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: '#FFFBFB',
                  fontSize: '0.95rem',
                }}
              >
                <CheckCircle size={20} color="white" strokeWidth={2} style={{ flexShrink: 0 }} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Image */}
        <div
          style={{
            width: '380px',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          <img
            src="https://th.bing.com/th/id/OIP.ITVRktmx9qGPdjDJTWxBewHaE7?w=221&h=180&c=7&r=0&o=7&pid=1.7&rm=3"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      </div>
    </section>
  );
}