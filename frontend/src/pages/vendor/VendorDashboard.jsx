import { useState, useEffect } from 'react';
import { ShoppingCart, UserRound, UtensilsCrossed, BarChart2, Trash2 } from 'lucide-react';

const BRAND = '#C0474A';

const tabs = [
  { id: 'orders', label: 'Orders', icon: Trash2 },
  { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
];

const orderFilters = ['All orders', 'Confirmed', 'Preparing', 'Ready'];

const mockOrders = [
  { id: 45, customer: 'Samele Hlatswayo', status: 'Preparing', time: '12:30', items: [{ name: '2x Classic Kota', price: 50 }, { name: '1x Mini Chips', price: 25 }], note: 'Add tomato sauce to chips please', total: 75 },
  { id: 54, customer: 'Jakarman', status: 'Confirmed', time: '12:30', items: [{ name: '5x Kota', price: 125 }], note: null, total: 125 },
  { id: 87, customer: 'Siyangoba Kunene', status: 'Ready', time: '12:30', items: [{ name: '1x Russian', price: 10 }], note: 'add extra flavour :)', total: 10 },
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
    <article style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '1rem', border: '1px solid #F0EDE8' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1a2e' }}>ORDER NUMBER: {order.id}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ backgroundColor: config.bg, color: config.color, fontSize: '0.72rem', fontWeight: 600, padding: '3px 12px', borderRadius: '20px' }}>{order.status}</span>
          <span style={{ fontSize: '0.72rem', color: '#aaa' }}>{order.time}</span>
        </div>
      </div>
      <p style={{ fontSize: '0.78rem', color: '#888', marginBottom: '12px' }}>{order.customer}</p>
      <div style={{ borderTop: '1px solid #F5F5F5', paddingTop: '12px', marginBottom: '10px' }}>
        <p style={{ fontSize: '0.72rem', color: '#aaa', marginBottom: '6px' }}>Items:</p>
        {order.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.82rem', color: '#444' }}>{item.name}</span>
            <span style={{ fontSize: '0.82rem', color: '#444' }}>R {parseFloat(item.price).toFixed(2)}</span>
          </div>
        ))}
        {order.note && <p style={{ fontSize: '0.78rem', color: BRAND, marginTop: '8px', fontStyle: 'italic' }}>Customer Notes: {order.note}</p>}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #F5F5F5' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: BRAND }}>TOTAL</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: BRAND }}>R {order.total}.00</span>
        </div>
      </div>
      {config.action && (
        <button onClick={() => onUpdateStatus(order.id, config.next)}
          style={{ width: '100%', padding: '0.75rem', background: config.btnBg, color: config.btnColor, fontSize: '0.88rem', fontWeight: 700, border: 'none', borderRadius: '2rem', cursor: 'pointer' }}>
          {config.action}
        </button>
      )}
    </article>
  );
}

const ALLERGENS = ['Halal', 'Vegan', 'Vegetarian', 'Nut-free', 'Gluten-free', 'Dairy-free', 'Egg-free'];
const CATEGORIES_DEFAULT = ['Mains', 'Sides', 'Drinks', 'Starters', 'Extras'];

const tagColors = {
  Halal:         { bg: '#E0F7EF', color: '#2A9D6A' },
  Vegan:         { bg: '#E8F8E8', color: '#2A7D2A' },
  Vegetarian:    { bg: '#F0FFF0', color: '#3A8A3A' },
  'Nut-free':    { bg: '#FFF8E1', color: '#B8860B' },
  'Gluten-free': { bg: '#F3E8FF', color: '#7B4FBF' },
  'Dairy-free':  { bg: '#E8F4FD', color: '#2A6DB5' },
  'Egg-free':    { bg: '#FFF0F0', color: '#C0474A' },
};

const makeEmptyForm = (categories) => ({
  name: '', description: '', price: '', category: categories[0], tags: [], available: true, image_url: null,
});

