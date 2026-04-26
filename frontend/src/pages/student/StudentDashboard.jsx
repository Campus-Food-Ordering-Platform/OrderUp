import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Home, Package, History, UserRound, Star, Clock, Search } from 'lucide-react';

const BRAND = '#C0474A';
const filters = ['All', 'Asian', 'Fast Food', 'Cafe', 'Healthy', 'Pizza'];

const iconBtn = {
  width: '34px',
  height: '34px',
  borderRadius: '50%',
  backgroundColor: 'rgba(255,255,255,0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

function VendorCard({ vendor, onPress }) {
  return (
    <article
      onClick={onPress}
      style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)';
      }}
    >
      <div
        style={{
          height: '100px',
          background: `linear-gradient(135deg, ${vendor.bg_from || '#FFE5D0'}, ${vendor.bg_to || '#FFBFA0'})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
        }}
        aria-hidden="true"
      >
        {vendor.emoji || '🍽️'}
      </div>

      <div style={{ padding: '10px 12px' }}>
        <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          {vendor.name || 'Unnamed Vendor'}
        </h3>
        <p style={{ fontSize: '0.72rem', color: '#888', marginBottom: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {vendor.description || 'No description available'}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', fontWeight: 600, color: '#F59E0B' }}>
            <Star size={11} fill="#F59E0B" strokeWidth={0} />
            {vendor.rating || '—'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: '#888' }}>
            <Clock size={11} strokeWidth={2} />
            {vendor.wait || '?'} min
          </span>
          <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#FFF0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: BRAND, fontWeight: 700, fontSize: '0.85rem' }}>
            ›
          </div>
        </div>
      </div>
    </article>
  );
}

export default function StudentDashboard() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOrder, setActiveOrder] = useState(null);//this will hold the active order details, if any

  const location = useLocation();
  const navigate = useNavigate();

  // ── Get name from localStorage if not passed via navigation state ──────────
  const raw = JSON.parse(localStorage.getItem('orderup_user') || '{}');
  const user = raw?.user ?? raw;
  const name = location.state?.name || user?.name || 'there';

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/vendors`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setVendors(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch vendors:', err);
        setError('Could not load vendors. Is your backend running?');
        setLoading(false);
      });
  }, []);

    useEffect(() => {
    if (!user?.id) return;
      const fetchActiveOrder = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/student/${user.id}/active`);
        if (!res.ok) return;
          const data = await res.json();
          setActiveOrder(data);
        } catch (err) {
        console.error('Failed to fetch active order:', err);
        }
    };
    fetchActiveOrder();
  }, [user?.id]);


  // ── Null-safe filter ───────────────────────────────────────────────────────
  const filteredVendors = vendors.filter((vendor) => {
    const matchesFilter = activeFilter === 'All' || vendor.category === activeFilter;
    const matchesSearch =
      (vendor.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleVendorPress = (vendor) => {
    navigate('/vendor-menu', { state: { vendor } });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F5F2' }}>

      {/* ── Header ── */}
      <header style={{ background: 'linear-gradient(135deg, #C0474A 0%, #E8726A 100%)', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', backgroundColor: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
      <div
        onClick={() => navigate('/student-history')}
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
      </div>
      </header>

      {/* ── Hero Banner ── */}
      <section style={{ margin: '16px', background: `linear-gradient(135deg, ${BRAND} 0%, #E8726A 100%)`, borderRadius: '18px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: 'white', fontSize: '1.3rem', fontWeight: 800, marginBottom: '4px' }}>{name}'s Dashboard</h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem' }}>What are you craving today?</p>
        </div>
      </section>

      {/* ── Active Order Status ── */}
      {activeOrder && (
        <section
          onClick={() => navigate('/order-confirmed', {
            state: { orderId: activeOrder.id, vendor: { name: activeOrder.vendor_name }, total: activeOrder.total_amount }
          })}
          style={{ margin: '0 16px 16px', backgroundColor: 'white', borderRadius: '14px', padding: '14px 16px', borderLeft: `4px solid ${BRAND}`, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
        >
          <div>
            <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '2px' }}>Active order · {activeOrder.vendor_name || 'Vendor'}</p>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1a2e' }}>
              {activeOrder.items?.map(i => i.name).join(', ')}
            </p>
          </div>
          <span style={{ backgroundColor: '#FFF0F0', color: BRAND, fontSize: '0.75rem', fontWeight: 600, padding: '4px 14px', borderRadius: '20px' }}>
            {activeOrder.status}
          </span>
        </section>
      )}
      

      {/* ── Search ── */}
      <section style={{ margin: '0 16px 16px', position: 'relative' }}>
        <Search size={16} color="#aaa" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder="Search vendors, cuisines, dishes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '14px', border: '1.5px solid #EBEBEB', backgroundColor: 'white', fontSize: '0.9rem', color: '#444', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', outline: 'none', boxSizing: 'border-box' }}
        />
      </section>

      {/* ── Filter Chips ── */}
      <nav style={{ display: 'flex', gap: '8px', padding: '0 16px 16px', overflowX: 'auto' }}>
        {filters.map((filter) => (
          <button key={filter} onClick={() => setActiveFilter(filter)}
            style={{ padding: '6px 18px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', border: activeFilter === filter ? 'none' : '1.5px solid #E0E0E0', backgroundColor: activeFilter === filter ? BRAND : 'white', color: activeFilter === filter ? 'white' : '#666', transition: 'all 0.15s ease' }}>
            {filter}
          </button>
        ))}
      </nav>

      {/* ── Vendor Grid ── */}
      <section style={{ padding: '0 16px 32px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '12px' }}>Vendors Near You</h2>

        {loading && <p style={{ textAlign: 'center', color: '#aaa', padding: '3rem 0' }}>Loading vendors...</p>}

        {error && (
          <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#FFF0F0', borderRadius: '12px', color: BRAND, fontSize: '0.9rem' }}>
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {filteredVendors.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#aaa', fontSize: '0.9rem' }}>
                No vendors found{searchQuery ? ` for "${searchQuery}"` : ''}.
              </div>
            ) : (
              filteredVendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} onPress={() => handleVendorPress(vendor)} />
              ))
            )}
          </div>
        )}
      </section>

    </div>
  );
}