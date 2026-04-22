import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { GraduationCap, Store, CheckCircle, ShoppingCart } from 'lucide-react';

const BRAND = '#C0474A';

const roles = [
  {
    id: 'student',
    title: 'Student',
    description: 'Browse menus from multiple vendors, place orders, track your food in real-time, and skip the queue at your university food court.',
    tags: [
      { label: 'Order Food', color: '#FFE0E8', text: '#C0474A' },
      { label: 'Track Order', color: '#E0F7EF', text: '#2A9D6A' },
      { label: 'View History', color: '#EDE0FF', text: '#7B4FBF' },
    ],
    icon: <GraduationCap size={24} color="white" strokeWidth={2} />,
    iconBg: BRAND,
    inputLabel: 'Your display name',
    inputPlaceholder: 'e.g. Naomi',
  },
  {
    id: 'vendor',
    title: 'Vendor',
    description: 'Manage your menu, receive and process orders, track sales analytics, and grow your business with our comprehensive vendor dashboard.',
    tags: [
      { label: 'Manage Menu', color: '#E0F0FF', text: '#2A6DB5' },
      { label: 'Process Orders', color: '#FFE8D0', text: '#C26A1A' },
      { label: 'View Analytics', color: '#E0F7EF', text: '#2A9D6A' },
    ],
    icon: <Store size={24} color="white" strokeWidth={2} />,
    iconBg: BRAND,
    inputLabel: 'Your stall name',
    inputPlaceholder: 'e.g. Sausage Saloon',
  },
];

export default function RoleSelectionPage() {
  const { user, getAccessTokenSilently } = useAuth0();
  const [selected, setSelected] = useState(null);
  const [nameInputs, setNameInputs] = useState({ student: '', vendor: '' });
  const navigate = useNavigate();

  // ✅ Guard — inside the component, after hooks
  if (!user) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <p>Loading...</p>
    </div>
  );

  const handleContinue = async () => {
    if (!canContinue) return;

    try {
      const token = await getAccessTokenSilently();

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          auth0Id: user.sub,
          name: nameInputs[selected].trim(),
          role: selected === 'student' ? 'customer' : 'vendor'
        })
      });

      const data = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', data);

      if (response.ok) {
        localStorage.setItem('orderup_user', JSON.stringify(data.user));
        if (selected === 'student') navigate('/student-dashboard');
        if (selected === 'vendor') navigate('/vendor-dashboard');
      }
    } catch (error) {
      console.error('Error during signup:', error);
    }
  };

  const canContinue = selected && nameInputs[selected].trim().length > 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F5F2', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ── */}
      <header style={{ backgroundColor: BRAND, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '36px', height: '36px', backgroundColor: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShoppingCart size={18} color={BRAND} strokeWidth={2.5} />
        </div>
        <span style={{ color: 'white', fontSize: '1.2rem', fontWeight: 800 }}>OrderUp</span>
      </header>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>

        {/* Hero banner */}
        <div style={{ background: 'linear-gradient(135deg, #C0474A 0%, #E8726A 100%)', borderRadius: '20px', padding: '28px 32px', width: '100%', maxWidth: '560px', marginBottom: '24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', margin: '0 0 6px' }}>Welcome to OrderUp</h1>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)', margin: 0 }}>Choose how you'd like to use the platform</p>
        </div>

        {/* Role card container */}
        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '1.75rem', width: '100%', maxWidth: '560px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 1rem' }}>Select Your Role</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {roles.map((role) => {
              const isSelected = selected === role.id;
              return (
                <article
                  key={role.id}
                  onClick={() => setSelected(role.id)}
                  style={{
                    backgroundColor: isSelected ? '#FFF8F6' : 'white',
                    border: isSelected ? `1.5px solid ${BRAND}` : '1.5px solid #EBEBEB',
                    borderRadius: '14px',
                    padding: '1.25rem',
                    cursor: 'pointer',
                    position: 'relative',
                    boxShadow: isSelected ? '0 4px 16px rgba(192,71,74,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isSelected && (
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                      <CheckCircle size={22} color={BRAND} fill="#FFF8F6" strokeWidth={2} />
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.6rem' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: isSelected ? role.iconBg : '#CCCCCC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: isSelected ? '0 4px 10px rgba(192,71,74,0.3)' : 'none', transition: 'all 0.2s ease' }}>
                      {role.icon}
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{role.title}</h3>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#777', margin: '0 0 0.8rem', lineHeight: 1.6 }}>{role.description}</p>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: isSelected ? '1rem' : 0 }}>
                    {role.tags.map((tag) => (
                      <span key={tag.label} style={{ backgroundColor: tag.color, color: tag.text, fontSize: '0.73rem', fontWeight: 500, padding: '3px 12px', borderRadius: '20px' }}>
                        {tag.label}
                      </span>
                    ))}
                  </div>

                  {isSelected && (
                    <div onClick={(e) => e.stopPropagation()} style={{ marginTop: '0.5rem' }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: '6px' }}>
                        {role.inputLabel}
                      </label>
                      <input
                        type="text"
                        placeholder={role.inputPlaceholder}
                        value={nameInputs[role.id]}
                        onChange={(e) => setNameInputs((prev) => ({ ...prev, [role.id]: e.target.value }))}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: `1.5px solid ${BRAND}`, fontSize: '0.9rem', color: '#1a1a2e', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box' }}
                      />
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <button
            onClick={handleContinue}
            disabled={!canContinue}
            style={{
              width: '100%',
              marginTop: '1.25rem',
              padding: '0.95rem',
              background: canContinue ? 'linear-gradient(135deg, #C0474A 0%, #E8726A 100%)' : '#E0E0E0',
              color: canContinue ? 'white' : '#aaa',
              fontSize: '1rem',
              fontWeight: 700,
              border: 'none',
              borderRadius: '2rem',
              cursor: canContinue ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
            }}
          >
            Continue
          </button>
        </div>
      </main>
    </div>
  );
}