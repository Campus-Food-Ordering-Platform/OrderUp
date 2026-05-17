import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Home, History, UserRound, CheckCircle,
  Clock, MapPin, Package, ChefHat, Bell, Loader2,
} from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const BRAND       = '#C0474A';
const BRAND_LIGHT = '#FFF0F0';
const BG          = '#F7F5F2';
const POLL_MS     = 5000;

const STEPS = [
  { id: 'received',  label: 'Order Received',      Icon: CheckCircle, description: 'Your order has been received'        },
  { id: 'preparing', label: 'Preparing',            Icon: ChefHat,     description: 'The vendor is making your food'      },
  { id: 'ready',     label: 'Ready for Collection', Icon: Bell,        description: 'Your order is ready to collect!'     },
];

const STATUS_TO_STEP = {
  received:  0,
  preparing: 1,
  ready:     2,
  collected: 3, // beyond last step → card removed
};

const STATUS_BADGE = {
  received:  { bg: '#EFF6FF', color: '#2563EB', label: 'Received'  },
  preparing: { bg: '#FEF3C7', color: '#D97706', label: 'Preparing' },
  ready:     { bg: '#DCFCE7', color: '#16A34A', label: 'Ready! 🛎️' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(isoString) {
  if (!isoString) return '';
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60)  return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function formatTime(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Animated pulsing dot for the active step */
function PulseDot() {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8, marginLeft: 6, verticalAlign: 'middle' }}>
      <span style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        backgroundColor: BRAND, opacity: 0.6,
        animation: 'orderup-ping 1.4s cubic-bezier(0,0,0.2,1) infinite',
      }} />
      <span style={{ position: 'relative', borderRadius: '50%', width: 8, height: 8, backgroundColor: BRAND }} />
    </span>
  );
}

