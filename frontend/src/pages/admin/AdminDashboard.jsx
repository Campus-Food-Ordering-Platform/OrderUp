import { useState } from 'react';
import {
  ShoppingCart, Home, UserRound, Store,
  CheckCircle, XCircle, Clock, Search,
  BarChart2, Users, ClipboardList, AlertCircle,
  Package, Banknote, Calendar, Utensils, Coffee, Leaf, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BRAND = '#C0474A';

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart2 },
  { id: 'vendors', label: 'Vendors', icon: Store },
  { id: 'orders', label: 'Disputes', icon: Search },
];

const mockVendors = [
  {
    id: 1, name: 'Chinese Lantern', owner: 'Lee Wong',
    email: 'lee@chineselantern.co.za', category: 'Asian',
    status: 'approved', joinDate: '2026-03-01', orders: 145, revenue: 8750,
    emoji: '🍜', bgFrom: '#FFE5D0', bgTo: '#FFBFA0',
  },
  {
    id: 2, name: "Jimmy's", owner: 'Jimmy Dlamini',
    email: 'jimmy@jimmys.co.za', category: 'Fast Food',
    status: 'approved', joinDate: '2026-03-05', orders: 230, revenue: 12400,
    emoji: '🍔', bgFrom: '#FFF3CD', bgTo: '#FFE08A',
  },
  {
    id: 3, name: 'Xpresso Cafe', owner: 'Sara Naidoo',
    email: 'sara@xpresso.co.za', category: 'Cafe',
    status: 'pending', joinDate: '2026-04-10', orders: 0, revenue: 0,
    emoji: '☕', bgFrom: '#E8F4FD', bgTo: '#B3D9F5',
    applicationDetails: {
      phone: '082 555 0192',
      location: 'Matrix Food Court, Stall 4',
      hours: '07:00 - 17:00',
      description: 'Specialty coffee, pastries, and quick grab-and-go health wraps for students on the move.',
      healthCert: 'Valid (Expires Nov 2026)',
      bankInfo: 'Standard Bank •••• 4592',
      sampleMenu: ['Flat White', 'Almond Croissant', 'Chicken Caesar Wrap', 'Iced Matcha Latte']
    }
  },
  {
    id: 4, name: 'Pizza Palace', owner: 'Marco Rossi',
    email: 'marco@pizzapalace.co.za', category: 'Pizza',
    status: 'approved', joinDate: '2026-03-12', orders: 189, revenue: 15200,
    emoji: '🍕', bgFrom: '#FFE8E8', bgTo: '#FFB3B3',
  },
  {
    id: 5, name: 'Green Bowl', owner: 'Amara Osei',
    email: 'amara@greenbowl.co.za', category: 'Healthy',
    status: 'suspended', joinDate: '2026-02-20', orders: 67, revenue: 3400,
    emoji: '🥗', bgFrom: '#E8F8E8', bgTo: '#B3EBB3',
  },
  {
    id: 6, name: 'Spice Route', owner: 'Fatima Khan',
    email: 'fatima@spiceroute.co.za', category: 'Asian',
    status: 'pending', joinDate: '2026-04-11', orders: 0, revenue: 0,
    emoji: '🍛', bgFrom: '#FFF0D0', bgTo: '#FFD580',
    applicationDetails: {
      phone: '071 234 5678',
      location: 'Student Union, Ground Floor',
      hours: '10:00 - 19:00',
      description: 'Authentic Indian curries, samoosas, and bunny chows perfect for hearty student lunches.',
      healthCert: 'Pending Follow-up Verification',
      bankInfo: 'FNB •••• 1104',
      sampleMenu: ['Butter Chicken', 'Mutton Bunny Chow', 'Potato Samoosa 3pc', 'Mango Lassi']
    }
  },
];

const mockOrders = [
  { id: 45, vendor: "Jimmy's", student: 'Samele Hlatswayo', total: 75, status: 'Preparing', time: '12:30' },
  { id: 54, vendor: "Jimmy's", student: 'Jakarman Singh', total: 125, status: 'Confirmed', time: '12:35' },
  { id: 87, vendor: 'Chinese Lantern', student: 'Siyangoba Kunene', total: 55, status: 'Ready', time: '12:20' },
  { id: 92, vendor: 'Pizza Palace', student: 'Thabo Mokoena', total: 90, status: 'Collected', time: '12:10' },
  { id: 103, vendor: 'Green Bowl', student: 'Aisha Patel', total: 45, status: 'Confirmed', time: '12:40' },
];

