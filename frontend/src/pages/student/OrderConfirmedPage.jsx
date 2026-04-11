import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Home, Package, History, UserRound, CheckCircle, Clock, MapPin, ChevronRight } from 'lucide-react';

const BRAND = '#C0474A';

const steps = [
  { id: 'confirmed', label: 'Order Confirmed', icon: '✅', description: 'Your order has been received' },
  { id: 'preparing', label: 'Preparing', icon: '👨‍🍳', description: 'The vendor is preparing your food' },
  { id: 'ready', label: 'Ready for Pickup', icon: '🛎️', description: 'Your order is ready to collect!' },
];

export default function OrderConfirmedPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const vendor = state?.vendor;
  const total = state?.total;
  const note = state?.note;

  const [currentStep, setCurrentStep] = useState(0);
  const [orderNumber] = useState(() => Math.floor(Math.random() * 900) + 100);

  // Simulate order progressing for demo purposes
  useEffect(() => {
    const t1 = setTimeout(() => setCurrentStep(1), 4000);
    const t2 = setTimeout(() => setCurrentStep(2), 9000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const estimatedTime = vendor?.wait || 15;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F5F2', paddingBottom: '32px' }}>

      {/* ── Header ── */}
      <header
        style={{
          background: 'linear-gradient(135deg, #C0474A 0%, #E8726A 100%)',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', backgroundColor: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingCart size={18} color={BRAND} strokeWidth={2.5} />
          </div>
          <span style={{ color: 'white', fontSize: '1.2rem', fontWeight: 800 }}>OrderUp</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div
          onClick={() => navigate('/student-dashboard')}
          style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <Home size={16} color="white" strokeWidth={2} />
        </div>
        <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <History size={16} color="white" strokeWidth={2} />
        </div>
        <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Package size={16} color="white" strokeWidth={2} />
        </div>
          <div
            onClick={() => navigate('/checkout')}
            style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ShoppingCart size={16} color="white" strokeWidth={2} />
          </div>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <UserRound size={16} color="white" strokeWidth={2} />
          </div>
        </div>
      </header>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* ── Success Banner ── */}
        <div
          style={{
          background: 'rgba(220, 245, 220, 0.5)',
          backdropFilter: 'blur(8px)',
          borderRadius: '20px',
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '12px',
          border: '1.5px solid #4CAF50',
          boxShadow: '0 8px 40px rgba(76, 175, 80, 0.25), 0 0 0 6px rgba(76, 175, 80, 0.08)',
        }}
        >
          <div
            style={{
              width: '72px', height: '72px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <CheckCircle size={40} color="#2A7D2A" strokeWidth={2} />
          </div>
          <h1 style={{ color: '#2A7D2A', fontSize: '1.4rem', fontWeight: 800, margin: 0}}>
            Order Placed! 🎉
          </h1>
          <p style={{ color: '#4CAF50', fontSize: '0.88rem', margin: 0 }}>
            Your order has been sent to {vendor?.name || 'the vendor'}
          </p>
          <div
            style={{
              backgroundColor: 'rgba(42,125,42,0.1)',
              borderRadius: '12px',
              padding: '10px 24px',
              display: 'flex',
              gap: '24px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#4CAF50', fontSize: '0.72rem', margin: '0 0 2px' }}>Order No.</p>
             <p style={{ color: '#2A7D2A', fontSize: '1rem', fontWeight: 800, margin: 0 }}>#{orderNumber}</p>
            </div>
            <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.3)' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#4CAF50', fontSize: '0.72rem', margin: '0 0 2px' }}>Est. Time</p>
              <p style={{ color: '#2A7D2A', fontSize: '1rem', fontWeight: 800, margin: 0 }}>{estimatedTime} min</p>
            </div>
            <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.3)' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#4CAF50', fontSize: '0.72rem', margin: '0 0 2px' }}>Total Paid</p>
              <p style={{ color: '#2A7D2A', fontSize: '1rem', fontWeight: 800, margin: 0 }}>R {total}</p>
            </div>
          </div>
        </div>

        {/* ── Live Order Tracking ── */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 20px' }}>
            Live Order Status
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {steps.map((step, idx) => {
              const isDone = idx < currentStep;
              const isActive = idx === currentStep;
              const isPending = idx > currentStep;

              return (
                <div key={step.id} style={{ display: 'flex', gap: '14px' }}>
                  {/* Timeline line + dot */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div
                      style={{
                        width: '36px', height: '36px',
                        borderRadius: '50%',
                        backgroundColor: isDone ? BRAND : isActive ? '#FFF0F0' : '#F5F5F5',
                        border: isActive ? `2px solid ${BRAND}` : isDone ? 'none' : '2px solid #E0E0E0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: isDone ? '0' : '1.1rem',
                        transition: 'all 0.4s ease',
                        flexShrink: 0,
                      }}
                    >
                      {isDone
                        ? <CheckCircle size={18} color="white" strokeWidth={2.5} />
                        : <span style={{ opacity: isPending ? 0.4 : 1 }}>{step.icon}</span>
                      }
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        style={{
                          width: '2px',
                          height: '36px',
                          backgroundColor: isDone ? BRAND : '#E0E0E0',
                          transition: 'background-color 0.4s ease',
                          margin: '4px 0',
                        }}
                      />
                    )}
                  </div>

                  {/* Step text */}
                  <div style={{ paddingBottom: idx < steps.length - 1 ? '24px' : '0', paddingTop: '6px' }}>
                    <p
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: isActive || isDone ? 700 : 500,
                        color: isPending ? '#bbb' : '#1a1a2e',
                        margin: '0 0 2px',
                      }}
                    >
                      {step.label}
                      {isActive && (
                        <span
                          style={{
                            marginLeft: '8px',
                            backgroundColor: '#FFF0F0',
                            color: BRAND,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '20px',
                          }}
                        >
                          CURRENT
                        </span>
                      )}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: isPending ? '#ccc' : '#888', margin: 0 }}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Collection Info ── */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '14px 16px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#FFF0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MapPin size={20} color={BRAND} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.72rem', color: '#888', margin: '0 0 2px' }}>Collection point</p>
            <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>The Matrix Food Court</p>
            <p style={{ fontSize: '0.75rem', color: '#888', margin: 0 }}>Collect at the {vendor?.name} stall when notified</p>
          </div>
          <Clock size={16} color="#aaa" />
        </div>

        {/* ── Special Note (if any) ── */}
        {note && (
          <div style={{ backgroundColor: '#FFF8F6', borderRadius: '16px', padding: '14px 16px', border: `1px solid #F0E0DE`, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: '0.75rem', color: '#888', margin: '0 0 4px' }}>Your special instructions</p>
            <p style={{ fontSize: '0.85rem', color: BRAND, fontStyle: 'italic', margin: 0 }}>"{note}"</p>
          </div>
        )}

        {/* ── Actions ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => navigate('/student-dashboard')}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'linear-gradient(135deg, #C0474A 0%, #E8726A 100%)',
              color: 'white',
              fontSize: '0.95rem',
              fontWeight: 700,
              border: 'none',
              borderRadius: '2rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            Order More Food
            <ChevronRight size={18} />
          </button>

          <button
            onClick={() => navigate('/student-dashboard')}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'white',
              color: BRAND,
              fontSize: '0.95rem',
              fontWeight: 700,
              border: `1.5px solid ${BRAND}`,
              borderRadius: '2rem',
              cursor: 'pointer',
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}