/** Per-order status tracker */
function StatusTracker({ currentStep }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {STEPS.map((step, idx) => {
        const isDone    = idx < currentStep;
        const isActive  = idx === currentStep;
        const isPending = idx > currentStep;
        const { Icon }  = step;

        return (
          <div key={step.id} style={{ display: 'flex', gap: 12 }}>
            {/* Icon + connector line */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                backgroundColor : isDone ? BRAND : isActive ? BRAND_LIGHT : '#F5F5F5',
                border          : isActive ? `2px solid ${BRAND}` : isDone ? 'none' : '2px solid #E5E5E5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.4s ease',
              }}>
                {isDone
                  ? <CheckCircle size={15} color="white" strokeWidth={2.5} />
                  : <Icon size={14} color={isPending ? '#ccc' : BRAND} strokeWidth={2} />
                }
              </div>
              {idx < STEPS.length - 1 && (
                <div style={{
                  width: 2, height: 28,
                  backgroundColor: isDone ? BRAND : '#E5E5E5',
                  transition: 'background-color 0.4s ease',
                  margin: '3px 0',
                }} />
              )}
            </div>

            {/* Text */}
            <div style={{ paddingTop: 5, paddingBottom: idx < STEPS.length - 1 ? 0 : 0 }}>
              <p style={{
                fontSize: '0.82rem', fontWeight: isActive || isDone ? 700 : 500,
                color: isPending ? '#ccc' : '#1a1a2e', margin: '0 0 1px',
                display: 'flex', alignItems: 'center', gap: 2,
              }}>
                {step.label}
                {isActive && <PulseDot />}
              </p>
              <p style={{ fontSize: '0.72rem', color: isPending ? '#ddd' : '#999', margin: 0 }}>
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Single order card */
function OrderCard({ order, onRemove }) {
  const currentStep = STATUS_TO_STEP[order.status] ?? 0;
  const badge       = STATUS_BADGE[order.status];
  const items       = order.items ?? [];

  return (
    <div style={{
      backgroundColor: 'white', borderRadius: 20,
      boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
      overflow: 'hidden',
      border: order.status === 'ready' ? `1.5px solid #4CAF50` : '1.5px solid transparent',
      transition: 'border-color 0.4s ease',
      animation: 'orderup-slideIn 0.35s ease',
    }}>

      {/* Card header */}
      <div style={{
        background: order.status === 'ready'
          ? 'linear-gradient(135deg, #16A34A 0%, #4ADE80 100%)'
          : `linear-gradient(135deg, ${BRAND} 0%, #E8726A 100%)`,
        padding: '14px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        transition: 'background 0.4s ease',
      }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.68rem', fontWeight: 600, margin: '0 0 3px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Order #{order.order_number}
          </p>
          <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: 800, margin: 0 }}>
            {order.vendor_name ?? order.vendor?.name ?? 'Vendor'}
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', margin: '4px 0 0' }}>
            Placed at {formatTime(order.created_at)} · {timeAgo(order.created_at)}
          </p>
        </div>

        <div style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(4px)',
          borderRadius: 20, padding: '4px 10px',
          fontSize: '0.7rem', fontWeight: 700, color: 'white',
          flexShrink: 0,
        }}>
          {badge?.label ?? order.status}
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Items list */}
        {items.length > 0 && (
          <div style={{ borderBottom: '1px solid #F0F0F0', paddingBottom: 12 }}>
            {items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    backgroundColor: BRAND_LIGHT, color: BRAND,
                    width: 20, height: 20, borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 800, flexShrink: 0,
                  }}>
                    {item.quantity}×
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#2d2d2d', fontWeight: 500 }}>
                    {item.name ?? item.menu_item_name}
                  </span>
                </div>
                <span style={{ fontSize: '0.82rem', color: '#555', fontWeight: 600 }}>
                  R {((item.price ?? item.unit_price ?? 0) * (item.quantity ?? 1)).toFixed(2)}
                </span>
              </div>
            ))}

            {/* Total row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTop: '1px dashed #E8E8E8' }}>
              <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 600 }}>Total Paid</span>
              <span style={{ fontSize: '0.95rem', color: BRAND, fontWeight: 800 }}>
                R {Number(order.total_amount ?? order.total ?? 0).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Status tracker */}
        <StatusTracker currentStep={currentStep} />

        {/* Collection info */}
        <div style={{
          backgroundColor: '#FAFAF9', borderRadius: 12, padding: '10px 12px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: BRAND_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MapPin size={15} color={BRAND} />
          </div>
          <div>
            <p style={{ fontSize: '0.68rem', color: '#aaa', margin: '0 0 1px', fontWeight: 600, letterSpacing: '0.04em' }}>COLLECT AT</p>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
            {order.vendor_location ?? 'The Matrix Food Court'} · {order.vendor_name ?? 'Vendor'} stall
            </p>
          </div>
        </div>

        {/* Special note */}
        {order.note && (
          <div style={{ backgroundColor: BRAND_LIGHT, borderRadius: 10, padding: '8px 12px', borderLeft: `3px solid ${BRAND}` }}>
            <p style={{ fontSize: '0.68rem', color: '#aaa', margin: '0 0 2px', fontWeight: 600 }}>SPECIAL INSTRUCTIONS</p>
            <p style={{ fontSize: '0.8rem', color: BRAND, fontStyle: 'italic', margin: 0 }}>"{order.note}"</p>
          </div>
        )}

        {/* Ready banner */}
        {order.status === 'ready' && (
          <div style={{
            backgroundColor: '#DCFCE7', borderRadius: 12, padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 10,
            border: '1px solid #86EFAC',
            animation: 'orderup-pulse 2s ease-in-out infinite',
          }}>
            <Bell size={18} color="#16A34A" />
            <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#15803D', margin: 0 }}>
              Your order is ready! Head to the stall now 🎉
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onBrowse }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 62px)', gap: 16, padding: 32 }}>
      <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg, #FFF0F0, #FAFAF9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(192,71,74,0.12)' }}>
        <Package size={38} color="#ddd" />
      </div>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1a2e', margin: 0 }}>No Active Orders</h2>
      <p style={{ fontSize: '0.85rem', color: '#999', textAlign: 'center', margin: 0, maxWidth: 240 }}>
        You don't have any active orders right now. Browse vendors to place an order.
      </p>
      <button
        onClick={onBrowse}
        style={{ backgroundColor: BRAND, color: 'white', border: 'none', borderRadius: '2rem', padding: '12px 28px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', marginTop: 4 }}
      >
        Browse Vendors
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OrderConfirmedPage() {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const { logout } = useAuth0();

  const [orders,     setOrders]     = useState([]);   // array of active orders
  const [loading,    setLoading]    = useState(true);
  const [showLogout, setShowLogout] = useState(false);

  // ── Fetch all active orders ──────────────────────────────────────────────
  const fetchActiveOrders = useCallback(async () => {
    const raw          = JSON.parse(localStorage.getItem('orderup_user') || '{}');
    const localUser    = raw?.user ?? raw;
    const internalId   = localUser?.id;
    if (!internalId) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/student/${internalId}/active-all`);
      if (!res.ok) return;
      const data = await res.json();
      // data should be an array; filter out 'collected' defensively
      setOrders((data ?? []).filter(o => o.status !== 'collected'));
    } catch (err) {
      console.error('Failed to fetch active orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Handle payment-verification redirect ────────────────────────────────
  useEffect(() => {
    const params    = new URLSearchParams(window.location.search);
    const reference = params.get('reference');

    if (!reference) {
      fetchActiveOrders();
      return;
    }

    const verifyAndCreate = async () => {
      try {
        const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/verify/${reference}`);
        const data = await res.json();

        if (!data.success) { navigate('/checkout'); return; }

        const pending = JSON.parse(sessionStorage.getItem('pendingOrder') || '{}');

        if (pending.vendor_id) {
          sessionStorage.removeItem('pendingOrder');
          await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              vendor_id    : pending.vendor_id,
              customer_id  : pending.customer_id,
              customer_name: pending.customer_name,
              items        : pending.items,
              total_amount : pending.total,
              note         : pending.note || null,
            }),
          });
        }

        // After creation, fetch full list
        await fetchActiveOrders();
      } catch (err) {
        console.error('Verification error:', err);
        navigate('/checkout');
      }
    };

    verifyAndCreate();
  }, [fetchActiveOrders, navigate]);

  // ── Polling: update statuses every 5s ───────────────────────────────────
  useEffect(() => {
    if (orders.length === 0) return;

    const poll = setInterval(async () => {
      try {
        const updates = await Promise.all(
          orders.map(o =>
            fetch(`${import.meta.env.VITE_API_URL}/api/orders/${o.id}/status`)
              .then(r => r.json())
              .then(d => ({ id: o.id, status: d.status }))
              .catch(() => ({ id: o.id, status: o.status }))
          )
        );

        setOrders(prev => {
          let next = prev.map(o => {
            const upd = updates.find(u => u.id === o.id);
            return upd ? { ...o, status: upd.status } : o;
          });
          // Remove collected orders
          next = next.filter(o => o.status !== 'collected');
          return next;
        });
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, POLL_MS);

    return () => clearInterval(poll);
  }, [orders]);

  // ── Render ───────────────────────────────────────────────────────────────
  const Header = () => (
    <header style={{
      background      : `linear-gradient(135deg, ${BRAND} 0%, #E8726A 100%)`,
      padding         : '14px 20px',
      display         : 'flex',
      alignItems      : 'center',
      justifyContent  : 'space-between',
      position        : 'sticky',
      top             : 0,
      zIndex          : 50,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, backgroundColor: 'white', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShoppingCart size={18} color={BRAND} strokeWidth={2.5} />
        </div>
        <span style={{ color: 'white', fontSize: '1.2rem', fontWeight: 800 }}>OrderUp</span>
      </div>

      {/* Nav icons */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[
          { icon: <Home size={16} color="white" />,    action: () => navigate('/student-dashboard') },
          { icon: <History size={16} color="white" />, action: () => navigate('/student-history')   },
         // { icon: <ShoppingCart size={16} color="white" strokeWidth={2} />, action: () => navigate('/checkout') },
        ].map((btn, i) => (
          <div key={i} onClick={btn.action} style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {btn.icon}
          </div>
        ))}

        {/* User / logout */}
        <div
          onMouseEnter={() => setShowLogout(true)}
          onMouseLeave={() => setShowLogout(false)}
          style={{ position: 'relative', width: 34, height: 34, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <UserRound size={16} color="white" strokeWidth={2} />
          {showLogout && (
            <div style={{ position: 'absolute', top: '100%', right: 0, paddingTop: 8, zIndex: 100 }}>
              <div
                onClick={e => { e.stopPropagation(); logout({ logoutParams: { returnTo: window.location.origin } }); }}
                style={{ backgroundColor: 'white', color: BRAND, padding: '8px 16px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 700, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', whiteSpace: 'nowrap' }}
              >
                Sign Out
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );

  return (
    <>
      {/* Keyframe animations injected once */}
      <style>{`
        @keyframes orderup-ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes orderup-slideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes orderup-pulse {
          0%, 100% { opacity: 1;    }
          50%       { opacity: 0.7; }
        }
        @keyframes orderup-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{ minHeight: '100vh', backgroundColor: BG }}>
        <Header />

        {loading ? (
          /* Loading skeleton */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 62px)', gap: 14 }}>
            <Loader2 size={32} color={BRAND} style={{ animation: 'orderup-spin 1s linear infinite' }} />
            <p style={{ color: '#aaa', fontSize: '0.85rem', margin: 0 }}>Loading your orders…</p>
          </div>
        ) : orders.length === 0 ? (
          <EmptyState onBrowse={() => navigate('/student-dashboard')} />
        ) : (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640, margin: '0 auto' }}>

            {/* Page heading */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1a2e', margin: 0 }}>
                  Active Orders
                </h2>
                <p style={{ fontSize: '0.75rem', color: '#aaa', margin: '3px 0 0' }}>
                  {orders.length} order{orders.length !== 1 ? 's' : ''} in progress · updates every 5s
                </p>
              </div>
              {/* Live indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: 'white', borderRadius: 20, padding: '5px 10px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#22C55E', animation: 'orderup-ping 1.4s infinite' }} />
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#22C55E', letterSpacing: '0.04em' }}>LIVE</span>
              </div>
            </div>

            {/* Order cards */}
            {orders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onRemove={() => setOrders(prev => prev.filter(o => o.id !== order.id))}
              />
            ))}

          </div>
        )}
      </div>
    </>
  );
}