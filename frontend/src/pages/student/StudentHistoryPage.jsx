import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Home, History, UserRound, Search, HelpCircle, Package, Calendar, MessageSquare, ChevronRight } from 'lucide-react';

const BRAND = '#C0474A';

const mockPastOrders = [
  {
    id: 'ORD-1049',
    vendor: 'Chinese Lantern',
    date: '2026-04-12 13:45',
    total: 85,
    status: 'Completed',
    emoji: '🍜',
    bgFrom: '#FFE5D0',
    bgTo: '#FFBFA0',
    payload: {
      vendor: { id: 1, name: 'Chinese Lantern', emoji: '🍜', bgFrom: '#FFE5D0', bgTo: '#FFBFA0' },
      items: [
        { id: 'c1', name: 'Sweet & Sour Pork', price: 55, emoji: '🍲' },
        { id: 'c2', name: 'Veg Spring Rolls', price: 15, emoji: '🌯' }
      ],
      cart: { 'c1': 1, 'c2': 2 }
    }
  },
  {
    id: 'ORD-0982',
    vendor: "Jimmy's",
    date: '2026-04-10 11:20',
    total: 125,
    status: 'Completed',
    emoji: '🍔',
    bgFrom: '#FFF3CD',
    bgTo: '#FFE08A',
    payload: {
      vendor: { id: 2, name: "Jimmy's", emoji: '🍔', bgFrom: '#FFF3CD', bgTo: '#FFE08A' },
      items: [
        { id: 'j1', name: 'Double Cheeseburger Combo', price: 105, emoji: '🍔' },
        { id: 'j2', name: 'Extra Chips', price: 20, emoji: '🍟' }
      ],
      cart: { 'j1': 1, 'j2': 1 }
    }
  },
  {
    id: 'ORD-0871',
    vendor: 'Pizza Palace',
    date: '2026-04-05 18:30',
    total: 140,
    status: 'Refunded',
    emoji: '🍕',
    bgFrom: '#FFE8E8',
    bgTo: '#FFB3B3',
    payload: {
      vendor: { id: 4, name: "Pizza Palace", emoji: '🍕', bgFrom: '#FFE8E8', bgTo: '#FFB3B3' },
      items: [
        { id: 'p1', name: 'Large Margherita', price: 110, emoji: '🍕' },
        { id: 'p2', name: 'Garlic Bread', price: 30, emoji: '🥖' }
      ],
      cart: { 'p1': 1, 'p2': 1 }
    }
  },
  {
    id: 'ORD-0744',
    vendor: 'Green Bowl',
    date: '2026-04-01 09:15',
    total: 65,
    status: 'Completed',
    emoji: '🥗',
    bgFrom: '#E8F8E8',
    bgTo: '#B3EBB3',
    payload: {
      vendor: { id: 5, name: "Green Bowl", emoji: '🥗', bgFrom: '#E8F8E8', bgTo: '#B3EBB3' },
      items: [
        { id: 'g1', name: 'Berry Bliss Smoothie', price: 25, emoji: '🥤' },
        { id: 'g2', name: 'Chicken Caesar Wrap', price: 40, emoji: '🌯' }
      ],
      cart: { 'g1': 1, 'g2': 1 }
    }
  }
];

export default function StudentHistoryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const filteredOrders = mockPastOrders.filter(order => {
    const matchesSearch = order.vendor.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.payload.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTab = activeTab === 'All' || order.status === activeTab;
    return matchesSearch && matchesTab;
  });

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
          <div
            style={{
              width: '36px', height: '36px', backgroundColor: 'white', borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
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
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <UserRound size={16} color="white" strokeWidth={2} />
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
          {['All', 'Completed', 'Refunded'].map((tab) => (
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
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#aaa', backgroundColor: 'white', borderRadius: '16px', border: '1.5px dashed #ccc' }}>
            <History size={40} color="#e0e0e0" style={{ marginBottom: '10px' }} />
            <p style={{ margin: 0, fontSize: '0.95rem' }}>No orders found.</p>
          </div>
        ) : filteredOrders.map((order) => (
          <div key={order.id} style={{ 
            backgroundColor: 'white', borderRadius: '20px', padding: '16px', 
            boxShadow: '0 4px 14px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.02)'
          }}>
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '14px',
                  background: `linear-gradient(135deg, ${order.bgFrom}, ${order.bgTo})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0
                }}>
                  {order.emoji}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 800, color: '#1a1a2e' }}>{order.vendor}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> {order.date}
                    </span>
                    <span style={{ color: '#ddd' }}>|</span>
                    <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>{order.id}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: BRAND }}>R {order.total}</span>
                <span style={{ 
                  fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', padding: '4px 10px', borderRadius: '20px',
                  backgroundColor: order.status === 'Completed' ? '#E8F8E8' : '#FFF0F0',
                  color: order.status === 'Completed' ? '#2A7D2A' : '#C0474A'
                }}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Items */}
            <div style={{ backgroundColor: '#F9F9F9', borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
              <ul style={{ margin: 0, paddingLeft: '16px', color: '#555', fontSize: '0.85rem', lineHeight: 1.6 }}>
                {order.payload.items.map((item) => (
                  <li key={item.id}><strong>{order.payload.cart[item.id]}x</strong> {item.name}</li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => navigate('/checkout', { state: order.payload })}
                style={{ 
                flex: 1, padding: '10px', backgroundColor: 'white', color: '#333', 
                border: '1.5px solid #EBEBEB', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}>
                <MessageSquare size={14} /> Reorder
              </button>
              <button 
                onClick={() => alert(`Opening support chat for ${order.id}. Real-time support is a future feature!`)}
                style={{ 
                flex: 1, padding: '10px', backgroundColor: '#FFF0F0', color: BRAND, 
                border: 'none', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}>
                <HelpCircle size={14} /> Contact Support
              </button>
            </div>
          </div>
        ))}
      </section>

    </div>
  );
}
