import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Store, CheckCircle } from 'lucide-react';

const BRAND = '#C0474A';

const roles = [
  {
    id: 'student',
    title: 'Student',
    description:
      'Browse menus from multiple vendors, place orders, track your food in real-time, and skip the queue at your university food court.',
    tags: [
      { label: 'Order Food', color: '#FFE0E8', text: '#C0474A' },
      { label: 'Track Order', color: '#E0F7EF', text: '#2A9D6A' },
      { label: 'View History', color: '#EDE0FF', text: '#7B4FBF' },
    ],
    icon: <GraduationCap size={26} color="white" strokeWidth={2} />,
    iconBg: BRAND,
  },
  {
    id: 'vendor',
    title: 'Vendor',
    description:
      'Manage your menu, receive and process orders, track sales analytics, and grow your business with our comprehensive vendor dashboard.',
    tags: [
      { label: 'Manage Menu', color: '#E0F0FF', text: '#2A6DB5' },
      { label: 'Process Orders', color: '#FFE8D0', text: '#C26A1A' },
      { label: 'View Analytics', color: '#E0F7EF', text: '#2A9D6A' },
    ],
    icon: <Store size={26} color="white" strokeWidth={2} />,
    iconBg: '#888',
  },
];

export default function RoleSelectionPage() {
  const [selected, setSelected] = useState('student');
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selected === 'student') navigate('/student-dashboard');
    if (selected === 'vendor') navigate('/vendor-dashboard');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#FFFBFB',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
      }}
    >
      <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1
          style={{
            fontSize: '3rem',
            fontWeight: 800,
            color: '#1a1a2e',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Welcome to <span style={{ color: BRAND }}>OrderUp</span>
        </h1>
        <p style={{ fontSize: '1.05rem', color: '#888', marginTop: '0.75rem' }}>
          Choose how you'd like to use the platform
        </p>
      </header>

      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '1.5rem',
          padding: '2rem',
          width: '100%',
          maxWidth: '520px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}
      >
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 1.25rem' }}>
          Select Your Role
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {roles.map((role) => {
            const isSelected = selected === role.id;
            return (
              <article
                key={role.id}
                onClick={() => setSelected(role.id)}
                style={{
                  backgroundColor: isSelected ? '#FFF0F0' : 'white',
                  border: isSelected ? `1.5px solid ${BRAND}` : '1.5px solid #EBEBEB',
                  borderRadius: '1rem',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: isSelected
                    ? '0 4px 16px rgba(192,71,74,0.15)'
                    : '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s ease',
                }}
              >
                {isSelected && (
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                    <CheckCircle size={24} color={BRAND} fill="#FFF0F0" strokeWidth={2} />
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '0.6rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: isSelected ? role.iconBg : '#CCCCCC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    {role.icon}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
                    {role.title}
                  </h3>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#666', margin: '0 0 0.9rem', lineHeight: 1.6 }}>
                  {role.description}
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {role.tags.map((tag) => (
                    <span
                      key={tag.label}
                      style={{
                        backgroundColor: tag.color,
                        color: tag.text,
                        fontSize: '0.78rem',
                        fontWeight: 500,
                        padding: '4px 12px',
                        borderRadius: '20px',
                      }}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>

        <button
          onClick={handleContinue}
          style={{
            width: '100%',
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: BRAND,
            color: 'white',
            fontSize: '1.05rem',
            fontWeight: 700,
            border: 'none',
            borderRadius: '2rem',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.target.style.opacity = '1')}
        >
          Continue
        </button>
      </div>
    </div>
  );
}