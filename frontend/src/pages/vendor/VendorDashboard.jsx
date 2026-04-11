import { useState } from 'react';
import { ShoppingCart, UserRound, UtensilsCrossed, BarChart2, ClipboardList } from 'lucide-react';

const BRAND = '#C0474A';

const tabs = [
  { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
];

const orderFilters = ['All orders', 'Confirmed', 'Preparing', 'Ready'];

const mockOrders = [
  {
    id: 45,
    customer: 'Samele Hlatswayo',
    status: 'Preparing',
    time: '12:30',
    items: [
      { name: '2x Classic Kota', price: 50 },
      { name: '1x Mini Chips', price: 25 },
    ],
    note: 'Add tomato sauce to chips please',
    total: 75,
  },
  {
    id: 54,
    customer: 'Jakarman',
    status: 'Confirmed',
    time: '12:30',
    items: [
      { name: '5x Kota', price: 125 },
    ],
    note: null,
    total: 125,
  },
  {
    id: 87,
    customer: 'Siyangoba Kunene',
    status: 'Ready',
    time: '12:30',
    items: [
      { name: '1x Russian', price: 10 },
    ],
    note: 'add extra flavour :)',
    total: 10,
  },
];

const statusConfig = {
  Confirmed: { bg: '#E8F4FD', color: '#2A6DB5', action: 'Start Preparing', next: 'Preparing', btnBg: 'linear-gradient(135deg, #7B4FBF 0%, #9B6FDF 100%)', btnColor: 'white' },
  Preparing: { bg: '#F0E8FF', color: '#7B4FBF', action: 'Mark Ready',       next: 'Ready',     btnBg: 'linear-gradient(135deg, #2A7D2A 0%, #4CAF50 100%)', btnColor: 'white' },
  Ready:     { bg: '#E8F8E8', color: '#2A7D2A', action: 'Mark as Collected', next: 'Collected', btnBg: 'linear-gradient(135deg, #C0474A 0%, #E8726A 100%)', btnColor: 'white' },
  Collected: { bg: '#F0F0F0', color: '#888',    action: null,                next: null,        btnBg: null, btnColor: null },
};

function OrderCard({ order, onUpdateStatus }) {
  const config = statusConfig[order.status];
  return (
    <article
      style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '1.25rem',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        marginBottom: '1rem',
        border: '1px solid #F0EDE8',
      }}
    >
      {/* Order header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1a2e' }}>
          ORDER NUMBER: {order.id}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              backgroundColor: config.bg,
              color: config.color,
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '3px 12px',
              borderRadius: '20px',
            }}
          >
            {order.status}
          </span>
          <span style={{ fontSize: '0.72rem', color: '#aaa' }}>{order.time}</span>
        </div>
      </div>

      {/* Customer name */}
      <p style={{ fontSize: '0.78rem', color: '#888', marginBottom: '12px' }}>
        {order.customer}
      </p>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #F5F5F5', paddingTop: '12px', marginBottom: '10px' }}>
        <p style={{ fontSize: '0.72rem', color: '#aaa', marginBottom: '6px' }}>Items:</p>

        {/* Items */}
        {order.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.82rem', color: '#444' }}>{item.name}</span>
            <span style={{ fontSize: '0.82rem', color: '#444' }}>R {item.price}.00</span>
          </div>
        ))}

        {/* Customer note */}
        {order.note && (
          <p style={{ fontSize: '0.78rem', color: BRAND, marginTop: '8px', fontStyle: 'italic' }}>
            Customer Notes: {order.note}
          </p>
        )}

        {/* Total */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '10px',
            paddingTop: '8px',
            borderTop: '1px solid #F5F5F5',
          }}
        >
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: BRAND }}>TOTAL</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: BRAND }}>R {order.total}.00</span>
        </div>
      </div>

      {/* Action button */}
      {config.action && (
        <button
          onClick={() => onUpdateStatus(order.id, config.next)}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: config.btnBg,
            color: config.btnColor,
            fontSize: '0.88rem',
            fontWeight: 700,
            border: 'none',
            borderRadius: '2rem',
            cursor: 'pointer',
          }}
        >
          {config.action}
        </button>
      )}
    </article>
  );
}

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const [activeFilter, setActiveFilter] = useState('All orders');
  const [orders, setOrders] = useState(mockOrders);

  const handleUpdateStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const filteredOrders = activeFilter === 'All orders'
    ? orders.filter((o) => o.status !== 'Collected')
    : orders.filter((o) => o.status === activeFilter);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F5F2' }}>

      {/* ── Header ── */}
      <header
        style={{
          backgroundColor: BRAND,
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px', height: '36px',
              backgroundColor: 'white',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ShoppingCart size={18} color={BRAND} strokeWidth={2.5} />
          </div>
          <span style={{ color: 'white', fontSize: '1.2rem', fontWeight: 800 }}>OrderUp</span>
        </div>
        <div
          style={{
            width: '34px', height: '34px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <UserRound size={16} color="white" strokeWidth={2} />
        </div>
      </header>

      {/* ── Hero Banner ── */}
      <section
        style={{
          margin: '16px',
          background: 'linear-gradient(135deg, #C0474A 0%, #E8726A 100%)',
          borderRadius: '18px',
          padding: '20px 24px',
        }}
      >
        <h1 style={{ color: 'white', fontSize: '1.3rem', fontWeight: 800, marginBottom: '4px' }}>
          Jimmy's Dashboard 
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem' }}>
          {orders.filter(o => o.status !== 'Collected').length} active orders today
        </p>
      </section>

      {/* ── Tabs ── */}
      <nav
  style={{
    display: 'flex',
    margin: '0 16px 16px',
    backgroundColor: 'white',
    borderRadius: '14px',
    padding: '6px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    gap: '4px',
  }}
>
  {tabs.map((tab) => {
    const TabIcon = tab.icon;
    return (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '10px',
          borderRadius: '10px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.82rem',
          fontWeight: 600,
          backgroundColor: activeTab === tab.id ? BRAND : 'transparent',
          color: activeTab === tab.id ? 'white' : '#888',
          transition: 'all 0.2s ease',
        }}
      >
        <TabIcon size={15} strokeWidth={2} />
        {tab.label}
      </button>
    );
  })}
</nav>

      {/* ── Orders Tab ── */}
      {activeTab === 'orders' && (
        <section style={{ padding: '0 16px 32px' }}>

          {/* Filter chips */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }}>
            {orderFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: activeFilter === filter ? 'none' : '1.5px solid #E0E0E0',
                  backgroundColor: activeFilter === filter ? BRAND : 'white',
                  color: activeFilter === filter ? 'white' : '#666',
                  transition: 'all 0.15s ease',
                }}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Order cards */}
          {filteredOrders.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#aaa',
                fontSize: '0.9rem',
              }}
            >
              No orders in this category
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={handleUpdateStatus}
              />
            ))
          )}
        </section>
      )}

      {/* ── Menu Tab ── */}
      {activeTab === 'menu' && (
        <section
          style={{
            padding: '0 16px 32px',
            textAlign: 'center',
            color: '#aaa',
            marginTop: '4rem',
            fontSize: '0.9rem',
          }}
        >
          <UtensilsCrossed size={40} color="#ddd" style={{ marginBottom: '12px' }} />
          <p>Menu management coming soon</p>
        </section>
      )}

      {/* ── Analytics Tab ── */}
      {activeTab === 'analytics' && (
        <section
          style={{
            padding: '0 16px 32px',
            textAlign: 'center',
            color: '#aaa',
            marginTop: '4rem',
            fontSize: '0.9rem',
          }}
        >
          <BarChart2 size={40} color="#ddd" style={{ marginBottom: '12px' }} />
          <p>Analytics coming soon</p>
        </section>
      )}

    </div>
  );
}