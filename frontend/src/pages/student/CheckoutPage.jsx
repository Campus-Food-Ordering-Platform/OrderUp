import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Home, Package, History, UserRound, Plus, Minus, Trash2, MapPin, CreditCard } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';

const BRAND = '#C0474A';

export default function CheckoutPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const vendor = state?.vendor;
  const initialCart = state?.cart || {};
  const items = state?.items || [];

  const [cart, setCart] = useState(initialCart);
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('paystack');

  const addToCart = (itemId) =>
    setCart((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));

  const removeFromCart = (itemId) =>
    setCart((prev) => {
      const qty = (prev[itemId] || 0) - 1;
      if (qty <= 0) { const next = { ...prev }; delete next[itemId]; return next; }
      return { ...prev, [itemId]: qty };
    });

    //adding handlepayment func for paystack
    const { user } = useAuth0();

  const handlePayment = async () => {
    try {
      // 1. Create the order in the backend first
      const raw = JSON.parse(localStorage.getItem('orderup_user') || '{}');
      const localUser = raw?.user ?? raw;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: vendor.id,
          customer_id: localUser?.id || user?.sub,
          customer_name: localUser?.name || user?.name || 'Student',
          items: cartItems.map(item => ({
            name: item.name,
            price: item.price,
            quantity: cart[item.id],
          })),
          total_amount: total,
          note: note || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to place order');
      const order = await res.json();

      // 2. Save order details to sessionStorage BEFORE leaving the site
      sessionStorage.setItem('pendingOrder', JSON.stringify({
        orderId: order.id,
        orderNumber: order.order_number,
        vendor,
        total,
        note,
      }));

      // 3. Now go to Paystack
      const payRes = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          amount: total,
          orderId: order.id, // use the real order id
        }),
      });

      const payData = await payRes.json();
      window.location.href = payData.paymentUrl;

    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    }
  };// fix this file to handle payment with paystack, create order first, then redirect to paystack with order details


  const deleteFromCart = (itemId) =>
    setCart((prev) => { const next = { ...prev }; delete next[itemId]; return next; });

  const cartItems = items.filter((item) => cart[item.id] > 0);
  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + cart[item.id] * item.price, 0);
  const serviceFee = 5;
  const total = subtotal + serviceFee;

  if (!vendor || cartItems.length === 0) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F5F2' }}>
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
            <span style={{ color: 'white', fontSize: '1.1rem', fontWeight: 800 }}>Checkout</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div onClick={() => navigate('/student-dashboard')} style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Home size={16} color="white" strokeWidth={2} />
          </div>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <History size={16} color="white" strokeWidth={2} />
          </div>
          <div onClick={() => navigate('/order-confirmed')} style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Package size={16} color="white" strokeWidth={2} />
          </div>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ShoppingCart size={16} color="white" strokeWidth={2} />
          </div>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <UserRound size={16} color="white" strokeWidth={2} />
          </div>
        </div>
      </header>
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
            <span style={{ color: 'white', fontSize: '1.1rem', fontWeight: 800 }}>Checkout</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <div
        onClick={() => navigate('/student-dashboard')}
            style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
            <Home size={16} color="white" strokeWidth={2} />
            </div>
            <div
            style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
            <History size={16} color="white" strokeWidth={2} />
            </div>
            <div
            onClick={() => navigate('/order-confirmed')}
            style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
            <Package size={16} color="white" strokeWidth={2} />
            </div>
          {/* Cart icon with badge */}
          <div style={{ position: 'relative', width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ShoppingCart size={16} color="white" strokeWidth={2} />
            {totalItems > 0 && (
              <div style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: 'white', color: BRAND, fontSize: '0.6rem', fontWeight: 800, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {totalItems}
              </div>
            )}
          </div>
        </div>
      </header>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* ── Vendor Info ── */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          }}
        >
          <div
            style={{
              width: '48px', height: '48px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${vendor.bgFrom}, ${vendor.bgTo})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.6rem', flexShrink: 0,
            }}
          >
            {vendor.emoji}
          </div>
          <div>
            <p style={{ fontSize: '0.72rem', color: '#888', margin: '0 0 2px' }}>Ordering from</p>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#1a1a2e', margin: 0 }}>{vendor.name}</h2>
          </div>
        </div>

        {/* ── Cart Items ── */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #F5F5F5' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Your Order</h3>
          </div>

          {cartItems.map((item, idx) => (
            <div
              key={item.id}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderBottom: idx < cartItems.length - 1 ? '1px solid #F5F5F5' : 'none',
              }}
            >
              <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{item.emoji}</span>

              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 2px' }}>{item.name}</p>
                <p style={{ fontSize: '0.75rem', color: BRAND, fontWeight: 600, margin: 0 }}>R {item.price * cart[item.id]}.00</p>
              </div>

              {/* Qty controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => removeFromCart(item.id)}
                  style={{ width: '26px', height: '26px', borderRadius: '50%', border: `1.5px solid ${BRAND}`, backgroundColor: 'white', color: BRAND, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Minus size={12} />
                </button>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, minWidth: '16px', textAlign: 'center', color: '#1a1a2e' }}>{cart[item.id]}</span>
                <button
                  onClick={() => addToCart(item.id)}
                  style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: BRAND, border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Delete */}
              <button
                onClick={() => deleteFromCart(item.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', padding: '4px', display: 'flex', alignItems: 'center' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* ── Special Note ── */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '14px 16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 10px' }}>Special Instructions</h3>
          <textarea
            placeholder="Any special requests? (e.g. no onions, extra sauce...)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '12px',
              border: '1.5px solid #EBEBEB',
              fontSize: '0.85rem',
              color: '#444',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
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
          <div>
            <p style={{ fontSize: '0.72rem', color: '#888', margin: '0 0 2px' }}>Collection point</p>
            <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>The Matrix Food Court</p>
            <p style={{ fontSize: '0.75rem', color: '#888', margin: 0 }}>Collect at the vendor stall when notified</p>
          </div>
        </div>

        {/* ── Payment Method ── */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '14px 16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 12px' }}>Payment Method</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { id: 'paystack', label: 'Paystack', sub: 'Card, EFT, Mobile Money', icon: '💳' },
                ].map((method) => (
              <div
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: paymentMethod === method.id ? `1.5px solid ${BRAND}` : '1.5px solid #EBEBEB',
                  backgroundColor: paymentMethod === method.id ? '#FFF8F6' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '1.4rem' }}>{method.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{method.label}</p>
                  <p style={{ fontSize: '0.72rem', color: '#888', margin: 0 }}>{method.sub}</p>
                </div>
                <div
                  style={{
                    width: '18px', height: '18px',
                    borderRadius: '50%',
                    border: paymentMethod === method.id ? `5px solid ${BRAND}` : '2px solid #ddd',
                    backgroundColor: 'white',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Order Summary ── */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '14px 16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 12px' }}>Order Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: '#888' }}>Subtotal</span>
              <span style={{ fontSize: '0.85rem', color: '#1a1a2e', fontWeight: 600 }}>R {subtotal}.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: '#888' }}>Service fee</span>
              <span style={{ fontSize: '0.85rem', color: '#1a1a2e', fontWeight: 600 }}>R {serviceFee}.00</span>
            </div>
            <div style={{ borderTop: '1px solid #F5F5F5', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#1a1a2e' }}>Total</span>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: BRAND }}>R {total}.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Place Order Button ── */}
      <div
        style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          padding: '16px',
          backgroundColor: '#F7F5F2',
          borderTop: '1px solid #EBEBEB',
        }}
      >
        <button
          onClick={handlePayment} //changed this line for paystack
          style={{
            width: '100%',
            padding: '1rem',
            background: 'linear-gradient(135deg, #C0474A 0%, #E8726A 100%)',
            color: 'white',
            fontSize: '1rem',
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
          <CreditCard size={18} color="white" />
          Place Order · R {total}
        </button>
      </div>
    </div>
  );
}