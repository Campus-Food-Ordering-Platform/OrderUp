import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, User, MapPin, Clock, FileText, Save, ArrowLeft, CheckCircle, AlertCircle, Camera } from 'lucide-react';

const BRAND = '#C0474A';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Generate time options in 30-min intervals
const TIME_OPTIONS = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    TIME_OPTIONS.push(`${hh}:${mm}`);
  }
}

const DEFAULT_HOURS = {
  Mon: { open: true, from: '08:00', to: '17:00' },
  Tue: { open: true, from: '08:00', to: '17:00' },
  Wed: { open: true, from: '08:00', to: '17:00' },
  Thu: { open: true, from: '08:00', to: '17:00' },
  Fri: { open: true, from: '08:00', to: '17:00' },
  Sat: { open: false, from: '09:00', to: '14:00' },
  Sun: { open: false, from: '09:00', to: '14:00' },
};

// Parse stored string like "Mon-Fri 08:00-17:00, Sat 09:00-14:00" back into structured form
// If parsing fails, just return defaults
function parseHoursString(str) {
  if (!str || typeof str !== 'string') return DEFAULT_HOURS;
  try {
    // Try to parse structured JSON if we stored it that way
    const parsed = JSON.parse(str);
    if (parsed && typeof parsed === 'object' && parsed.Mon) return parsed;
  } catch (_) {}
  return DEFAULT_HOURS;
}

// Serialize structured hours to a readable string for the API
function serializeHours(hoursObj) {
  const openDays = DAYS.filter(d => hoursObj[d]?.open);
  if (!openDays.length) return 'Closed';
  // Group consecutive days with same hours
  const groups = [];
  let i = 0;
  while (i < openDays.length) {
    const cur = hoursObj[openDays[i]];
    let j = i + 1;
    while (
      j < openDays.length &&
      hoursObj[openDays[j]].from === cur.from &&
      hoursObj[openDays[j]].to === cur.to &&
      DAYS.indexOf(openDays[j]) === DAYS.indexOf(openDays[j - 1]) + 1
    ) j++;
    const label = j - i > 1 ? `${openDays[i]}-${openDays[j - 1]}` : openDays[i];
    groups.push(`${label} ${cur.from}–${cur.to}`);
    i = j;
  }
  return groups.join(', ');
}

