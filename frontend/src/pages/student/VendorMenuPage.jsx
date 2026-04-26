// CHANGED: added useEffect
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Plus, Minus, Leaf, Flame, Home, Package, History, UserRound } from 'lucide-react';

const BRAND = '#C0474A';

const tagColors = {
  Halal:       { bg: '#E0F7EF', color: '#2A9D6A' },
  Vegan:       { bg: '#E8F8E8', color: '#2A7D2A' },
  Vegetarian:  { bg: '#F0FFF0', color: '#3A8A3A' },
  'Nut-free':  { bg: '#FFF8E1', color: '#B8860B' },
};

export default function VendorMenuPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const vendor = state?.vendor;

  const [cart, setCart] = useState({});
  const [activeCategory, setActiveCategory] = useState('All');

  // CHANGED: replaced menuData[vendor?.id] with state + useEffect fetch
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!vendor?.id) return;
    fetch(`${import.meta.env.VITE_API_URL}/api/vendors/${vendor.id}/menu`)
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(err => console.error('Failed to fetch menu:', err));
  }, [vendor?.id]);

  // Build category list dynamically from items
  const categories = ['All', ...new Set(items.map((i) => i.category))];

  const filteredItems = activeCategory === 'All'
    ? items
    : items.filter((i) => i.category === activeCategory);

  const addToCart = (itemId) =>
    setCart((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));

  const removeFromCart = (itemId) =>
    setCart((prev) => {
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
            onClick={() => navigate('/student-dashboard')}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={18} color="white" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: 'white',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
    <ShoppingCart size={18} color={BRAND} strokeWidth={2.5} />
  </div>
  <span style={{ color: 'white', fontSize: '1.2rem', fontWeight: 800 }}>OrderUp</span>
</div>
        </div>

        {/* Nav bar icons */}
<div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
  {[Home, History, UserRound].map((Icon, i) => (
  <div
    key={i}
    style={{
      width: '34px',
      height: '34px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255,255,255,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
    }}
  >
                <Icon size={16} color="white" strokeWidth={2} />
            </div>
            ))}
            <div
            onClick={() => navigate('/order-confirmed')}
            style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
            }}
>
  <Package size={16} color="white" strokeWidth={2} />
</div>

  {/* Cart with badge */}
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

      {/* ── Vendor Info Strip ── */}
      <div
        style={{
          backgroundColor: 'white',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          borderBottom: '1px solid #EBEBEB',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: `linear-gradient(135deg, ${vendor.bgFrom}, ${vendor.bgTo})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            flexShrink: 0,
          }}
        >
          {vendor.emoji}
        </div>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1a2e', margin: '0 0 4px' }}>
            {vendor.name}
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#888', margin: '0 0 6px' }}>{vendor.description}</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: 600 }}>⭐ {vendor.rating}</span>
            <span style={{ fontSize: '0.75rem', color: '#888' }}>🕐 {vendor.wait} min wait</span>
          </div>
        </div>
      </div>

      {/* ── Category Filter Chips ── */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '14px 16px',
          overflowX: 'auto',
          backgroundColor: 'white',
          borderBottom: '1px solid #EBEBEB',
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '6px 18px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              border: activeCategory === cat ? 'none' : '1.5px solid #E0E0E0',
              backgroundColor: activeCategory === cat ? BRAND : 'white',
              color: activeCategory === cat ? 'white' : '#666',
              transition: 'all 0.15s ease',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Menu Grid ── */}
      <section style={{ padding: '16px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '14px',
          }}
        >
          {filteredItems.map((item) => {
            const qty = cart[item.id] || 0;
            return (
              <article
                key={item.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: qty > 0
                    ? `0 4px 16px rgba(192,71,74,0.15)`
                    : '0 2px 12px rgba(0,0,0,0.07)',
                  border: qty > 0 ? `1.5px solid ${BRAND}` : '1.5px solid transparent',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Emoji thumbnail */}
                <div
                  style={{
                    height: '90px',
                    background: `linear-gradient(135deg, ${vendor.bgFrom}, ${vendor.bgTo})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.4rem',
                    flexShrink: 0,
                  }}
                >
                {item.image_url
                ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : '🍽️'}
                </div>

                {/* Card body */}
                <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
                    {item.name}
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: '#888', margin: 0, lineHeight: 1.5, flex: 1 }}>
                    {item.description}
                  </p>

                  {/* Tags — CHANGED: added (item.tags || []) to avoid crash when tags is null */}
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {(item.tags || []).map((tag) => (
                      <span
                        key={tag}
                        style={{
                          backgroundColor: tagColors[tag]?.bg || '#F0F0F0',
                          color: tagColors[tag]?.color || '#666',
                          fontSize: '0.62rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                      >
                        {tag === 'Vegan' && <Leaf size={8} />}
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Calories */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Flame size={10} color="#aaa" />
                    <span style={{ fontSize: '0.68rem', color: '#aaa' }}>{item.calories} kcal</span>
                  </div>

                  {/* Price + Add controls */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: BRAND }}>R {item.price}</span>

                    {!item.available ? (
                      <span style={{
                        fontSize: '0.62rem', fontWeight: 700,
                        backgroundColor: '#F0F0F0', color: '#aaa',
                        padding: '5px 10px', borderRadius: '20px',
                        whiteSpace: 'nowrap',
                      }}>
                        out of stock
                      </span>
                    ) : qty === 0 ? (
                      <button
                        onClick={() => addToCart(item.id)}
                        style={{
                          backgroundColor: BRAND,
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      >
                        <Plus size={16} />
                      </button>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{
                            width: '24px', height: '24px',
                            borderRadius: '50%',
                            border: `1.5px solid ${BRAND}`,
                            backgroundColor: 'white',
                            color: BRAND,
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1a2e', minWidth: '14px', textAlign: 'center' }}>
                          {qty}
                        </span>
                        <button
                          onClick={() => addToCart(item.id)}
                          style={{
                            width: '24px', height: '24px',
                            borderRadius: '50%',
                            backgroundColor: BRAND,
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
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
      </section>

      {/* ── Floating Cart Bar ── */}
      {totalItems > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '16px',
            right: '16px',
            background: 'linear-gradient(135deg, #C0474A 0%, #E8726A 100%)',
            borderRadius: '2rem',
            padding: '1rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 8px 32px rgba(192,71,74,0.4)',
            cursor: 'pointer',
            zIndex: 100,
          }}
          onClick={() => navigate('/checkout', { state: { vendor, cart, items } })}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.25)',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingCart size={15} color="white" />
            </div>
            <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>
              {totalItems} item{totalItems > 1 ? 's' : ''}
            </span>
          </div>
          <span style={{ color: 'white', fontSize: '0.95rem', fontWeight: 800 }}>
            View Cart · R {totalPrice}.00
          </span>
        </div>
      )}
    </div>
  );
}