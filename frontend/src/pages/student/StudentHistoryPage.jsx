import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Home, History, UserRound, Search, HelpCircle, MessageSquare, Calendar, ChevronRight, Star, Package } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';

const BRAND = '#C0474A';

// Map DB status values to display labels
const STATUS_LABELS = {
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  collected: 'Completed',
};

export default function StudentHistoryPage() {
  const navigate = useNavigate();
  const { logout } = useAuth0();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [pastOrders, setPastOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogout, setShowLogout] = useState(false);

  const [ratedVendors, setRatedVendors] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rated_vendors')) || []; }
    catch { return []; }
  });
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [hoverValue, setHoverValue] = useState(0);

  useEffect(() => {
    const raw = JSON.parse(localStorage.getItem('orderup_user') || '{}');
    const user = raw?.user ?? raw;
    if (!user?.id) { setLoading(false); return; }

    fetch(`${import.meta.env.VITE_API_URL}/api/orders/student-history/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setPastOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch history:', err);
        setLoading(false);
      });
  }, []);

  const handleOpenRating = (order) => {
    setSelectedOrder(order);
    setRatingValue(0);
    setHoverValue(0);
    setRatingModalOpen(true);
  };

  const handleCloseRating = () => {
    setRatingModalOpen(false);
    setTimeout(() => setSelectedOrder(null), 300);
  };

  const handleSubmitRating = () => {
    if (ratingValue === 0 || !selectedOrder) return;
    const vendorId = selectedOrder.vendor_id;
    const newRated = [...ratedVendors, vendorId];
    setRatedVendors(newRated);
    localStorage.setItem('rated_vendors', JSON.stringify(newRated));
    handleCloseRating();
  };

  const filteredOrders = pastOrders.filter(order => {
    const displayStatus = STATUS_LABELS[order.status] || order.status;
    const matchesSearch =
      order.vendor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(order.items) && order.items.some(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    const matchesTab = activeTab === 'All' || displayStatus === activeTab;
    return matchesSearch && matchesTab;
  });

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-ZA', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

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
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 4px 12px rgba(192, 71, 74, 0.2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/student-dashboard')}>
          <div style={{ width: '36px', height: '36px', backgroundColor: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShoppingCart size={18} color={BRAND} strokeWidth={2.5} />
          </div>
          <span style={{ color: 'white', fontSize: '1.2rem', fontWeight: 800 }}>OrderUp</span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <div onClick={() => navigate('/student-dashboard')} style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Home size={16} color="white" strokeWidth={2} />
          </div>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <History size={16} color="white" strokeWidth={2} />
          </div>
          <div 
            onClick={() => navigate('/order-confirmed')}
            style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <Package size={16} color="white" strokeWidth={2} />
          </div>
          <div 
            onClick={() => navigate('/checkout')}
            style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ShoppingCart size={16} color="white" strokeWidth={2} />
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

      {/* ── Page Title ── */}
      <section style={{ padding: '24px 20px 16px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1a2e', margin: '0 0 8px' }}>
          Order History
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>
          View your past orders, get receipts, and request support if something went wrong.
        </p>
      </section>

      {/* ── Search and Filter ── */}
      <section style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} color="#aaa" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by vendor or food item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '14px 16px 14px 44px', borderRadius: '16px',
              border: '1.5px solid #EBEBEB', backgroundColor: 'white', fontSize: '0.9rem',
              color: '#333', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'Completed', 'Confirmed', 'Preparing', 'Ready'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                backgroundColor: activeTab === tab ? BRAND : 'white',
                color: activeTab === tab ? 'white' : '#666',
                border: activeTab === tab ? 'none' : '1px solid #ddd',
                transition: 'all 0.2s', boxShadow: activeTab === tab ? '0 4px 10px rgba(192, 71, 74, 0.3)' : 'none'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* ── Order List ── */}
      <section style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#aaa', padding: '3rem' }}>Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#aaa', backgroundColor: 'white', borderRadius: '16px', border: '1.5px dashed #ccc' }}>
            <History size={40} color="#e0e0e0" style={{ marginBottom: '10px' }} />
            <p style={{ margin: 0, fontSize: '0.95rem' }}>No orders found.</p>
          </div>
        ) : filteredOrders.map((order) => {
          const displayStatus = STATUS_LABELS[order.status] || order.status;
          const isCompleted = displayStatus === 'Completed';
          const items = Array.isArray(order.items) ? order.items : [];

          return (
            <div key={order.id} style={{
              backgroundColor: 'white', borderRadius: '20px', padding: '16px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.02)'
            }}>
              {/* Top row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '14px',
                    overflow: 'hidden', flexShrink: 0, backgroundColor: '#F5F0E8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
              {order.logo_url ? (
              <img src={order.logo_url} alt={order.vendor_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '1.5rem' }}>🍽️</span>
                )}
              </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 800, color: '#1a1a2e' }}>
                      {order.vendor_name || 'Vendor'}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} /> {formatDate(order.created_at)}
                      </span>
                      <span style={{ color: '#ddd' }}>|</span>
                      <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>
                        #{order.order_number}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: BRAND }}>R {order.total_amount}</span>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', padding: '4px 10px', borderRadius: '20px',
                    backgroundColor: isCompleted ? '#E8F8E8' : '#FFF8E1',
                    color: isCompleted ? '#2A7D2A' : '#C26A1A'
                  }}>
                    {displayStatus}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div style={{ backgroundColor: '#F9F9F9', borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
                <ul style={{ margin: 0, paddingLeft: '16px', color: '#555', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  {items.map((item, idx) => (
                    <li key={idx}>
                      <strong>{item.quantity}x</strong> {item.name} — R {item.price}
                    </li>
                  ))}
                </ul>
                {order.note && (
                  <p style={{ fontSize: '0.78rem', color: BRAND, fontStyle: 'italic', margin: '8px 0 0', paddingTop: '8px', borderTop: '1px solid #EBEBEB' }}>
                    Note: "{order.note}"
                  </p>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
  onClick={() => navigate('/checkout', {//reorder button
    state: {
      vendor: { 
        id: order.vendor_id, 
        name: order.vendor_name,
        emoji: '🍽️',
        bgFrom: '#FFE5D0',
        bgTo: '#FFBFA0'
      },
      items: order.items.map(item => ({
        id: item.name, 
        name: item.name,
        price: item.price,
        emoji: '🍽️'
      })),
      cart: order.items.reduce((acc, item) => ({
        ...acc,
        [item.name]: item.quantity
      }), {})
    }
  })}
  style={{
    flex: 1, padding: '10px', backgroundColor: 'white', color: '#333',
    border: '1.5px solid #EBEBEB', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
  }}>
  <MessageSquare size={14} /> Reorder
</button>
                {isCompleted && !ratedVendors.includes(order.vendor_id) && (
                  <button
                    onClick={() => handleOpenRating(order)}
                    style={{
                      flex: 1, padding: '10px', backgroundColor: '#FFFDF0', color: '#F59E0B',
                      border: '1.5px solid #FDE68A', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                    }}>
                    <Star size={14} fill="#F59E0B" /> Rate
                  </button>
                )}

                <button
                  onClick={() => window.location.href = `mailto:support@orderup.com?subject=Support Request for Order #${order.order_number}`}
                  style={{
                    flex: 1, padding: '10px', backgroundColor: '#FFF0F0', color: BRAND,
                    border: 'none', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}>
                  <HelpCircle size={14} /> Contact Support
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* ── Rating Modal ── */}
      {ratingModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)', padding: '20px'
        }} onClick={handleCloseRating}>
          <div style={{
            backgroundColor: 'white', borderRadius: '24px', padding: '32px 24px',
            width: '100%', maxWidth: '360px', textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }} onClick={e => e.stopPropagation()}>

            <div style={{
              width: '64px', height: '64px', borderRadius: '20px', margin: '0 auto 16px',
              overflow: 'hidden', backgroundColor: '#F5F0E8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            {selectedOrder?.logo_url ? (
              <img src={selectedOrder.logo_url} alt={selectedOrder?.vendor_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '2rem' }}>🍽️</span>
              )}
          </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a1a2e', margin: '0 0 8px' }}>
              How was your food?
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#666', margin: '0 0 24px' }}>
              Rate your experience with {selectedOrder?.vendor_name}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '0 0 32px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <div
                  key={star}
                  onMouseEnter={() => setHoverValue(star)}
                  onMouseLeave={() => setHoverValue(0)}
                  onClick={() => setRatingValue(star)}
                  style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
                >
                  <Star
                    size={40}
                    fill={(hoverValue || ratingValue) >= star ? "#F59E0B" : "transparent"}
                    color={(hoverValue || ratingValue) >= star ? "#F59E0B" : "#DDD"}
                    strokeWidth={1.5}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleSubmitRating}
              disabled={ratingValue === 0}
              style={{
                width: '100%', padding: '14px', borderRadius: '16px', border: 'none',
                backgroundColor: ratingValue > 0 ? BRAND : '#E0E0E0',
                color: 'white', fontSize: '1rem', fontWeight: 700, cursor: ratingValue > 0 ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.2s'
              }}
            >
              Submit Review
            </button>
            <button
              onClick={handleCloseRating}
              style={{
                width: '100%', padding: '12px', borderRadius: '16px', border: 'none',
                backgroundColor: 'transparent', color: '#888', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                marginTop: '8px'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}