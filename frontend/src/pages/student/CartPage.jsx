import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Home, Package, History, UserRound, Plus, Minus, Trash2 } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';

const BRAND = '#C0474A';

// Same key function as VendorMenuPage — must match exactly
const cartKey = (userId) => `orderup_cart_${userId}`;

export default function CartPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth0();

  const vendor = state?.vendor;
  const items = state?.items || []; // full menu item objects passed from VendorMenuPage

  const [cart, setCart] = useState({});
  const [showLogout, setShowLogout] = useState(false);

  // ── Load cart from localStorage on mount ────────────────────────────────
  useEffect(() => {
    if (!user?.sub) return;
    try {
      const stored = localStorage.getItem(cartKey(user.sub));
      if (stored) setCart(JSON.parse(stored));
    } catch {
      localStorage.removeItem(cartKey(user.sub));
    }
  }, [user?.sub]);

  // ── Persist cart to localStorage on every change ─────────────────────
  const saveCart = (newCart) => {
    if (!user?.sub) return;
    localStorage.setItem(cartKey(user.sub), JSON.stringify(newCart));
    setCart(newCart);
  };

  const handleAdd = (itemId) => {
    saveCart({ ...cart, [itemId]: (cart[itemId] || 0) + 1 });
  };

  const handleRemove = (itemId) => {
    const qty = (cart[itemId] || 0) - 1;
    if (qty <= 0) {
      const next = { ...cart };
      delete next[itemId];
      saveCart(next);
    } else {
      saveCart({ ...cart, [itemId]: qty });
    }
  };

  const handleDelete = (itemId) => {
    const next = { ...cart };
    delete next[itemId];
    saveCart(next);
  };

  // ── Derived values ───────────────────────────────────────────────────────
  const cartItems  = items.filter((item) => cart[item.id] > 0);
  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const subtotal   = cartItems.reduce((sum, item) => sum + cart[item.id] * item.price, 0);
  const serviceFee = 5;
  const total      = subtotal + serviceFee;

  // ── Empty cart state ─────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F7F5F2' }}>
        <Header navigate={navigate} logout={logout} showLogout={showLogout} setShowLogout={setShowLogout} totalItems={0} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 62px)', gap: '12px' }}>
          <ShoppingCart size={48} color="#ddd" />
          <p style={{ color: '#aaa', fontSize: '0.95rem' }}>Your cart is empty.</p>
          <button
            onClick={() => navigate('/student-dashboard')}
            style={{ backgroundColor: BRAND, color: 'white', border: 'none', borderRadius: '2rem', padding: '10px 24px', fontWeight: 700, cursor: 'pointer' }}
          >
            Browse Vendors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F5F2', paddingBottom: '120px' }}>

      <Header navigate={navigate} logout={logout} showLogout={showLogout} setShowLogout={setShowLogout} totalItems={totalItems} />

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* ── Vendor Info ── */}
        {vendor && (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <div
              style={{
                width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
                background: `linear-gradient(135deg, ${vendor.bgFrom || '#FFE5D0'}, ${vendor.bgTo || '#FFBFA0'})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem',
              }}
            >
              {vendor.emoji || '🍽️'}
            </div>
            <div>
              <p style={{ fontSize: '0.72rem', color: '#888', margin: '0 0 2px' }}>Ordering from</p>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#1a1a2e', margin: 0 }}>{vendor.name}</h2>
            </div>
          </div>
        )}

        {/* ── Cart Items ── */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #F5F5F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Your Items</h3>
            <span style={{ fontSize: '0.78rem', color: '#888' }}>{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
          </div>

          {cartItems.map((item, idx) => (
            <div
              key={item.id}
              style={{
                padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                borderBottom: idx < cartItems.length - 1 ? '1px solid #F5F5F5' : 'none',
              }}
            >
              {/* Thumbnail */}
              <div
                style={{
                  width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0, overflow: 'hidden',
                  backgroundColor: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                }}
              >
                {item.image_url
                  ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : '🍽️'}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.name}
                </p>
                <p style={{ fontSize: '0.75rem', color: BRAND, fontWeight: 600, margin: 0 }}>
                  R {(item.price * cart[item.id]).toFixed(2)}
                </p>
              </div>

              {/* Qty controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => handleRemove(item.id)}
                  style={{ width: '26px', height: '26px', borderRadius: '50%', border: `1.5px solid ${BRAND}`, backgroundColor: 'white', color: BRAND, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Minus size={12} />
                </button>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, minWidth: '16px', textAlign: 'center', color: '#1a1a2e' }}>
                  {cart[item.id]}
                </span>
                <button
                  onClick={() => handleAdd(item.id)}
                  style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: BRAND, border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Delete row */}
              <button
                onClick={() => handleDelete(item.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', padding: '4px', display: 'flex', alignItems: 'center' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* ── Order Summary ── */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '14px 16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 12px' }}>Order Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: '#888' }}>Subtotal</span>
              <span style={{ fontSize: '0.85rem', color: '#1a1a2e', fontWeight: 600 }}>R {subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: '#888' }}>Service fee</span>
              <span style={{ fontSize: '0.85rem', color: '#1a1a2e', fontWeight: 600 }}>R {serviceFee}.00</span>
            </div>
            <div style={{ borderTop: '1px solid #F5F5F5', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#1a1a2e' }}>Total</span>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: BRAND }}>R {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ── Add more items nudge ── */}
        {vendor && (
          <button
            onClick={() => navigate('/vendor-menu', { state: { vendor } })}
            style={{
              backgroundColor: 'white', border: `1.5px dashed ${BRAND}`, borderRadius: '14px',
              padding: '14px', color: BRAND, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}
          >
            <Plus size={16} />
            Add more items
          </button>
        )}

      </div>

      {/* ── Proceed to Checkout ── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px', backgroundColor: '#F7F5F2', borderTop: '1px solid #EBEBEB' }}>
        <button
          onClick={() => navigate('/checkout', { state: { vendor, cart, items } })}
          style={{
            width: '100%', padding: '1rem',
            background: 'linear-gradient(135deg, #C0474A 0%, #E8726A 100%)',
            color: 'white', fontSize: '1rem', fontWeight: 700, border: 'none',
            borderRadius: '2rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: '0 8px 24px rgba(192,71,74,0.35)',
          }}
        >
          <ShoppingCart size={18} color="white" />
          Proceed to Checkout · R {total.toFixed(2)}
        </button>
      </div>

    </div>
  );
}

// ── Shared header ─────────────────────────────────────────────────────────────
function Header({ navigate, logout, showLogout, setShowLogout, totalItems }) {
  return (
    <header style={{ background: 'linear-gradient(135deg, #C0474A 0%, #E8726A 100%)', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <ArrowLeft size={18} color="white" />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '36px', height: '36px', backgroundColor: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingCart size={18} color={BRAND} strokeWidth={2.5} />
          </div>
          <span style={{ color: 'white', fontSize: '1.1rem', fontWeight: 800 }}>Cart</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div onClick={() => navigate('/student-dashboard')} style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Home size={16} color="white" strokeWidth={2} />
        </div>
        <div onClick={() => navigate('/student-history')} style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <History size={16} color="white" strokeWidth={2} />
        </div>
        <div onClick={() => navigate('/order-confirmed')} style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Package size={16} color="white" strokeWidth={2} />
        </div>
        <div style={{ position: 'relative', width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ShoppingCart size={16} color="white" strokeWidth={2} />
          {totalItems > 0 && (
            <div style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: 'white', color: BRAND, fontSize: '0.6rem', fontWeight: 800, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {totalItems}
            </div>
          )}
        </div>
        <div
          onMouseEnter={() => setShowLogout(true)}
          onMouseLeave={() => setShowLogout(false)}
          style={{ position: 'relative', width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <UserRound size={16} color="white" strokeWidth={2} />
          {showLogout && (
            <div style={{ position: 'absolute', top: '100%', right: 0, paddingTop: '8px', zIndex: 100 }}>
              <div
                onClick={(e) => { e.stopPropagation(); logout({ logoutParams: { returnTo: window.location.origin } }); }}
                style={{ backgroundColor: 'white', color: '#C0474A', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', whiteSpace: 'nowrap' }}
              >
                Sign Out
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}