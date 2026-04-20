import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Plus, Minus, Home, Package, History, UserRound, UtensilsCrossed } from 'lucide-react';

const BRAND = '#C0474A';

const tagColors = {
  Halal:         { bg: '#E0F7EF', color: '#2A9D6A' },
  Vegan:         { bg: '#E8F8E8', color: '#2A7D2A' },
  Vegetarian:    { bg: '#F0FFF0', color: '#3A8A3A' },
  'Nut-free':    { bg: '#FFF8E1', color: '#B8860B' },
  'Gluten-free': { bg: '#F3E8FF', color: '#7B4FBF' },
  'Dairy-free':  { bg: '#E8F4FD', color: '#2A6DB5' },
  'Egg-free':    { bg: '#FFF0F0', color: '#C0474A' },
};

const iconBtn = {
  width: '34px', height: '34px', borderRadius: '50%',
  backgroundColor: 'rgba(255,255,255,0.2)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
};

export default function VendorMenuPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const vendor = state?.vendor;

  const [cart, setCart] = useState({});
  const [activeCategory, setActiveCategory] = useState('All');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch menu items from backend ─────────────────────────────────────────
  useEffect(() => {
    if (!vendor?.id) { setLoading(false); return; }
    fetch(`http://localhost:3000/api/vendors/${vendor.id}/menu`)
      .then(res => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then(data => { setItems(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(err => { console.error('Failed to fetch menu:', err); setLoading(false); });
  }, [vendor?.id]);

  const categories = ['All', ...new Set(items.map(i => i.category).filter(Boolean))];
  const filteredItems = activeCategory === 'All' ? items : items.filter(i => i.category === activeCategory);

  const addToCart = (itemId) => setCart(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  const removeFromCart = (itemId) => setCart(prev => {
    const qty = (prev[itemId] || 0) - 1;
    if (qty <= 0) { const next = { ...prev }; delete next[itemId]; return next; }
    return { ...prev, [itemId]: qty };
  });

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = items.reduce((sum, item) => sum + (cart[item.id] || 0) * item.price, 0);

  if (!vendor) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>No vendor selected. <button onClick={() => navigate('/student-dashboard')}>Go back</button></p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F5F2', paddingBottom: totalItems > 0 ? '100px' : '32px' }}>

      {/* ── Header ── */}
      <header style={{ background: 'linear-gradient(135deg, #C0474A 0%, #E8726A 100%)', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/student-dashboard')}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={18} color="white" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '36px', height: '36px', backgroundColor: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
              🍽️
            </div>
            <span style={{ color: 'white', fontSize: '1.1rem', fontWeight: 800 }}>{vendor.name || 'Vendor'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div onClick={() => navigate('/student-dashboard')} style={iconBtn}><Home size={16} color="white" strokeWidth={2} /></div>
          <div style={iconBtn}><History size={16} color="white" strokeWidth={2} /></div>
          <div style={iconBtn}><UserRound size={16} color="white" strokeWidth={2} /></div>
          <div onClick={() => navigate('/order-confirmed')} style={iconBtn}><Package size={16} color="white" strokeWidth={2} /></div>
          <div style={{ position: 'relative', ...iconBtn }}>
            <ShoppingCart size={16} color="white" strokeWidth={2} />
            {totalItems > 0 && (
              <div style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: 'white', color: BRAND, fontSize: '0.6rem', fontWeight: 800, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {totalItems}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Vendor Info Strip ── */}
      <div style={{ backgroundColor: 'white', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid #EBEBEB' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #FFE5D0, #FFBFA0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0 }}>
          🍽️
        </div>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1a2e', margin: '0 0 4px' }}>{vendor.name || 'Vendor'}</h1>
          <p style={{ fontSize: '0.8rem', color: '#888', margin: '0 0 6px' }}>{vendor.description || 'No description'}</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: 600 }}>⭐ {vendor.rating || '—'}</span>
            <span style={{ fontSize: '0.75rem', color: '#888' }}>🕐 {vendor.wait || '?'} min wait</span>
          </div>
        </div>
      </div>

      {/* ── Category Filter Chips ── */}
      <div style={{ display: 'flex', gap: '8px', padding: '14px 16px', overflowX: 'auto', backgroundColor: 'white', borderBottom: '1px solid #EBEBEB' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            style={{ padding: '6px 18px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', border: activeCategory === cat ? 'none' : '1.5px solid #E0E0E0', backgroundColor: activeCategory === cat ? BRAND : 'white', color: activeCategory === cat ? 'white' : '#666', transition: 'all 0.15s ease' }}>
            {cat}
          </button>
        ))}
      </div>

      {/* ── Menu Grid ── */}
      <section style={{ padding: '16px' }}>
        {loading && <p style={{ textAlign: 'center', color: '#aaa', padding: '3rem' }}>Loading menu...</p>}

        {!loading && items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>
            <UtensilsCrossed size={40} color="#ddd" style={{ marginBottom: '12px' }} />
            <p>No menu items yet.</p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {filteredItems.map(item => {
              const qty = cart[item.id] || 0;
              return (
                <article key={item.id}
                  style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: qty > 0 ? '0 4px 16px rgba(192,71,74,0.15)' : '0 2px 12px rgba(0,0,0,0.07)', border: qty > 0 ? `1.5px solid ${BRAND}` : '1.5px solid transparent', transition: 'all 0.15s ease', display: 'flex', flexDirection: 'column' }}>

                  {/* ── Image / placeholder ── */}
                  <div style={{ height: '90px', overflow: 'hidden', backgroundColor: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.image_url
                      ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <UtensilsCrossed size={28} color="#ddd" />
                    }
                  </div>

                  {/* ── Card body ── */}
                  <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{item.name}</h3>
                    <p style={{ fontSize: '0.72rem', color: '#888', margin: 0, lineHeight: 1.5, flex: 1 }}>{item.description}</p>

                    {/* Tags */}
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {(item.tags || []).map(tag => (
                        <span key={tag} style={{ backgroundColor: tagColors[tag]?.bg || '#F0F0F0', color: tagColors[tag]?.color || '#666', fontSize: '0.62rem', fontWeight: 600, padding: '2px 8px', borderRadius: '20px' }}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Price + Add controls */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: BRAND }}>R {item.price}</span>
                      {qty === 0 ? (
                        <button onClick={() => addToCart(item.id)}
                          style={{ backgroundColor: BRAND, color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                          <Plus size={16} />
                        </button>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button onClick={() => removeFromCart(item.id)}
                            style={{ width: '24px', height: '24px', borderRadius: '50%', border: `1.5px solid ${BRAND}`, backgroundColor: 'white', color: BRAND, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Minus size={12} />
                          </button>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1a2e', minWidth: '14px', textAlign: 'center' }}>{qty}</span>
                          <button onClick={() => addToCart(item.id)}
                            style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: BRAND, border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Plus size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Floating Cart Bar ── */}
      {totalItems > 0 && (
        <div onClick={() => navigate('/checkout', { state: { vendor, cart, items } })}
          style={{ position: 'fixed', bottom: '20px', left: '16px', right: '16px', background: 'linear-gradient(135deg, #C0474A 0%, #E8726A 100%)', borderRadius: '2rem', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 32px rgba(192,71,74,0.4)', cursor: 'pointer', zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCart size={15} color="white" />
            </div>
            <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>{totalItems} item{totalItems > 1 ? 's' : ''}</span>
          </div>
          <span style={{ color: 'white', fontSize: '0.95rem', fontWeight: 800 }}>View Cart · R {totalPrice}.00</span>
        </div>
      )}
    </div>
  );
}