export default function VendorSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false); //  adding state for upload logo
  const [hoursMode, setHoursMode] = useState('structured'); // 'structured' | 'text'

  const [vendorData, setVendorData] = useState({
    name: '',
    description: '',
    category: '',
    location: '',
    operating_hours: '',
    phone: '',
    email: '',
    image_url: null, //banner
    logo_url: null, //logo
  });

  const [structuredHours, setStructuredHours] = useState(DEFAULT_HOURS);

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
        body: JSON.stringify({ profile_id: userId }),
      });
      const statusData = await statusRes.json();

      if (statusData.id) {
        const vendorRes = await fetch(`${import.meta.env.VITE_API_URL}/api/vendors/${statusData.id}`);
        const vendorInfo = await vendorRes.json();

        const hoursRaw = vendorInfo.operating_hours?.hours || '';
        const parsed = parseHoursString(hoursRaw);

        setStructuredHours(parsed);
       setVendorData({
          name: vendorInfo.vendor_name || '',
          description: vendorInfo.description || '',
          category: Array.isArray(vendorInfo.category) 
            ? vendorInfo.category[0] || '' 
            : typeof vendorInfo.category === 'string'
              ? vendorInfo.category.replace(/[{}"]/g, '').split(',')[0] || ''
              : '',          location: vendorInfo.location || '',
          operating_hours: hoursRaw,
          phone: vendorInfo.phone || '',
          email: vendorInfo.email || '',
          image_url: vendorInfo.banner_url || null,
          logo_url: vendorInfo.logo_url || null,
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

  // ── Image upload (same Cloudinary pattern as MenuManager) ──────────────────
  const handleImageFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setUploadingImage(true);
    try {
      const signRes = await fetch(`${import.meta.env.VITE_API_URL}/api/upload/sign`);
      const { timestamp, signature, apiKey, cloudName } = await signRes.json();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('api_key', apiKey);
      formData.append('folder', 'orderup/menu-items');
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await uploadRes.json();
      if (data.secure_url) {
        setVendorData(prev => ({ ...prev, image_url: data.secure_url }));
      } else {
        throw new Error('No URL returned');
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      setErrorMessage('Image upload failed. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setUploadingImage(false);
    }
  };

  // logo handler
  const handleLogoFile = async (file) => {
  if (!file || !file.type.startsWith('image/')) return;
  setUploadingLogo(true);
  try {
    const signRes = await fetch(`${import.meta.env.VITE_API_URL}/api/upload/sign`);
    const { timestamp, signature, apiKey, cloudName } = await signRes.json();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('api_key', apiKey);
    formData.append('folder', 'folder');//folder line
    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: formData }
    );
    const data = await uploadRes.json();
    if (data.secure_url) {
      setVendorData(prev => ({ ...prev, logo_url: data.secure_url }));
    } else {
      throw new Error('No URL returned');
    }
  } catch (err) {
    console.error('Logo upload failed:', err);
    setErrorMessage('Logo upload failed. Please try again.');
    setShowError(true);
    setTimeout(() => setShowError(false), 3000);
  } finally {
    setUploadingLogo(false);
  }
};

  // ── Structured hours helpers ───────────────────────────────────────────────
  const toggleDay = (day) => {
    setStructuredHours(prev => ({
      ...prev,
      [day]: { ...prev[day], open: !prev[day].open },
    }));
  };

  const updateDayHours = (day, field, value) => {
    setStructuredHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  // ── Validation ─────────────────────────────────────────────────────────────
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
    // Validate structured hours: if a day is open, to must be after from
    for (const day of DAYS) {
      const d = structuredHours[day];
      if (d.open && d.from >= d.to) {
        setErrorMessage(`${day}: closing time must be after opening time`);
        setShowError(true);
        return false;
      }
    }
    return true;
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setShowError(false);

    // Build the hours string from structured picker
    const hoursString = serializeHours(structuredHours);
    // Also store the structured object as JSON so we can re-parse it next time
    const hoursPayload = {
      hours: hoursString,
      structured: JSON.stringify(structuredHours),
    };

      // ADD THIS
  console.log('Saving payload:', JSON.stringify({
    vendor_name:     vendorData.name,
    description:     vendorData.description,
    category: vendorData.category ? [vendorData.category.trim()] : [],
    location:        vendorData.location,
    operating_hours: hoursPayload,
    logo_url:        vendorData.logo_url,
  }));

    try {
      const raw = JSON.parse(localStorage.getItem('orderup_user') || '{}');
      const userId = raw?.id || raw?.user?.id;

      const statusRes = await fetch(`${import.meta.env.VITE_API_URL}/api/vendors/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: userId }),
      });
      const statusData = await statusRes.json();

      if (statusData.id) {
        const updateRes = await fetch(`${import.meta.env.VITE_API_URL}/api/vendors/${statusData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vendor_name: vendorData.name,
            description: vendorData.description,
            category: vendorData.category ? [vendorData.category] : [],
            location: vendorData.location,
            operating_hours: {
              hours: serializeHours(structuredHours),
              structured: JSON.stringify(structuredHours),
            },
            banner_url: vendorData.image_url,
            logo_url: vendorData.logo_url, 
            // phone: vendorData.phone,
            // email: vendorData.email,
            // image_url: vendorData.image_url,
          }),
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

  // ── Input style helpers ────────────────────────────────────────────────────
  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1.5px solid #EBEBEB',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };

  const focusProps = {
    onFocus: (e) => (e.target.style.borderColor = BRAND),
    onBlur: (e) => (e.target.style.borderColor = '#EBEBEB'),
  };

  const selectStyle = {
    padding: '8px 10px',
    borderRadius: '8px',
    border: '1.5px solid #EBEBEB',
    fontSize: '0.8rem',
    outline: 'none',
    backgroundColor: 'white',
    cursor: 'pointer',
  };

  // ── Loading screen ─────────────────────────────────────────────────────────
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

  const hoursPreview = serializeHours(structuredHours);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F5F2' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .day-row:hover { background: #fafafa; }
      `}</style>

      {/* Success Toast */}
      {showSuccess && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', backgroundColor: '#2A7D2A', color: 'white', padding: '12px 20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, animation: 'slideIn 0.3s ease' }}>
          <CheckCircle size={18} />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {/* Error Toast */}
      {showError && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', backgroundColor: BRAND, color: 'white', padding: '12px 20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, animation: 'slideIn 0.3s ease' }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Header */}
      <header style={{ backgroundColor: BRAND, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button onClick={() => navigate('/vendor-dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ width: '36px', height: '36px', backgroundColor: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Store size={18} color={BRAND} strokeWidth={2.5} />
        </div>
        <span style={{ color: 'white', fontSize: '1.2rem', fontWeight: 800 }}>Vendor Settings</span>
      </header>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '20px' }}>Edit Vendor Information</h2>

          {/* ── STALL IMAGE UPLOAD ── */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555', marginBottom: '8px', display: 'block' }}>
              <Camera size={14} style={{ display: 'inline', marginRight: '4px' }} /> Stall Photo
            </label>
            <div
              onClick={() => !uploadingImage && document.getElementById('vendor-img-input').click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleImageFile(e.dataTransfer.files[0]); }}
              style={{
                width: '100%',
                height: '160px',
                borderRadius: '12px',
                border: vendorData.image_url ? 'none' : '2px dashed #E0E0E0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: uploadingImage ? 'wait' : 'pointer',
                overflow: 'hidden',
                position: 'relative',
                backgroundColor: vendorData.image_url ? 'transparent' : '#FAFAFA',
                transition: 'border-color 0.2s',
              }}
            >
              {uploadingImage ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '32px', height: '32px', border: `3px solid ${BRAND}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '0.8rem', color: '#888', margin: 0 }}>Uploading...</p>
                </div>
              ) : vendorData.image_url ? (
                <>
                  <img src={vendorData.image_url} alt="Stall" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                  >
                    <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>Click to change photo</span>
                  </div>
                </>
              ) : (
                <>
                  <Camera size={28} color="#ddd" style={{ marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#888', margin: '0 0 4px' }}>Upload stall photo</p>
                  <p style={{ fontSize: '0.75rem', color: '#bbb', margin: 0 }}>Click to browse or drag & drop</p>
                </>
              )}
              <input id="vendor-img-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageFile(e.target.files[0])} />
            </div>
            {vendorData.image_url && (
              <button
                onClick={() => setVendorData(prev => ({ ...prev, image_url: null }))}
                style={{ marginTop: '6px', fontSize: '0.72rem', color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Remove photo
              </button>
            )}
          </div>

          {/* ── LOGO UPLOAD ── */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555', marginBottom: '8px', display: 'block' }}>
              <Camera size={14} style={{ display: 'inline', marginRight: '4px' }} /> Stall Logo <span style={{ fontSize: '0.65rem', color: '#aaa', fontWeight: 400 }}>(circular icon shown on card)</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Circle preview */}
              <div
                onClick={() => !uploadingLogo && document.getElementById('vendor-logo-input').click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleLogoFile(e.dataTransfer.files[0]); }}
                style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  border: vendorData.logo_url ? 'none' : '2px dashed #E0E0E0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: uploadingLogo ? 'wait' : 'pointer',
                  overflow: 'hidden', flexShrink: 0,
                  backgroundColor: vendorData.logo_url ? 'transparent' : '#FAFAFA',
                  boxShadow: vendorData.logo_url ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                {uploadingLogo ? (
                  <div style={{ width: '24px', height: '24px', border: `3px solid ${BRAND}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                ) : vendorData.logo_url ? (
                  <img src={vendorData.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Camera size={20} color="#ddd" />
                )}
                <input id="vendor-logo-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleLogoFile(e.target.files[0])} />
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', color: '#555', margin: '0 0 4px', fontWeight: 600 }}>
                  {vendorData.logo_url ? 'Click circle to change' : 'Click circle to upload'}
                </p>
                <p style={{ fontSize: '0.72rem', color: '#aaa', margin: 0 }}>Square images work best. Will be shown as a circle.</p>
                {vendorData.logo_url && (
                  <button onClick={() => setVendorData(prev => ({ ...prev, logo_url: null }))}
                    style={{ marginTop: '6px', fontSize: '0.72rem', color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    Remove logo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stall Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555', marginBottom: '6px', display: 'block' }}>
              <Store size={14} style={{ display: 'inline', marginRight: '4px' }} /> Stall Name <span style={{ color: BRAND }}>*</span>
            </label>
            <input type="text" value={vendorData.name} onChange={(e) => setVendorData({ ...vendorData, name: e.target.value })} placeholder="Enter your stall name" style={inputStyle} {...focusProps} />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555', marginBottom: '6px', display: 'block' }}>
              <FileText size={14} style={{ display: 'inline', marginRight: '4px' }} /> Description
            </label>
            <textarea value={vendorData.description} onChange={(e) => setVendorData({ ...vendorData, description: e.target.value })} rows={4} placeholder="Describe your stall, cuisine type, and what makes your food special..." style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} {...focusProps} />
          </div>

          {/* Category */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555', marginBottom: '6px', display: 'block' }}>Category</label>
            <select value={vendorData.category} onChange={(e) => setVendorData({ ...vendorData, category: e.target.value })} style={{ ...inputStyle, backgroundColor: 'white' }} {...focusProps}>
              <option value="">Select Category</option>
              <option value="Fast Food">Fast Food</option>
              <option value="Cafe">Cafe</option>
              <option value="Asian">Asian</option>
              <option value="Pizza">Pizza</option>
              <option value="Healthy">Healthy</option>
              <option value="Indian">Indian</option>
            </select>
          </div>

          {/* Location */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555', marginBottom: '6px', display: 'block' }}>
              <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} /> Location <span style={{ color: BRAND }}>*</span>
            </label>
            <input type="text" value={vendorData.location} onChange={(e) => setVendorData({ ...vendorData, location: e.target.value })} placeholder="e.g., Matrix Food Court, Stall 4" style={inputStyle} {...focusProps} />
          </div>

          {/* ── OPERATING HOURS ── */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555', display: 'block' }}>
                <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} /> Operating Hours
              </label>
            </div>

            {/* Day-by-day picker */}
            <div style={{ border: '1.5px solid #EBEBEB', borderRadius: '12px', overflow: 'hidden' }}>
              {DAYS.map((day, idx) => {
                const d = structuredHours[day];
                return (
                  <div
                    key={day}
                    className="day-row"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      borderBottom: idx < DAYS.length - 1 ? '1px solid #F0F0F0' : 'none',
                      backgroundColor: 'white',
                      transition: 'background 0.15s',
                    }}
                  >
                    {/* Toggle */}
                    <div
                      onClick={() => toggleDay(day)}
                      style={{
                        width: '34px',
                        height: '19px',
                        borderRadius: '10px',
                        position: 'relative',
                        cursor: 'pointer',
                        flexShrink: 0,
                        backgroundColor: d.open ? BRAND : '#E0E0E0',
                        transition: 'background 0.2s',
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: '2px',
                        left: d.open ? '17px' : '2px',
                        width: '15px',
                        height: '15px',
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }} />
                    </div>

                    {/* Day label */}
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: d.open ? '#1a1a2e' : '#bbb', width: '32px', flexShrink: 0 }}>{day}</span>

                    {d.open ? (
                      <>
                        <select
                          value={d.from}
                          onChange={(e) => updateDayHours(day, 'from', e.target.value)}
                          style={selectStyle}
                          onFocus={(e) => (e.target.style.borderColor = BRAND)}
                          onBlur={(e) => (e.target.style.borderColor = '#EBEBEB')}
                        >
                          {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <span style={{ fontSize: '0.75rem', color: '#aaa', flexShrink: 0 }}>to</span>
                        <select
                          value={d.to}
                          onChange={(e) => updateDayHours(day, 'to', e.target.value)}
                          style={{
                            ...selectStyle,
                            borderColor: d.from >= d.to ? BRAND : '#EBEBEB',
                            color: d.from >= d.to ? BRAND : 'inherit',
                          }}
                          onFocus={(e) => (e.target.style.borderColor = BRAND)}
                          onBlur={(e) => (e.target.style.borderColor = d.from >= d.to ? BRAND : '#EBEBEB')}
                        >
                          {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        {d.from >= d.to && (
                          <span style={{ fontSize: '0.65rem', color: BRAND, flexShrink: 0 }}>⚠ invalid</span>
                        )}
                      </>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#bbb', fontStyle: 'italic' }}>Closed</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Preview */}
            {hoursPreview && hoursPreview !== 'Closed' && (
              <p style={{ fontSize: '0.7rem', color: '#888', marginTop: '8px' }}>
                Preview: <span style={{ color: '#444', fontWeight: 600 }}>{hoursPreview}</span>
              </p>
            )}
          </div>

          {/* Phone */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555', marginBottom: '6px', display: 'block' }}>
              <User size={14} style={{ display: 'inline', marginRight: '4px' }} /> Phone Number
            </label>
            <input type="tel" value={vendorData.phone} onChange={(e) => setVendorData({ ...vendorData, phone: e.target.value })} placeholder="e.g., 0825550192" style={inputStyle} {...focusProps} />
            <p style={{ fontSize: '0.65rem', color: '#aaa', marginTop: '4px' }}>Enter 10-digit phone number</p>
          </div>

          {/* Email */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555', marginBottom: '6px', display: 'block' }}>Email Address</label>
            <input type="email" value={vendorData.email} onChange={(e) => setVendorData({ ...vendorData, email: e.target.value })} placeholder="your@email.com" style={inputStyle} {...focusProps} />
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || uploadingImage}
            style={{
              width: '100%',
              padding: '12px',
              background: (saving || uploadingImage) ? '#ccc' : `linear-gradient(135deg, ${BRAND} 0%, #E8726A 100%)`,
              color: 'white',
              border: 'none',
              borderRadius: '2rem',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: (saving || uploadingImage) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              opacity: (saving || uploadingImage) ? 0.7 : 1,
            }}
          >
            <Save size={18} />
            {saving ? 'Saving...' : uploadingImage ? 'Uploading image...' : 'Save Changes'}
          </button>
        </div>

        {/* Preview */}
        <div style={{ marginTop: '20px', backgroundColor: '#FFF8F0', borderRadius: '12px', padding: '16px', border: '1px solid #FFE0C8' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#C26A1A', marginBottom: '12px' }}>
            📱 How students see you:
          </h3>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
            {vendorData.image_url && (
              <img src={vendorData.image_url} alt="Stall preview" style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }} />
            )}
            <div style={{ padding: '12px' }}>
              <strong style={{ fontSize: '1rem', color: '#1a1a2e' }}>{vendorData.name || 'Stall Name'}</strong>
              <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '6px' }}>
                {vendorData.description?.substring(0, 100) || 'No description yet'}
              </p>
              <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '8px' }}>
                <span>📍 {vendorData.location || 'Location not set'}</span>
                {hoursPreview && hoursPreview !== 'Closed' && (
                  <span style={{ marginLeft: '12px' }}>🕐 {hoursPreview}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}