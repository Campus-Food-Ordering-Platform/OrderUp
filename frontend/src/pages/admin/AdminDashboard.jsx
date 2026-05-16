import { useState, useEffect } from 'react';
import {
  ShoppingCart, Home, UserRound, Store,
  CheckCircle, XCircle, Clock, Search,
  BarChart2, ClipboardList, AlertCircle,
  Package, Banknote, Calendar, Utensils, Coffee, Leaf, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

const BRAND = '#C0474A';

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart2 },
  { id: 'vendors', label: 'Vendors', icon: Store },
];

//  Keys match actual DB enum values: 'active' | 'suspended' | 'pending' | 'rejected'
const statusConfig = {
  active:   { bg: '#E8F8E8', color: '#2A7D2A', label: 'Active' },
  pending:  { bg: '#FFF3CD', color: '#B8860B', label: 'Pending' },
  rejected: { bg: '#FFE8E8', color: '#C0474A', label: 'Rejected' },
  suspended:{ bg: '#FFE8E8', color: '#C0474A', label: 'Suspended' },
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString() : 'N/A';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth0();
  const [showLogout, setShowLogout] = useState(false);

  const [vendors, setVendors]                   = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [activeTab, setActiveTab]               = useState('overview');
  const [vendorFilter, setVendorFilter]         = useState('all');
  const [searchQuery, setSearchQuery]           = useState('');
  const [selectedVendor, setSelectedVendor]     = useState(null);
  const [reviewingVendor, setReviewingVendor]   = useState(null);

  useEffect(() => {
  Promise.all([
    fetch(`${import.meta.env.VITE_API_URL}/api/vendors/admin/all`).then(r => r.json()),
    fetch(`${import.meta.env.VITE_API_URL}/api/vendors/applications/pending`).then(r => r.json()),
  ])
    .then(([vendorData, pendingData]) => {
      const vendors = Array.isArray(vendorData) ? vendorData : [];
      const pending = Array.isArray(pendingData) ? pendingData : [];
      // Merge, avoiding duplicates (approved apps already have a vendor row)
      const vendorAppIds = new Set(vendors.map(v => v.application_id).filter(Boolean));
      const newPending = pending.filter(p => !vendorAppIds.has(p.id));
      setVendors([...vendors, ...newPending]);
      setLoading(false);
    })
    .catch(err => {
      console.error('Failed to fetch vendors:', err);
      setLoading(false);
    });
}, []);

  //  Takes whole vendor object, uses vendor_status for existing vendors
  const handleApprove = async (vendor) => {
  try {
    const isPendingApp = !vendor.vendor_status && vendor.application_status === 'pending';
    const url = isPendingApp
      ? `${import.meta.env.VITE_API_URL}/api/vendors/applications/${vendor.application_id}/approve`
      : `${import.meta.env.VITE_API_URL}/api/vendors/${vendor.id}/status`;
    const body = isPendingApp ? {} : { status: 'active' };
    const method = isPendingApp ? 'POST' : 'PATCH';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setVendors(prev => prev.filter(v => v.id !== vendor.id)); // remove from list; reload will show as active
      setReviewingVendor(null);
    }
  } catch (err) {
    console.error('Failed to approve:', err);
  }
};

  //  Takes whole vendor object, uses vendor_status for existing vendors
  const handleSuspend = async (vendor) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vendors/${vendor.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'suspended' }),
      });
      const data = await res.json();
      console.log('SUSPEND RESPONSE:', res.status, data);
      if (res.ok) {
        setVendors(prev => prev.map(v =>
          v.id === vendor.id ? { ...v, vendor_status: 'suspended' } : v
        ));
        setSelectedVendor(null);
        setReviewingVendor(null);
      }
    } catch (err) {
      console.error('Failed to suspend vendor:', err);
    }
  };

  const handleReject = async (vendor) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/vendors/applications/${vendor.id}/reject`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Application rejected by admin.' }),
      }
    );
    if (res.ok) {
      setVendors(prev => prev.filter(v => v.id !== vendor.id));
      setReviewingVendor(null);
    }
  } catch (err) {
    console.error('Failed to reject vendor:', err);
  }
};

  //  effectiveStatus uses vendor_status first, falls back to application_status
  const filteredVendors = vendors.filter(vendor => {
    const effectiveStatus = vendor.vendor_status || vendor.application_status;
    const matchesFilter = vendorFilter === 'all' || effectiveStatus === vendorFilter;
    const matchesSearch =
      (vendor.vendor_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor.owner_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Stats use correct field names from API response
  const stats = {
    totalVendors: vendors.length,
    active:       vendors.filter(v => v.vendor_status === 'active').length,
    pending:      vendors.filter(v => v.application_status === 'pending').length,
    suspended:    vendors.filter(v => v.vendor_status === 'suspended').length,
    totalRevenue: vendors.reduce((sum, v) => sum + (Number(v.revenue) || 0), 0),
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '16px',
          }}>
            {[
              { label: 'Total Vendors', value: stats.totalVendors, icon: Store,         color: BRAND,      bg: '#FFF0F0' },
              { label: 'Pending',       value: stats.pending,      icon: Clock,         color: '#B8860B',  bg: '#FFF3CD' },
              { label: 'Active',        value: stats.active,       icon: CheckCircle,   color: '#2A7D2A',  bg: '#E8F8E8' },
              { label: 'Suspended',     value: stats.suspended,    icon: XCircle,       color: '#C0474A',  bg: '#FFE8E8' },
              { label: 'Revenue',       value: `R${stats.totalRevenue.toLocaleString()}`, icon: BarChart2, color: '#7B4FBF', bg: '#F0E8FF' },
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

          {/* Filter chips use actual enum values */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }}>
            {['all', 'active', 'pending', 'suspended'].map((filter) => (
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

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa', fontSize: '0.9rem' }}>
              Loading vendors...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredVendors.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa', fontSize: '0.9rem' }}>
                  No vendors found
                </div>
              ) : filteredVendors.map((vendor) => {
                //  Use vendor_status for existing vendors, fall back to application_status
                const effectiveStatus = vendor.vendor_status || vendor.application_status;
                const config = statusConfig[effectiveStatus] || statusConfig.pending;
                const isPending = vendor.application_status === 'pending' && !vendor.vendor_status;
                const isActive = vendor.vendor_status === 'active';
                const isSuspended = vendor.vendor_status === 'suspended';

                return (
                  <article
                    key={vendor.id}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      padding: '1rem',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                      border: isPending ? '1.5px solid #FFE08A' : '1.5px solid transparent',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '52px', height: '52px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #FFE5D0, #FFBFA0)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {vendor.logo_url
                          ? <img src={vendor.logo_url} alt={vendor.vendor_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : vendor.category === 'Asian' || vendor.category === 'Fast Food' || vendor.category === 'Pizza'
                          ? <Utensils size={24} color="#C0474A" />
                          : vendor.category === 'Cafe'
                          ? <Coffee size={24} color="#C0474A" />
                          : vendor.category === 'Healthy'
                          ? <Leaf size={24} color="#C0474A" />
                          : <Store size={24} color="#C0474A" />}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
                            {vendor.vendor_name || vendor.owner_name || 'Unnamed Vendor'}
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
                         {vendor.owner_name}
                        </p>

                        {/* Use isPending not vendor.status === 'pending' */}
                        {isPending ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#FFF3CD', padding: '6px 10px', borderRadius: '8px', width: 'fit-content', border: '1px solid #FFE08A', marginTop: '6px' }}>
                            <FileText size={14} color="#B8860B" />
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#B8860B' }}>
                              Application Pending Review
                            </span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '6px' }}>
                            <span style={{ fontSize: '0.72rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Package size={12} /> {vendor.orders ?? 0} orders
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Banknote size={12} /> R{Number(vendor.revenue || 0).toLocaleString()}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={12} /> {formatDate(vendor.join_date)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      {/* Review Forms — only for pending applications */}
                      {isPending && (
                        <button
                          onClick={() =>{ console.log('RECIEWING VENDOR:', vendor),setReviewingVendor(vendor)}}
                          style={{
                            flex: 1, padding: '8px', backgroundColor: 'transparent', color: '#555',
                            border: '1.5px solid #EBEBEB', borderRadius: '2rem', fontSize: '0.82rem',
                            fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: '6px',
                          }}
                        >
                          <FileText size={14} /> Review Forms
                        </button>
                      )}
                      {/* Approve — hide for already active vendors */}
                      {!isActive && (
                        <button
                          onClick={() => handleApprove(vendor)}
                          style={{
                            flex: 1, padding: '8px',
                            background: 'linear-gradient(135deg, #2A7D2A 0%, #4CAF50 100%)',
                            color: 'white', border: 'none', borderRadius: '2rem', fontSize: '0.82rem',
                            fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: '6px',
                          }}
                        >
                          <CheckCircle size={14} /> {isSuspended ? 'Reinstate' : 'Approve'}
                        </button>
                      )}
                      {/* Suspend — hide for already suspended vendors */}
                      {!isSuspended && !isPending &&(
                        <button
                          onClick={() => handleSuspend(vendor)}
                          style={{
                            flex: 1, padding: '8px', backgroundColor: '#FFE8E8', color: BRAND,
                            border: `1.5px solid ${BRAND}`, borderRadius: '2rem', fontSize: '0.82rem',
                            fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: '6px',
                          }}
                        >
                          <XCircle size={14} /> Suspend
                        </button>
                      )}
                      {isSuspended && (
                        <p style={{ fontSize: '0.78rem', color: '#aaa', margin: 0, padding: '8px 0' }}>
                          Vendor is suspended. Click Reinstate to restore access.
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ── Vendor Review Modal ── */}
      {reviewingVendor && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(26,26,46,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px',
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '24px', width: '100%', maxWidth: '650px',
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          }}>
            <div style={{
              padding: '24px 32px', borderBottom: '1px solid #EBEBEB',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10,
            }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1a1a2e' }}>
                Application Review
              </h2>
              <button onClick={() => setReviewingVendor(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                <XCircle size={24} />
              </button>
            </div>

            <div style={{ padding: '32px' }}>
              {reviewingVendor.banner_url && (
                <div style={{ width: '100%', height: '160px', borderRadius: '14px', overflow: 'hidden', marginBottom: '24px' }}>
                  <img src={reviewingVendor.banner_url} alt="Stall banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #FFE5D0, #FFBFA0)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  {reviewingVendor.logo_url
                    ? <img src={reviewingVendor.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <Store size={30} color={BRAND} />}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.4rem', fontWeight: 800, color: '#1a1a2e' }}>
                    {reviewingVendor.vendor_name || reviewingVendor.owner_name || 'Unnamed Vendor'}
                  </h3>
                  <span style={{ backgroundColor: '#E8F4FD', color: '#2A6DB5', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {Array.isArray(reviewingVendor.category)
                      ? reviewingVendor.category.join(', ')
                      : (reviewingVendor.category || '').replace(/[{}"]/g, '') || 'N/A'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', textTransform: 'uppercase', color: '#888', fontWeight: 700 }}>Owner Details</h4>
                  <p style={{ margin: '0 0 6px', fontSize: '0.95rem', color: '#333' }}><strong>Name:</strong> {reviewingVendor.owner_name || 'N/A'}</p>
                  <p style={{ margin: '0 0 6px', fontSize: '0.95rem', color: '#333' }}><strong>Email:</strong> {reviewingVendor.email || 'N/A'}</p>
                  <p style={{ margin: '0 0 6px', fontSize: '0.95rem', color: '#333' }}><strong>Joined:</strong> {formatDate(reviewingVendor.join_date)}</p>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#333' }}><strong>Submitted:</strong> {formatDate(reviewingVendor.submitted_at)}</p>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', textTransform: 'uppercase', color: '#888', fontWeight: 700 }}>Operations</h4>
                  <p style={{ margin: '0 0 6px', fontSize: '0.95rem', color: '#333' }}><strong>Location:</strong> {reviewingVendor.location || 'N/A'}</p>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#333' }}>
                    <strong>Hours:</strong>{' '}
                    {reviewingVendor.operating_hours
                      ? typeof reviewingVendor.operating_hours === 'object'
                        ? reviewingVendor.operating_hours.hours || JSON.stringify(reviewingVendor.operating_hours)
                        : reviewingVendor.operating_hours
                      : 'N/A'}
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', textTransform: 'uppercase', color: '#888', fontWeight: 700 }}>Business Description</h4>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#444', lineHeight: 1.6, backgroundColor: '#F7F5F2', padding: '16px', borderRadius: '12px' }}>
                  {reviewingVendor.description || reviewingVendor.app_description || 'No description provided.'}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', textTransform: 'uppercase', color: '#888', fontWeight: 700 }}>Compliance</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: reviewingVendor.health_certificate_url ? '#E8F8E8' : '#FFF3CD', borderRadius: '10px' }}>
                    <FileText size={18} color={reviewingVendor.health_certificate_url ? '#2A7D2A' : '#B8860B'} />
                    {reviewingVendor.health_certificate_url ? (
                      <a href={reviewingVendor.health_certificate_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2A7D2A' }}>
                        View Health Certificate
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#B8860B' }}>No certificate uploaded</span>
                    )}
                  </div>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', textTransform: 'uppercase', color: '#888', fontWeight: 700 }}>Revenue</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: '#F0E8FF', borderRadius: '10px' }}>
                    <Banknote size={18} color="#7B4FBF" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#333' }}>R{Number(reviewingVendor.revenue || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', textTransform: 'uppercase', color: '#888', fontWeight: 700 }}>Sample Menu Items</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {reviewingVendor.sample_items && reviewingVendor.sample_items.length > 0 ? (
                     (typeof reviewingVendor.sample_items === 'string'
                    ? reviewingVendor.sample_items.split(',').map(s => s.trim()).filter(Boolean)
                       : reviewingVendor.sample_items
                        ).map((item, idx) => (
                      <span key={idx} style={{ backgroundColor: '#F0F0F0', color: '#444', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                        {item}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.9rem', color: '#888' }}>No sample menu uploaded.</span>
                  )}
                </div>
              </div>

              {reviewingVendor.rejection_reason && (
                <div style={{ backgroundColor: '#FFE8E8', borderRadius: '12px', padding: '16px', border: '1px solid #FFB3B3' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '0.85rem', textTransform: 'uppercase', color: '#C0474A', fontWeight: 700 }}>Previous Rejection Reason</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#444' }}>{reviewingVendor.rejection_reason}</p>
                </div>
              )}
            </div>

            <div style={{ padding: '24px 32px', backgroundColor: '#F9F9F9', borderTop: '1px solid #EBEBEB', display: 'flex', gap: '12px' }}>
              <button
                onClick={() => handleApprove(reviewingVendor)}
                style={{ flex: 2, padding: '14px', background: 'linear-gradient(135deg, #2A7D2A 0%, #4CAF50 100%)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(42,125,42,0.2)' }}
              >
                <CheckCircle size={20} /> Approve Vendor
              </button>
              <button
                onClick={() => handleReject(reviewingVendor)}
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