function MenuManager() {
  const [items, setItems] = useState([]);
  const [vendorId, setVendorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(CATEGORIES_DEFAULT);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showCatInput, setShowCatInput] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [form, setForm] = useState(makeEmptyForm(CATEGORIES_DEFAULT));

 useEffect(() => {
   //new — handles both old and new localStorage structure
  const raw = JSON.parse(localStorage.getItem('orderup_user') || '{}');
  const user = raw?.user ?? raw;
  if (!user?.id) { setLoading(false); return; }

  const init = async () => {
    try {
      // Step 1 — register or retrieve the vendor record for this profile
      const regRes = await fetch('http://localhost:3000/api/vendors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: user.id }),
      });
      const vendor = await regRes.json();

      console.log('register response:', vendor);       // ← add this
      console.log('profile_id sent:', user.id);  
      // 409 means vendor already exists — both cases return { id, ... }
      if (!vendor?.id) throw new Error('Could not resolve vendor');
      setVendorId(vendor.id);

      // Step 2 — now fetch the menu using the real vendor UUID
      const menuRes = await fetch(`http://localhost:3000/api/vendors/${vendor.id}/menu`);
      if (!menuRes.ok) throw new Error(`Server error: ${menuRes.status}`);
      const data = await menuRes.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to initialise menu manager:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
    
  };

  init();
}, []);

  if (loading) return <p style={{ textAlign: 'center', color: '#aaa', padding: '3rem' }}>Loading menu...</p>;

  const filteredItems = activeCategory === 'All' ? items : items.filter(i => i.category === activeCategory);

  const toggleTag = (tag) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }));
  };

  // ── Convert uploaded file to base64 and store in form.image_url ──────────
  const handleImageFile = async (file) => {
  if (!file || !file.type.startsWith('image/')) return;

  try {
    // 1. Get signature from your backend
    const signRes = await fetch('http://localhost:3000/api/upload/sign');
    const { timestamp, signature, apiKey, cloudName } = await signRes.json();

    // 2. Upload directly to Cloudinary — no base64, no server hop
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
      setForm(p => ({ ...p, image_url: data.secure_url }));
    }
  } catch (err) {
    console.error('Image upload failed:', err);
    alert('Failed to upload image. Please try again.');
  }
};
  // ── Save — sends image_url as base64 string to backend ───────────────────
  const handleSave = async () => {
    if (!form.name || !form.price || !vendorId) return;
    const payload = { ...form, price: Number(form.price) };

    if (payload.image_url && payload.image_url.length > 1_400_000) {
      alert('Image is too large. Please use an image under 1MB.');
      return;
  }

    const method = editingItem ? 'PUT' : 'POST';
    const url = editingItem
      ? `http://localhost:3000/api/vendors/${vendorId}/menu/${editingItem}`
      : `http://localhost:3000/api/vendors/${vendorId}/menu`;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, price: Number(form.price) }),
    });
    const saved = await res.json();
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === editingItem ? saved : i));
    } else {
      setItems(prev => [...prev, saved]);
    }
    setForm(makeEmptyForm(categories));
    setEditingItem(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setForm({ ...item, price: String(item.price), tags: item.tags || [], image_url: item.image_url || null });
    setEditingItem(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:3000/api/vendors/${vendorId}/menu/${id}`, { method: 'DELETE' });
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const toggleAvailable = async (id) => {
  const item = items.find(i => i.id === id);
  if (!item) return;

  const updated = { ...item, available: !item.available };

  // 1. Optimistic update (instant UI change)
  setItems(prev =>
    prev.map(i => (i.id === id ? updated : i))
  );

  try {
    // 2. Save to backend
    await fetch(`http://localhost:3000/api/vendors/${vendorId}/menu/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...updated,
        price: Number(updated.price), // important if price is string
      }),
    });
  } catch (err) {
    console.error('Failed to update availability:', err);

    // 3. Rollback if it fails
    setItems(prev =>
      prev.map(i => (i.id === id ? item : i))
    );
  }
};
  const handleAddCategory = () => {
    if (newCat.trim() && !categories.includes(newCat.trim())) setCategories(prev => [...prev, newCat.trim()]);
    setNewCat(''); setShowCatInput(false);
  };

  return (
    <div>
      {/* ── Header row ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 2px' }}>Menu Items</h2>
          <p style={{ fontSize: '0.75rem', color: '#888', margin: 0 }}>Manage your menu items</p>
        </div>
        <button onClick={() => { setForm(makeEmptyForm(categories)); setEditingItem(null); setShowForm(true); }}
          style={{ background: 'linear-gradient(135deg, #C0474A 0%, #E8726A 100%)', color: 'white', border: 'none', borderRadius: '2rem', padding: '8px 18px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
          + Add Item
        </button>
      </div>

      {/* ── Category chips ── */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#555', margin: 0 }}>Menu categories</p>
          <button onClick={() => setShowCatInput(true)}
            style={{ background: 'none', border: `1.5px solid ${BRAND}`, color: BRAND, borderRadius: '2rem', padding: '4px 12px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>
            + Add Category
          </button>
        </div>
        {showCatInput && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Category name..."
              style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #EBEBEB', fontSize: '0.85rem', outline: 'none' }} />
            <button onClick={handleAddCategory}
              style={{ backgroundColor: BRAND, color: 'white', border: 'none', borderRadius: '10px', padding: '8px 16px', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}>
              Add
            </button>
          </div>
        )}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['All', ...categories].map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              style={{ padding: '5px 16px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', border: activeCategory === cat ? 'none' : '1.5px solid #E0E0E0', backgroundColor: activeCategory === cat ? BRAND : 'white', color: activeCategory === cat ? 'white' : '#666' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Add / Edit Form ── */}
      {showForm && (
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', marginBottom: '16px', border: `1.5px solid ${BRAND}` }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 14px' }}>
            {editingItem ? 'Edit Item' : 'New Menu Item'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

            {/* ── Image upload ── */}
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleImageFile(e.dataTransfer.files[0]); }}
              onClick={() => document.getElementById('food-img-input').click()}
              style={{ width: '100%', height: '160px', borderRadius: '12px', border: '2px dashed #E0E0E0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative', backgroundColor: form.image_url ? 'transparent' : '#FAFAFA' }}
            >
              {form.image_url ? (
                <>
                  <img src={form.image_url} alt="Food preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>Click to change photo</span>
                  </div>
                </>
              ) : (
                <>
                  <UtensilsCrossed size={28} color="#ddd" style={{ marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#888', margin: '0 0 4px' }}>Upload food photo</p>
                  <p style={{ fontSize: '0.75rem', color: '#bbb', margin: 0 }}>Click to browse or drag & drop</p>
                </>
              )}
              <input id="food-img-input" type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => handleImageFile(e.target.files[0])} />
            </div>

            <input placeholder="Item name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #EBEBEB', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }} />

            <textarea placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
              style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #EBEBEB', fontSize: '0.85rem', resize: 'none', outline: 'none', fontFamily: 'inherit' }} />

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem', color: '#888' }}>R</span>
                <input placeholder="Price *" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} type="number"
                  style={{ width: '100%', padding: '10px 14px 10px 28px', borderRadius: '10px', border: '1.5px solid #EBEBEB', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #EBEBEB', fontSize: '0.85rem', outline: 'none', backgroundColor: 'white' }}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#555', margin: '0 0 6px' }}>Dietary & Allergen Info</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {ALLERGENS.map(tag => {
                  const selected = form.tags.includes(tag);
                  return (
                    <button key={tag} onClick={() => toggleTag(tag)}
                      style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', border: 'none', backgroundColor: selected ? (tagColors[tag]?.bg || '#eee') : '#F5F5F5', color: selected ? (tagColors[tag]?.color || '#444') : '#999', outline: selected ? `1.5px solid ${tagColors[tag]?.color || '#ccc'}` : '1.5px solid transparent' }}>
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button onClick={handleSave}
                style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #C0474A 0%, #E8726A 100%)', color: 'white', border: 'none', borderRadius: '2rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}>
                {editingItem ? 'Save Changes' : 'Add Item'}
              </button>
              <button onClick={() => { setShowForm(false); setEditingItem(null); setForm(makeEmptyForm(categories)); }}
                style={{ flex: 1, padding: '10px', background: 'white', color: '#888', border: '1.5px solid #E0E0E0', borderRadius: '2rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Menu Item Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {filteredItems.map(item => (
          <article key={item.id}
            style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: item.available ? '1.5px solid transparent' : '1.5px solid #E0E0E0', opacity: item.available ? 1 : 0.6 }}>

            {/* ── Food photo banner ── */}
            <div style={{ height: '100px', overflow: 'hidden', backgroundColor: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {item.image_url
                ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <UtensilsCrossed size={28} color="#ddd" />
              }
            </div>

            <div style={{ padding: '10px 12px' }}>
              <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 2px' }}>{item.name}</h3>
              <p style={{ fontSize: '0.72rem', color: '#888', margin: '0 0 6px', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</p>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
                {(item.tags || []).map(tag => (
                  <span key={tag} style={{ backgroundColor: tagColors[tag]?.bg || '#F0F0F0', color: tagColors[tag]?.color || '#666', fontSize: '0.62rem', fontWeight: 600, padding: '2px 8px', borderRadius: '20px' }}>{tag}</span>
                ))}
              </div>
              <p style={{ fontSize: '0.88rem', fontWeight: 700, color: BRAND, margin: '0 0 10px' }}>R {parseFloat(item.price).toFixed(2)}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <div onClick={() => toggleAvailable(item.id)}
                    style={{ width: '36px', height: '20px', borderRadius: '10px', position: 'relative', cursor: 'pointer', backgroundColor: item.available ? BRAND : '#E0E0E0', transition: 'background 0.2s' }}>
                    <div style={{ position: 'absolute', top: '2px', left: item.available ? '18px' : '2px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#888' }}>{item.available ? 'Available' : 'Sold out'}</span>
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleEdit(item)}
                    style={{ backgroundColor: '#FFF0F0', color: BRAND, border: 'none', borderRadius: '8px', padding: '4px 10px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)}
                    style={{ backgroundColor: '#F5F5F5', color: '#aaa', border: 'none', borderRadius: '8px', padding: '4px 8px', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 size={13} color="#aaa" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa', fontSize: '0.9rem' }}>
          <UtensilsCrossed size={40} color="#ddd" style={{ marginBottom: '12px' }} />
          <p>No items in this category yet.</p>
        </div>
      )}
    </div>
  );
}

import {
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const [activeFilter, setActiveFilter] = useState('All orders');
  const [orders, setOrders] = useState(mockOrders);

  const handleUpdateStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const filteredOrders = activeFilter === 'All orders'
    ? orders.filter(o => o.status !== 'Collected')
    : orders.filter(o => o.status === activeFilter);

  const totalOrders = orders.length;

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  const completedOrders = orders.filter(o => o.status === 'Collected').length;

  const avgOrderValue = totalOrders ? (totalRevenue / totalOrders).toFixed(2) : 0;

  const totalCustomers = new Set(
  orders.map(order => order.customer)
).size;

  const itemSalesMap = {};

orders.forEach(order => {
  order.items.forEach(item => {
    const name = item.name;

    if (!itemSalesMap[name]) {
      itemSalesMap[name] = {
        name,
        quantity: 0,
        revenue: 0,
      };
    }

    itemSalesMap[name].quantity += 1;
    itemSalesMap[name].revenue += item.price;
  });
});

const topSellingItems = Object.values(itemSalesMap)
  .sort((a, b) => b.quantity - a.quantity);

  const cardStyle = {
  background: 'white',
  padding: '16px',
  borderRadius: '14px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
};

const labelStyle = {
  fontSize: '0.75rem',
  color: '#888',
  margin: 0,
};

const valueStyle = {
  fontSize: '1.2rem',
  fontWeight: 700,
  margin: '6px 0 0',
  color: '#C0474A',
};

const trends = {
  orders: '+12%',
  revenue: '+8%',
  customers: '+5%',
  avg: '+3%',
};
const cardHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '6px',
};

const trendStyle = {
  fontSize: '0.7rem',
  fontWeight: 700,
  color: '#2A7D2A',
};

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F5F2' }}>

      {/* ── Header ── */}
      <header style={{ backgroundColor: BRAND, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', backgroundColor: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingCart size={18} color={BRAND} strokeWidth={2.5} />
          </div>
          <span style={{ color: 'white', fontSize: '1.2rem', fontWeight: 800 }}>OrderUp</span>
        </div>
        <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <UserRound size={16} color="white" strokeWidth={2} />
        </div>
      </header>

      {/* ── Hero Banner ── */}
      <section style={{ margin: '16px', background: 'linear-gradient(135deg, #C0474A 0%, #E8726A 100%)', borderRadius: '18px', padding: '20px 24px' }}>
        <h1 style={{ color: 'white', fontSize: '1.3rem', fontWeight: 800, marginBottom: '4px' }}>{name} Dashboard</h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem' }}>
          {orders.filter(o => o.status !== 'Collected').length} active orders today
        </p>
      </section>

      {/* ── Tabs ── */}
      <nav style={{ display: 'flex', margin: '0 16px 16px', backgroundColor: 'white', borderRadius: '14px', padding: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', gap: '4px' }}>
        {tabs.map(tab => {
          const TabIcon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, backgroundColor: activeTab === tab.id ? BRAND : 'transparent', color: activeTab === tab.id ? 'white' : '#888', transition: 'all 0.2s ease' }}>
              <TabIcon size={15} strokeWidth={2} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* ── Orders Tab ── */}
      {activeTab === 'orders' && (
        <section style={{ padding: '0 16px 32px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }}>
            {orderFilters.map(filter => (
              <button key={filter} onClick={() => setActiveFilter(filter)}
                style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', border: activeFilter === filter ? 'none' : '1.5px solid #E0E0E0', backgroundColor: activeFilter === filter ? BRAND : 'white', color: activeFilter === filter ? 'white' : '#666', transition: 'all 0.15s ease' }}>
                {filter}
              </button>
            ))}
          </div>
          {filteredOrders.length === 0
            ? <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa', fontSize: '0.9rem' }}>No orders in this category</div>
            : filteredOrders.map(order => <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateStatus} />)
          }
        </section>
      )}

      {/* ── Menu Tab ── */}
      {activeTab === 'menu' && (
        <section style={{ padding: '0 16px 32px' }}>
          <MenuManager />
        </section>
)}
{activeTab === 'analytics' && (
  <section style={{ padding: '16px' }}>

    {/* ───── Overview Cards ───── */}
    {/* ───── Overview ───── */}
<h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>
  Overview
</h2>

<div
  style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '20px',
  }}
>

  {/* Total Orders */}
  <div style={cardStyle}>
    <div style={cardHeader}>
      <ShoppingBag size={18} color="#C0474A" />
      <span style={trendStyle}>{trends.orders}</span>
    </div>
    <p style={labelStyle}>Total Orders</p>
    <h3 style={valueStyle}>{totalOrders}</h3>
  </div>

  {/* Revenue */}
  <div style={cardStyle}>
    <div style={cardHeader}>
      <DollarSign size={18} color="#2A7D2A" />
      <span style={{ ...trendStyle, color: '#2A7D2A' }}>
        {trends.revenue}
      </span>
    </div>
    <p style={labelStyle}>Revenue</p>
    <h3 style={valueStyle}>R {totalRevenue}</h3>
  </div>

  {/* Customers */}
  <div style={cardStyle}>
    <div style={cardHeader}>
      <Users size={18} color="#2A6DB5" />
      <span style={{ ...trendStyle, color: '#2A6DB5' }}>
        {trends.customers}
      </span>
    </div>
    <p style={labelStyle}>Customers</p>
    <h3 style={valueStyle}>{totalCustomers}</h3>
  </div>

  {/* Completed Orders */}
  <div style={cardStyle}>
    <div style={cardHeader}>
      <CheckCircle2 size={18} color="#7B4FBF" />
      <span style={{ ...trendStyle, color: '#7B4FBF' }}>
        {trends.avg}
      </span>
    </div>
    <p style={labelStyle}>Completed</p>
    <h3 style={valueStyle}>{completedOrders}</h3>
  </div>

  {/* Avg Order Value */}
  <div style={cardStyle}>
    <div style={cardHeader}>
      <TrendingUp size={18} color="#C26A1A" />
      <span style={{ ...trendStyle, color: '#C26A1A' }}>
        +2%
      </span>
    </div>
    <p style={labelStyle}>Avg Order</p>
    <h3 style={valueStyle}>R {avgOrderValue}</h3>
  </div>

</div>

    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
      marginBottom: '20px'
    }}>

      <div style={cardStyle}>
        <p style={labelStyle}>Total Orders</p>
        <h3 style={valueStyle}>{totalOrders}</h3>
      </div>

      <div style={cardStyle}>
        <p style={labelStyle}>Total Revenue</p>
        <h3 style={valueStyle}>R {totalRevenue}</h3>
      </div>

      <div style={cardStyle}>
        <p style={labelStyle}>Completed Orders</p>
        <h3 style={valueStyle}>{completedOrders}</h3>
      </div>

      <div style={cardStyle}>
        <p style={labelStyle}>Avg Order Value</p>
        <h3 style={valueStyle}>R {avgOrderValue}</h3>
      </div>

      <div style={cardStyle}>
       <p style={labelStyle}>Total Customers</p>
       <h3 style={valueStyle}>{totalCustomers}</h3>
      </div>

    </div>

    {/* ───── Top Selling Items ───── */}
    <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>
      Top Selling Items
    </h2>

    <div style={{
      background: 'white',
      borderRadius: '14px',
      padding: '12px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    }}>

      {topSellingItems.length === 0 ? (
        <p style={{ color: '#aaa' }}>No sales data yet</p>
      ) : (
        topSellingItems.map((item) => (
          <div
            key={item.name}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 600 }}>
                {item.name}
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>
                Sold {item.quantity} times
              </p>
            </div>

            <div style={{ fontWeight: 700, color: '#C0474A' }}>
              R {item.revenue}
            </div>
          </div>
        ))
      )}

    </div>

  </section>
)}

      


    </div>
  );
}
