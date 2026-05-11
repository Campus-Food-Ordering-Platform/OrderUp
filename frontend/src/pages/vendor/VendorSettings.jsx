import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, User, MapPin, Clock, FileText, Save, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const BRAND = '#C0474A';

export default function VendorSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [vendorData, setVendorData] = useState({
    name: '',
    description: '',
    category: '',
    location: '',
    operating_hours: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    fetchVendorData();
  }, []);

  const fetchVendorData = async () => {
    try {
      const raw = JSON.parse(localStorage.getItem('orderup_user') || '{}');
      const userId = raw?.id || raw?.user?.id;
      
      if (!userId) {
        navigate('/');
        return;
      }

      const statusRes = await fetch(`${import.meta.env.VITE_API_URL}/api/vendors/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: userId })
      });
      const statusData = await statusRes.json();
      
      if (statusData.id) {
        const vendorRes = await fetch(`${import.meta.env.VITE_API_URL}/api/vendors/${statusData.id}`);
        const vendorInfo = await vendorRes.json();
        
        setVendorData({
          name: vendorInfo.name || '',
          description: vendorInfo.description || '',
          category: vendorInfo.category?.[0] || '',
          location: vendorInfo.location || '',
          operating_hours: vendorInfo.operating_hours?.hours || '',
          phone: vendorInfo.phone || '',
          email: vendorInfo.email || ''
        });
      }
    } catch (error) {
      console.error('Error fetching vendor data:', error);
      setErrorMessage('Failed to load vendor information');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!vendorData.name.trim()) {
      setErrorMessage('Stall name is required');
      setShowError(true);
      return false;
    }
    if (!vendorData.location.trim()) {
      setErrorMessage('Location is required');
      setShowError(true);
      return false;
    }
    if (vendorData.phone && !/^[0-9]{10}$/.test(vendorData.phone.replace(/\D/g, ''))) {
      setErrorMessage('Please enter a valid 10-digit phone number');
      setShowError(true);
      return false;
    }
    if (vendorData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vendorData.email)) {
      setErrorMessage('Please enter a valid email address');
      setShowError(true);
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    setShowError(false);
    
    try {
      const raw = JSON.parse(localStorage.getItem('orderup_user') || '{}');
      const userId = raw?.id || raw?.user?.id;
      
      const statusRes = await fetch(`${import.meta.env.VITE_API_URL}/api/vendors/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: userId })
      });
      const statusData = await statusRes.json();
      
      if (statusData.id) {
        const updateRes = await fetch(`${import.meta.env.VITE_API_URL}/api/vendors/${statusData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...vendorData,
            category: vendorData.category ? [vendorData.category] : []
          })
        });
        
        if (updateRes.ok) {
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            navigate('/vendor-dashboard');
          }, 1500);
        } else {
          throw new Error('Failed to update profile');
        }
      }
    } catch (error) {
      console.error('Error saving vendor data:', error);
      setErrorMessage('Failed to save changes. Please try again.');
      setShowError(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F7F5F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: `3px solid ${BRAND}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#888' }}>Loading vendor information...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F5F2' }}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Success Toast */}
      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#2A7D2A',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease'
        }}>
          <CheckCircle size={18} />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {/* Error Toast */}
      {showError && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#C0474A',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease'
        }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Header */}
      <header style={{ backgroundColor: BRAND, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button 
          onClick={() => navigate('/vendor-dashboard')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div style={{ width: '36px', height: '36px', backgroundColor: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Store size={18} color={BRAND} strokeWidth={2.5} />
        </div>
        <span style={{ color: 'white', fontSize: '1.2rem', fontWeight: 800 }}>Vendor Settings</span>
      </header>

      {/* Form */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '20px' }}>
            Edit Vendor Information
          </h2>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555', marginBottom: '6px', display: 'block' }}>
              <Store size={14} style={{ display: 'inline', marginRight: '4px' }} /> Stall Name <span style={{ color: BRAND }}>*</span>
            </label>
            <input
              type="text"
              value={vendorData.name}
              onChange={(e) => setVendorData({ ...vendorData, name: e.target.value })}
              placeholder="Enter your stall name"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #EBEBEB', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = BRAND}
              onBlur={(e) => e.target.style.borderColor = '#EBEBEB'}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555', marginBottom: '6px', display: 'block' }}>
              <FileText size={14} style={{ display: 'inline', marginRight: '4px' }} /> Description <span style={{ color: BRAND }}>*</span>
            </label>
            <textarea
              value={vendorData.description}
              onChange={(e) => setVendorData({ ...vendorData, description: e.target.value })}
              rows={4}
              placeholder="Describe your stall, cuisine type, and what makes your food special..."
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #EBEBEB', fontSize: '0.9rem', resize: 'vertical', outline: 'none', fontFamily: 'inherit' }}
              onFocus={(e) => e.target.style.borderColor = BRAND}
              onBlur={(e) => e.target.style.borderColor = '#EBEBEB'}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555', marginBottom: '6px', display: 'block' }}>Category</label>
            <select
              value={vendorData.category}
              onChange={(e) => setVendorData({ ...vendorData, category: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #EBEBEB', fontSize: '0.9rem', outline: 'none', backgroundColor: 'white' }}
              onFocus={(e) => e.target.style.borderColor = BRAND}
              onBlur={(e) => e.target.style.borderColor = '#EBEBEB'}
            >
              <option value="">Select Category</option>
              <option value="Fast Food"> Fast Food</option>
              <option value="Cafe"> Cafe</option>
              <option value="Asian"> Asian</option>
              <option value="Pizza"> Pizza</option>
              <option value="Healthy"> Healthy</option>
              <option value="Indian"> Indian</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555', marginBottom: '6px', display: 'block' }}>
              <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} /> Location <span style={{ color: BRAND }}>*</span>
            </label>
            <input
              type="text"
              value={vendorData.location}
              onChange={(e) => setVendorData({ ...vendorData, location: e.target.value })}
              placeholder="e.g., Matrix Food Court, Stall 4"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #EBEBEB', fontSize: '0.9rem', outline: 'none' }}
              onFocus={(e) => e.target.style.borderColor = BRAND}
              onBlur={(e) => e.target.style.borderColor = '#EBEBEB'}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555', marginBottom: '6px', display: 'block' }}>
              <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} /> Operating Hours
            </label>
            <input
              type="text"
              value={vendorData.operating_hours}
              onChange={(e) => setVendorData({ ...vendorData, operating_hours: e.target.value })}
              placeholder="e.g., 09:00 - 21:00"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #EBEBEB', fontSize: '0.9rem', outline: 'none' }}
              onFocus={(e) => e.target.style.borderColor = BRAND}
              onBlur={(e) => e.target.style.borderColor = '#EBEBEB'}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555', marginBottom: '6px', display: 'block' }}>
              <User size={14} style={{ display: 'inline', marginRight: '4px' }} /> Phone Number
            </label>
            <input
              type="tel"
              value={vendorData.phone}
              onChange={(e) => setVendorData({ ...vendorData, phone: e.target.value })}
              placeholder="e.g., 0825550192"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #EBEBEB', fontSize: '0.9rem', outline: 'none' }}
              onFocus={(e) => e.target.style.borderColor = BRAND}
              onBlur={(e) => e.target.style.borderColor = '#EBEBEB'}
            />
            <p style={{ fontSize: '0.65rem', color: '#aaa', marginTop: '4px' }}>Enter 10-digit phone number</p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555', marginBottom: '6px', display: 'block' }}>Email Address</label>
            <input
              type="email"
              value={vendorData.email}
              onChange={(e) => setVendorData({ ...vendorData, email: e.target.value })}
              placeholder="your@email.com"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #EBEBEB', fontSize: '0.9rem', outline: 'none' }}
              onFocus={(e) => e.target.style.borderColor = BRAND}
              onBlur={(e) => e.target.style.borderColor = '#EBEBEB'}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%',
              padding: '12px',
              background: saving ? '#ccc' : `linear-gradient(135deg, ${BRAND} 0%, #E8726A 100%)`,
              color: 'white',
              border: 'none',
              borderRadius: '2rem',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              opacity: saving ? 0.7 : 1
            }}
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Preview Section */}
        <div style={{ marginTop: '20px', backgroundColor: '#FFF8F0', borderRadius: '12px', padding: '16px', border: '1px solid #FFE0C8' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#C26A1A', marginBottom: '12px' }}>
            📱 How students see you:
          </h3>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '12px' }}>
            <strong style={{ fontSize: '1rem', color: '#1a1a2e' }}>{vendorData.name || 'Stall Name'}</strong>
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '6px' }}>
              {vendorData.description?.substring(0, 100) || 'No description yet'}
            </p>
            <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '8px' }}>
              <span>📍 {vendorData.location || 'Location not set'}</span>
              {vendorData.operating_hours && <span style={{ marginLeft: '12px' }}>🕐 {vendorData.operating_hours}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}