const statusConfig = {
  approved:  { bg: '#E8F8E8', color: '#2A7D2A', label: 'Approved' },
  pending:   { bg: '#FFF3CD', color: '#B8860B', label: 'Pending' },
  suspended: { bg: '#FFE8E8', color: '#C0474A', label: 'Suspended' },
};

const orderStatusConfig = {
  Confirmed: { bg: '#E8F4FD', color: '#2A6DB5' },
  Preparing: { bg: '#F0E8FF', color: '#7B4FBF' },
  Ready:     { bg: '#E8F8E8', color: '#2A7D2A' },
  Collected: { bg: '#F0F0F0', color: '#888' },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [vendors, setVendors] = useState(mockVendors);
  const [vendorFilter, setVendorFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [reviewingVendor, setReviewingVendor] = useState(null);

  const handleApprove = (id) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, status: 'approved' } : v));
    setSelectedVendor(null);
    setReviewingVendor(null);
  };

  const handleSuspend = (id) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, status: 'suspended' } : v));
    setSelectedVendor(null);
    setReviewingVendor(null);
  };

  const filteredVendors = vendors.filter(v => {
    const matchesFilter = vendorFilter === 'all' || v.status === vendorFilter;
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.owner.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    totalVendors: vendors.length,
    approved: vendors.filter(v => v.status === 'approved').length,
    pending: vendors.filter(v => v.status === 'pending').length,
    suspended: vendors.filter(v => v.status === 'suspended').length,
    totalOrders: mockOrders.length,
    totalRevenue: vendors.reduce((sum, v) => sum + v.revenue, 0),
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F5F2' }}>

      {/* ── Header ── */}
      <header style={{
        background: 'linear-gradient(135deg, #C0474A 0%, #E8726A 100%)',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px',
            backgroundColor: 'white', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
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
            <UserRound size={16} color="white" strokeWidth={2} />
          </div>
        </div>
      </header>

      {/* ── Hero Banner ── */}
      <section style={{
        margin: '16px',
        background: 'linear-gradient(135deg, #C0474A 0%, #E8726A 100%)',
        borderRadius: '18px',
        padding: '20px 24px',
      }}>
        <h1 style={{ color: 'white', fontSize: '1.3rem', fontWeight: 800, margin: '0 0 4px' }}>
          Admin Dashboard
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: 0 }}>
          Manage vendors, monitor orders and oversee the platform
        </p>
      </section>

      {/* ── Tabs ── */}
      <nav style={{
        display: 'flex',
        margin: '0 16px 16px',
        backgroundColor: 'white',
        borderRadius: '14px',
        padding: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        gap: '4px',
      }}>
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

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <section style={{ padding: '0 16px 32px' }}>

          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '16px',
          }}>
            {[
              { label: 'Total Vendors', value: stats.totalVendors, icon: Store, color: BRAND, bg: '#FFF0F0' },
              { label: 'Pending Approval', value: stats.pending, icon: Clock, color: '#B8860B', bg: '#FFF3CD' },
              { label: 'Total Orders', value: stats.totalOrders, icon: ClipboardList, color: '#2A6DB5', bg: '#E8F4FD' },
              { label: 'Approved', value: stats.approved, icon: CheckCircle, color: '#2A7D2A', bg: '#E8F8E8' },
              { label: 'Suspended', value: stats.suspended, icon: XCircle, color: '#C0474A', bg: '#FFE8E8' },
              { label: 'Revenue', value: `R${stats.totalRevenue.toLocaleString()}`, icon: BarChart2, color: '#7B4FBF', bg: '#F0E8FF' },
            ].map((stat) => {
              const StatIcon = stat.icon;
              return (
                <div key={stat.label} style={{
                  backgroundColor: 'white',
                  borderRadius: '14px',
                  padding: '14px 12px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}>
                  <div style={{
                    width: '36px', height: '36px',
                    borderRadius: '10px',
                    backgroundColor: stat.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <StatIcon size={18} color={stat.color} strokeWidth={2} />
                  </div>
                  <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1a1a2e', margin: 0 }}>
                    {stat.value}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: '#888', margin: 0 }}>{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Pending Vendors Alert */}
          {stats.pending > 0 && (
            <div style={{
              backgroundColor: '#FFF3CD',
              borderRadius: '14px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
              border: '1px solid #FFE08A',
            }}>
              <AlertCircle size={20} color="#B8860B" />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 2px' }}>
                  {stats.pending} vendor{stats.pending > 1 ? 's' : ''} awaiting approval
                </p>
                <p style={{ fontSize: '0.75rem', color: '#888', margin: 0 }}>
                  Review and approve or reject pending vendor applications
                </p>
              </div>
              <button
                onClick={() => { setActiveTab('vendors'); setVendorFilter('pending'); }}
                style={{
                  backgroundColor: '#B8860B',
                  color: 'white',
                  border: 'none',
                  borderRadius: '2rem',
                  padding: '6px 16px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Review Now
              </button>
            </div>
          )}


        </section>
      )}

      {/* ── Vendors Tab ── */}
      {activeTab === 'vendors' && (
        <section style={{ padding: '0 16px 32px' }}>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <Search size={16} color="#aaa" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search vendors or owners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 42px',
                borderRadius: '14px',
                border: '1.5px solid #EBEBEB',
                backgroundColor: 'white',
                fontSize: '0.9rem',
                color: '#444',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Filter chips */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }}>
            {['all', 'approved', 'pending', 'suspended'].map((filter) => (
              <button
                key={filter}
                onClick={() => setVendorFilter(filter)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: vendorFilter === filter ? 'none' : '1.5px solid #E0E0E0',
                  backgroundColor: vendorFilter === filter ? BRAND : 'white',
                  color: vendorFilter === filter ? 'white' : '#666',
                  transition: 'all 0.15s ease',
                  textTransform: 'capitalize',
                }}
              >
                {filter === 'all' ? 'All Vendors' : filter}
                {filter === 'pending' && stats.pending > 0 && (
                  <span style={{
                    marginLeft: '6px',
                    backgroundColor: '#B8860B',
                    color: 'white',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {stats.pending}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Vendor Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredVendors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa', fontSize: '0.9rem' }}>
                No vendors found
              </div>
            ) : filteredVendors.map((vendor) => {
              const config = statusConfig[vendor.status];
              return (
                <article
                  key={vendor.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '1rem',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                    border: vendor.status === 'pending' ? '1.5px solid #FFE08A' : '1.5px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Vendor Icon */}
                    <div style={{
                      width: '52px', height: '52px',
                      borderRadius: '14px',
                      background: `linear-gradient(135deg, ${vendor.bgFrom}, ${vendor.bgTo})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {vendor.category === 'Asian' || vendor.category === 'Fast Food' || vendor.category === 'Pizza' ? <Utensils size={24} color="#C0474A" /> :
                       vendor.category === 'Cafe' ? <Coffee size={24} color="#C0474A" /> :
                       vendor.category === 'Healthy' ? <Leaf size={24} color="#C0474A" /> :
                       <Store size={24} color="#C0474A" />}
                    </div>

                    {/* Vendor info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
                          {vendor.name}
                        </h3>
                        <span style={{
                          backgroundColor: config.bg,
                          color: config.color,
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          padding: '2px 10px',
                          borderRadius: '20px',
                        }}>
                          {config.label}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#888', margin: '0 0 4px' }}>
                        {vendor.owner} · {vendor.email}
                      </p>
                      
                      {vendor.status === 'pending' ? (
                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#FFF3CD', padding: '6px 10px', borderRadius: '8px', width: 'fit-content', border: '1px solid #FFE08A', marginTop: '6px' }}>
                           <FileText size={14} color="#B8860B" />
                           <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#B8860B' }}>
                             Application Pending Review
                           </span>
                         </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '6px' }}>
                          <span style={{ fontSize: '0.72rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Package size={12} /> {vendor.orders} orders
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Banknote size={12} /> R{vendor.revenue.toLocaleString()}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} /> {vendor.joinDate}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    {vendor.status === 'pending' && (
                      <button
                        onClick={() => setReviewingVendor(vendor)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          backgroundColor: 'transparent',
                          color: '#555',
                          border: '1.5px solid #EBEBEB',
                          borderRadius: '2rem',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <FileText size={14} />
                        Review Forms
                      </button>
                    )}
                    {vendor.status !== 'approved' && (
                      <button
                        onClick={() => handleApprove(vendor.id)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          background: 'linear-gradient(135deg, #2A7D2A 0%, #4CAF50 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '2rem',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <CheckCircle size={14} />
                        Approve
                      </button>
                    )}
                    {vendor.status !== 'suspended' && (
                      <button
                        onClick={() => handleSuspend(vendor.id)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          backgroundColor: '#FFE8E8',
                          color: BRAND,
                          border: `1.5px solid ${BRAND}`,
                          borderRadius: '2rem',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <XCircle size={14} />
                        Suspend
                      </button>
                    )}
                    {vendor.status === 'suspended' && (
                      <p style={{ fontSize: '0.78rem', color: '#aaa', margin: 0, padding: '8px 0' }}>
                        This vendor is suspended. Approve to reinstate.
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Disputes / Orders Tab ── */}
      {activeTab === 'orders' && (
        <section style={{ padding: '0 16px 32px' }}>
          
          <div style={{ marginBottom: '16px', backgroundColor: '#FFF0F0', padding: '16px', borderRadius: '16px', border: `1px solid #FFD0D0` }}>
            <h2 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 800, color: '#C0474A' }}>Order Lookup & Disputes</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
              Search for orders to resolve student or vendor disputes. In the real world, admins step in when an order is delayed, missing, or needs an override refund.
            </p>
          </div>

          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <Search size={18} color="#aaa" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by Order ID (e.g. 45), student, or vendor..."
              value={orderSearchQuery}
              onChange={(e) => setOrderSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '14px 16px 14px 46px', borderRadius: '14px', border: '1.5px solid #EBEBEB',
                fontSize: '0.95rem', color: '#333', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', boxSizing: 'border-box', outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {orderSearchQuery.trim() === '' ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#aaa' }}>
                <Search size={40} color="#e0e0e0" style={{ marginBottom: '10px' }} />
                <p style={{ margin: 0, fontSize: '0.95rem' }}>Enter a search term to find a specific order</p>
              </div>
            ) : mockOrders.filter(o => 
                String(o.id).includes(orderSearchQuery) || 
                o.student.toLowerCase().includes(orderSearchQuery.toLowerCase()) || 
                o.vendor.toLowerCase().includes(orderSearchQuery.toLowerCase())
              ).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#aaa', fontSize: '0.9rem' }}>
                No orders match your search.
              </div>
            ) : mockOrders
                .filter(o => 
                  String(o.id).includes(orderSearchQuery) || 
                  o.student.toLowerCase().includes(orderSearchQuery.toLowerCase()) || 
                  o.vendor.toLowerCase().includes(orderSearchQuery.toLowerCase())
                )
                .map((order) => (
              <div key={order.id} style={{ backgroundColor: 'white', borderRadius: '14px', padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1a1a2e', margin: '0 0 4px' }}>
                      Order #{order.id}
                    </h4>
                    <span style={{ backgroundColor: orderStatusConfig[order.status]?.bg, color: orderStatusConfig[order.status]?.color, fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px' }}>
                      {order.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: BRAND }}>
                    R {order.total}
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', backgroundColor: '#F9F9F9', padding: '12px', borderRadius: '10px' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', color: '#aaa', fontWeight: 700, marginBottom: '2px' }}>Vendor</span>
                    <span style={{ fontSize: '0.85rem', color: '#333', fontWeight: 600 }}>{order.vendor}</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', color: '#aaa', fontWeight: 700, marginBottom: '2px' }}>Customer</span>
                    <span style={{ fontSize: '0.85rem', color: '#333', fontWeight: 600 }}>{order.student}</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', color: '#aaa', fontWeight: 700, marginBottom: '2px' }}>Time</span>
                    <span style={{ fontSize: '0.85rem', color: '#333', fontWeight: 600 }}>{order.time}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button style={{ flex: 1, padding: '8px', backgroundColor: BRAND, color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                    Process Refund
                  </button>
                  <button style={{ flex: 1, padding: '8px', backgroundColor: 'transparent', color: '#333', border: '1.5px solid #ddd', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                    Contact Parties
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Vendor Review Modal ── */}
      {reviewingVendor && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(26,26,46,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '24px', width: '100%', maxWidth: '650px',
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #EBEBEB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1a1a2e' }}>
                Application Review
              </h2>
              <button 
                onClick={() => setReviewingVendor(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div style={{ padding: '32px' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: `linear-gradient(135deg, ${reviewingVendor.bgFrom}, ${reviewingVendor.bgTo})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Store size={30} color={BRAND} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.4rem', fontWeight: 800, color: '#1a1a2e' }}>{reviewingVendor.name}</h3>
                  <span style={{ backgroundColor: '#E8F4FD', color: '#2A6DB5', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>Category: {reviewingVendor.category}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', textTransform: 'uppercase', color: '#888', fontWeight: 700 }}>Owner Details</h4>
                  <p style={{ margin: '0 0 6px', fontSize: '0.95rem', color: '#333' }}><strong>Name:</strong> {reviewingVendor.owner}</p>
                  <p style={{ margin: '0 0 6px', fontSize: '0.95rem', color: '#333' }}><strong>Email:</strong> {reviewingVendor.email}</p>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#333' }}><strong>Phone:</strong> {reviewingVendor.applicationDetails?.phone || 'N/A'}</p>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', textTransform: 'uppercase', color: '#888', fontWeight: 700 }}>Operations</h4>
                  <p style={{ margin: '0 0 6px', fontSize: '0.95rem', color: '#333' }}><strong>Location:</strong> {reviewingVendor.applicationDetails?.location || 'N/A'}</p>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#333' }}><strong>Hours:</strong> {reviewingVendor.applicationDetails?.hours || 'N/A'}</p>
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', textTransform: 'uppercase', color: '#888', fontWeight: 700 }}>Business Description</h4>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#444', lineHeight: 1.6, backgroundColor: '#F7F5F2', padding: '16px', borderRadius: '12px' }}>
                  {reviewingVendor.applicationDetails?.description || 'No description provided.'}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', textTransform: 'uppercase', color: '#888', fontWeight: 700 }}>Compliance</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: reviewingVendor.applicationDetails?.healthCert?.includes('Valid') ? '#E8F8E8' : '#FFF3CD', borderRadius: '10px' }}>
                    <FileText size={18} color={reviewingVendor.applicationDetails?.healthCert?.includes('Valid') ? '#2A7D2A' : '#B8860B'} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#333' }}>Health: {reviewingVendor.applicationDetails?.healthCert || 'N/A'}</span>
                  </div>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', textTransform: 'uppercase', color: '#888', fontWeight: 700 }}>Banking</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: '#F0E8FF', borderRadius: '10px' }}>
                    <Banknote size={18} color="#7B4FBF" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#333' }}>{reviewingVendor.applicationDetails?.bankInfo || 'Not Provided'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', textTransform: 'uppercase', color: '#888', fontWeight: 700 }}>Sample Menu Items</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {(reviewingVendor.applicationDetails?.sampleMenu || []).map((item, idx) => (
                    <span key={idx} style={{ backgroundColor: '#F0F0F0', color: '#444', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                      {item}
                    </span>
                  ))}
                  {(!reviewingVendor.applicationDetails?.sampleMenu || reviewingVendor.applicationDetails.sampleMenu.length === 0) && (
                    <span style={{ fontSize: '0.9rem', color: '#888' }}>No menu uploaded.</span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ padding: '24px 32px', backgroundColor: '#F9F9F9', borderTop: '1px solid #EBEBEB', display: 'flex', gap: '12px' }}>
              <button
                onClick={() => handleApprove(reviewingVendor.id)}
                style={{ flex: 2, padding: '14px', background: 'linear-gradient(135deg, #2A7D2A 0%, #4CAF50 100%)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(42,125,42,0.2)' }}
              >
                <CheckCircle size={20} /> Approve Vendor
              </button>
              <button
                onClick={() => handleSuspend(reviewingVendor.id)}
                style={{ flex: 1, padding: '14px', backgroundColor: '#FFE8E8', color: '#C0474A', border: '1.5px solid #C0474A', borderRadius: '14px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <XCircle size={18} /> Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}