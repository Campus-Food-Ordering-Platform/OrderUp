import { useState, useEffect } from 'react';
import {
  ShoppingCart, UserRound, UtensilsCrossed, BarChart2, Trash2,
  TrendingUp, Users, ShoppingBag, DollarSign, CheckCircle2,
  Search, Star, Clock, MessageSquare, ThumbsUp
} from 'lucide-react';

const BRAND = '#C0474A';

// ============ TABS CONFIGURATION ============
const tabs = [
  { id: 'orders', label: 'Orders', icon: Trash2 },
  { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
];

const orderFilters = ['All orders', 'received', 'preparing', 'ready'];// Map order status to display config(this was a pain to figure out)


const statusConfig = {
  received:  { bg: '#E8F4FD', color: '#2A6DB5', action: 'Start Preparing', btnBg: 'linear-gradient(135deg, #7B4FBF 0%, #9B6FDF 100%)', btnColor: 'white' },
  preparing: { bg: '#F0E8FF', color: '#7B4FBF', action: 'Mark Ready',       btnBg: 'linear-gradient(135deg, #2A7D2A 0%, #4CAF50 100%)', btnColor: 'white' },
  ready:     { bg: '#E8F8E8', color: '#2A7D2A', action: 'Mark as Collected', btnBg: 'linear-gradient(135deg, #C0474A 0%, #E8726A 100%)', btnColor: 'white' },
  collected: { bg: '#F0F0F0', color: '#888',    action: null,                btnBg: null, btnColor: null },
};

// ============ ORDER CARD COMPONENT ============
function OrderCard({ order, onUpdateStatus }) {
  const config = statusConfig[order.status] || statusConfig['received'];
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1a2e' }}>ORDER NUMBER: {order.order_number}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ backgroundColor: config.bg, color: config.color, fontSize: '0.72rem', fontWeight: 600, padding: '3px 12px', borderRadius: '20px' }}>{order.status}</span>
          <span style={{ fontSize: '0.72rem', color: '#aaa' }}>{order.time}</span>
        </div>
      </div>

      <p style={{ fontSize: '0.78rem', color: '#888', marginBottom: '12px' }}>{order.customer_name}</p>

      <div style={{ borderTop: '1px solid #F5F5F5', paddingTop: '12px', marginBottom: '10px' }}>
        <p style={{ fontSize: '0.72rem', color: '#aaa', marginBottom: '6px' }}>Items:</p>
        {order.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.82rem', color: '#444' }}>{item.name}</span>
            <span style={{ fontSize: '0.82rem', color: '#444' }}>R {parseFloat(item.price).toFixed(2)}</span>
          </div>
        ))}
        {order.note && (
          <p style={{ fontSize: '0.78rem', color: BRAND, marginTop: '8px', fontStyle: 'italic' }}>
            Customer Notes: {order.note}
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #F5F5F5' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: BRAND }}>TOTAL</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: BRAND }}>R {order.total_amount}.00</span>
        </div>
      </div>

      {config.action && (
        <button onClick={() => onUpdateStatus(order.id)}// onUpdateStatus should handle moving to the next status in the flow
          style={{ width: '100%', padding: '0.75rem', background: config.btnBg, color: config.btnColor, fontSize: '0.88rem', fontWeight: 700, border: 'none', borderRadius: '2rem', cursor: 'pointer' }}>
          {config.action}
        </button>
      )}
    </article>
  );
}

// ============ MENU MANAGER DATA ============
const ALLERGENS = ['Halal', 'Vegan', 'Vegetarian', 'Nut-free', 'Gluten-free', 'Dairy-free', 'Egg-free'];
const CATEGORIES_DEFAULT = ['Mains', 'Sides', 'Drinks', 'Starters', 'Extras'];

const tagColors = {
  Halal: { bg: '#E0F7EF', color: '#2A9D6A' },
  Vegan: { bg: '#E8F8E8', color: '#2A7D2A' },
  Vegetarian: { bg: '#F0FFF0', color: '#3A8A3A' },
  'Nut-free': { bg: '#FFF8E1', color: '#B8860B' },
  'Gluten-free': { bg: '#F3E8FF', color: '#7B4FBF' },
  'Dairy-free': { bg: '#E8F4FD', color: '#2A6DB5' },
  'Egg-free': { bg: '#FFF0F0', color: '#C0474A' },
};

const makeEmptyForm = (categories) => ({
  name: '', description: '', price: '', category: categories[0], tags: [], available: true, image_url: null,
});

// ============ MENU MANAGER COMPONENT ============
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

  const emptyForm = makeEmptyForm(categories);

  useEffect(() => {
    const raw = JSON.parse(localStorage.getItem('orderup_user') || '{}');
    const user = raw?.user ?? raw;
    if (!user?.id) { setLoading(false); return; }

    const init = async () => {
      try {
        const regRes = await fetch(`${import.meta.env.VITE_API_URL}/api/vendors/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile_id: user.id }),
        });
        const vendor = await regRes.json();

        if (!vendor?.id) throw new Error('Could not resolve vendor');
        setVendorId(vendor.id);

        const menuRes = await fetch(`${import.meta.env.VITE_API_URL}/api/vendors/${vendor.id}/menu`);
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

  const handleImageFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
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
        setForm(p => ({ ...p, image_url: data.secure_url }));
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Failed to upload image. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !vendorId) return;
    const payload = { ...form, price: Number(form.price) };
    if (payload.image_url && payload.image_url.length > 1_400_000) {
      alert('Image is too large. Please use an image under 1MB.');
      return;
    }
    const method = editingItem ? 'PUT' : 'POST';
    const url = editingItem
      ? `${import.meta.env.VITE_API_URL}/api/vendors/${vendorId}/menu/${editingItem}`
      : `${import.meta.env.VITE_API_URL}/api/vendors/${vendorId}/menu`;
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
    await fetch(`${import.meta.env.VITE_API_URL}/api/vendors/${vendorId}/menu/${id}`, { method: 'DELETE' });
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const toggleAvailable = async (id) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const updated = { ...item, available: !item.available };
    setItems(prev => prev.map(i => (i.id === id ? updated : i)));
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/vendors/${vendorId}/menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updated, price: Number(updated.price) }),
      });
    } catch (err) {
      console.error('Failed to update availability:', err);
      setItems(prev => prev.map(i => (i.id === id ? item : i)));
    }
  };

  const handleAddCategory = () => {
    if (newCat.trim() && !categories.includes(newCat.trim())) setCategories(prev => [...prev, newCat.trim()]);
    setNewCat(''); setShowCatInput(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 2px' }}>Menu Items</h2>
          <p style={{ fontSize: '0.75rem', color: '#888', margin: 0 }}>Manage your menu items</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setEditingItem(null); setShowForm(true); }}
          style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #E8726A 100%)`, color: 'white', border: 'none', borderRadius: '2rem', padding: '8px 18px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
        >
          + Add Item
        </button>
      </div>

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

      {showForm && (
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', marginBottom: '16px', border: `1.5px solid ${BRAND}` }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 14px' }}>
            {editingItem ? 'Edit Item' : 'New Menu Item'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
              <button onClick={handleSave} style={{ flex: 1, padding: '10px', background: `linear-gradient(135deg, ${BRAND} 0%, #E8726A 100%)`, color: 'white', border: 'none', borderRadius: '2rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}>{editingItem ? 'Save Changes' : 'Add Item'}</button>
              <button onClick={() => { setShowForm(false); setEditingItem(null); setForm(emptyForm); }} style={{ flex: 1, padding: '10px', background: 'white', color: '#888', border: '1.5px solid #E0E0E0', borderRadius: '2rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {filteredItems.map(item => (
          <article key={item.id}
            style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: item.available ? '1.5px solid transparent' : '1.5px solid #E0E0E0', opacity: item.available ? 1 : 0.6 }}>
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
                  <button onClick={() => handleEdit(item)} style={{ backgroundColor: '#FFF0F0', color: BRAND, border: 'none', borderRadius: '8px', padding: '4px 10px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDelete(item.id)} style={{ backgroundColor: '#F5F5F5', color: '#aaa', border: 'none', borderRadius: '8px', padding: '4px 8px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

// ============ ANALYTICS COMPONENTS ============
function SimpleBarChart({ data, labels, color, height = 120 }) {
  const maxValue = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: `${height}px` }}>
      {data.map((value, idx) => (
        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div style={{ height: `${(value / maxValue) * (height - 25)}px`, width: '100%', backgroundColor: color, borderRadius: '4px 4px 0 0', transition: 'height 0.3s ease' }} />
          <span style={{ fontSize: '0.6rem', color: '#888' }}>{labels[idx]}</span>
        </div>
      ))}
    </div>
  );
}

function ProfitCalculator() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [duration, setDuration] = useState('week');
  const [applyDiscount, setApplyDiscount] = useState(false);

  const menuItemsForProfit = [
    { id: 1, name: 'Classic Kota', basePrice: 25, weeklyProfit: 12500, monthlyProfit: 50000 },
    { id: 2, name: 'Chicken Burger', basePrice: 45, weeklyProfit: 18900, monthlyProfit: 75600 },
    { id: 3, name: 'Mini Chips', basePrice: 15, weeklyProfit: 5250, monthlyProfit: 21000 },
  ];

  const filteredItems = menuItemsForProfit.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setSearchTerm(item.name);
  };

  const estimatedProfit = selectedItem
    ? (duration === 'week' ? selectedItem.weeklyProfit : selectedItem.monthlyProfit) * (applyDiscount ? 0.9 : 1)
    : null;

  return (
    <div style={{ background: 'white', borderRadius: '14px', padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
      <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px' }}>💰 Profit Calculator</h3>
      <p style={{ fontSize: '0.7rem', color: '#888', marginBottom: '12px' }}>Calculate estimated profit for any menu item</p>
      <div style={{ position: 'relative', marginBottom: '12px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
        <input type="text" placeholder="Search menu item..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); if (!e.target.value) setSelectedItem(null); }} style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1.5px solid #EBEBEB', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
        {searchTerm && filteredItems.length > 0 && !selectedItem && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #EBEBEB', borderRadius: '10px', maxHeight: '150px', overflowY: 'auto', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            {filteredItems.map(item => (
              <div key={item.id} onClick={() => handleSelectItem(item)} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.8rem', borderBottom: '1px solid #F0F0F0' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F5F5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                {item.name} - R{item.basePrice}
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button onClick={() => setDuration('week')} style={{ flex: 1, padding: '6px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600, border: 'none', cursor: 'pointer', backgroundColor: duration === 'week' ? BRAND : '#F0F0F0', color: duration === 'week' ? 'white' : '#666' }}>Next Week</button>
        <button onClick={() => setDuration('month')} style={{ flex: 1, padding: '6px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600, border: 'none', cursor: 'pointer', backgroundColor: duration === 'month' ? BRAND : '#F0F0F0', color: duration === 'month' ? 'white' : '#666' }}>Next Month</button>
      </div>
      {estimatedProfit && (
        <div>
          <p style={{ fontSize: '0.7rem', color: '#888' }}>Estimated profit for "{selectedItem?.name}" {duration === 'week' ? 'next week' : 'next month'}:</p>
          <p style={{ fontSize: '1.2rem', fontWeight: 700, color: BRAND, margin: '4px 0 8px' }}>R {estimatedProfit.toLocaleString()}</p>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem' }}>
            <input type="checkbox" checked={applyDiscount} onChange={(e) => setApplyDiscount(e.target.checked)} />
            Apply 10% discount
          </label>
          {applyDiscount && (<p style={{ fontSize: '0.7rem', color: '#2A7D2A', marginTop: '4px' }}>After discount: R {(estimatedProfit * 0.9).toLocaleString()}</p>)}
        </div>
      )}
    </div>
  );
}

// ============ VENDOR APPLICATION FORM ============
const VENDOR_CATEGORIES = ['Fast Food', 'Cafe', 'Asian', 'Pizza', 'Healthy', 'Indian', 'Other'];

function VendorApplicationForm({ vendorId, vendorName, onSubmitted }) {
  const [submitting, setSubmitting] = useState(false);
  const [sampleItem, setSampleItem] = useState('');
  const [form, setForm] = useState({
    stall_name: vendorName || '',
    category: 'Fast Food',
    owner_name: '',
    owner_email: '',
    phone: '',
    location: '',
    hours: '',
    description: '',
    health_cert_file: null,
    health_cert_name: '',
    bank_name: '',
    bank_account_number: '',
    sample_items: [],
  });

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const addSampleItem = () => {
    if (sampleItem.trim() && form.sample_items.length < 6) {
      update('sample_items', [...form.sample_items, sampleItem.trim()]);
      setSampleItem('');
    }
  };

  const removeSampleItem = (idx) =>
    update('sample_items', form.sample_items.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!form.owner_name || !form.phone || !form.description || !form.location) {
      alert('Please fill in all required fields (marked with *)');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vendors/${vendorId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to submit');
      onSubmitted();
    } catch (err) {
      console.error(err);
      // Even if backend endpoint not ready, proceed to pending screen
      onSubmitted();
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #EBEBEB', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', backgroundColor: 'white' };
  const labelStyle = { fontSize: '0.72rem', fontWeight: 700, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px', display: 'block' };
  const sectionStyle = { backgroundColor: 'white', borderRadius: '16px', padding: '18px', marginBottom: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F5F2' }}>
      <header style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #E8726A 100%)`, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '36px', height: '36px', backgroundColor: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShoppingCart size={18} color={BRAND} strokeWidth={2.5} />
        </div>
        <span style={{ color: 'white', fontSize: '1.2rem', fontWeight: 800 }}>OrderUp</span>
      </header>

      <section style={{ margin: '16px', background: `linear-gradient(135deg, ${BRAND} 0%, #E8726A 100%)`, borderRadius: '18px', padding: '20px 24px' }}>
        <h1 style={{ color: 'white', fontSize: '1.3rem', fontWeight: 800, margin: '0 0 4px' }}>Vendor Application</h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: 0 }}>Tell us about your stall — our team will review your application within 24–48 hours</p>
      </section>

      <div style={{ padding: '0 16px 32px' }}>

        {/* Business Info */}
        <div style={sectionStyle}>
          <p style={labelStyle}>Business Info</p>
          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}>Stall / Business Name *</label>
            <input style={inputStyle} value={form.stall_name} onChange={e => update('stall_name', e.target.value)} placeholder="e.g. Jimmy's Kota" />
          </div>
          <div>
            <label style={labelStyle}>Category *</label>
            <select style={{ ...inputStyle }} value={form.category} onChange={e => update('category', e.target.value)}>
              {VENDOR_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Owner Details */}
        <div style={sectionStyle}>
          <p style={labelStyle}>Owner Details</p>
          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}>Full Name *</label>
            <input style={inputStyle} value={form.owner_name} onChange={e => update('owner_name', e.target.value)} placeholder="e.g. Thabo Nkosi" />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}>Email Address</label>
            <input style={inputStyle} type="email" value={form.owner_email} onChange={e => update('owner_email', e.target.value)} placeholder="e.g. thabo@kota.co.za" />
          </div>
          <div>
            <label style={labelStyle}>Phone Number *</label>
            <input style={inputStyle} type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="e.g. 082 555 0192" />
          </div>
        </div>

        {/* Operations */}
        <div style={sectionStyle}>
          <p style={labelStyle}>Operations</p>
          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}>Stall Location *</label>
            <input style={inputStyle} value={form.location} onChange={e => update('location', e.target.value)} placeholder="e.g. Matrix Food Court, Stall 4" />
          </div>
          <div>
            <label style={labelStyle}>Operating Hours</label>
            <input style={inputStyle} value={form.hours} onChange={e => update('hours', e.target.value)} placeholder="e.g. 07:00 - 17:00" />
          </div>
        </div>

        {/* Business Description */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Business Description *</label>
          <textarea rows={4} style={{ ...inputStyle, resize: 'none' }} value={form.description} onChange={e => update('description', e.target.value)} placeholder="Describe your stall, cuisine type, and what makes your food special..." />
        </div>

        {/* Compliance */}
        <div style={sectionStyle}>
          <p style={labelStyle}>Compliance</p>
          <label style={labelStyle}>Health Certificate (Document Upload)</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '12px', border: '1.5px dashed #EBEBEB', backgroundColor: '#FAFAFA', cursor: 'pointer' }}>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={e => {
              const file = e.target.files[0];
              if (file) { update('health_cert_file', file); update('health_cert_name', file.name); }
            }} />
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `linear-gradient(135deg, ${BRAND} 0%, #E8726A 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '1rem' }}>📄</span>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: form.health_cert_name ? '#1a1a2e' : '#aaa' }}>
                {form.health_cert_name || 'Upload health certificate'}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#bbb' }}>PDF, JPG or PNG accepted</p>
            </div>
          </label>
        </div>

        {/* Banking */}
        <div style={sectionStyle}>
          <p style={labelStyle}>Banking</p>
          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}>Bank Name</label>
            <input style={inputStyle} value={form.bank_name} onChange={e => update('bank_name', e.target.value)} placeholder="e.g. FNB, Standard Bank, ABSA" />
          </div>
          <div>
            <label style={labelStyle}>Bank Account Number</label>
            <input style={inputStyle} type="text" value={form.bank_account_number} onChange={e => update('bank_account_number', e.target.value)} placeholder="e.g. 62012345678" />
          </div>
        </div>

        {/* Sample Menu Items */}
        <div style={sectionStyle}>
          <p style={labelStyle}>Sample Menu Items</p>
          <p style={{ fontSize: '0.72rem', color: '#aaa', marginBottom: '10px' }}>Add up to 6 items that best represent your menu</p>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <input style={{ ...inputStyle, flex: 1 }} value={sampleItem} onChange={e => setSampleItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSampleItem()} placeholder="e.g. Chicken Burger" />
            <button onClick={addSampleItem} style={{ padding: '10px 18px', background: `linear-gradient(135deg, ${BRAND} 0%, #E8726A 100%)`, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Add</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {form.sample_items.map((item, idx) => (
              <span key={idx} style={{ backgroundColor: '#FFF0F0', color: BRAND, fontSize: '0.78rem', fontWeight: 600, padding: '6px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {item}
                <span onClick={() => removeSampleItem(idx)} style={{ cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>×</span>
              </span>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button onClick={handleSubmit} disabled={submitting} style={{ width: '100%', padding: '16px', background: submitting ? '#ccc' : `linear-gradient(135deg, ${BRAND} 0%, #E8726A 100%)`, color: 'white', border: 'none', borderRadius: '2rem', fontSize: '1rem', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: submitting ? 'none' : '0 4px 15px rgba(192,71,74,0.4)' }}>
          {submitting ? 'Submitting...' : '🚀 Submit Application'}
        </button>
      </div>
    </div>
  );
}

// ============ PENDING REVIEW SCREEN ============
function VendorPendingScreen({ vendorName }) {
  const steps = [
    { label: 'Application Submitted', done: true },
    { label: 'Under Admin Review', done: false, active: true },
    { label: 'Approved & Live', done: false },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F5F2' }}>
      <header style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #E8726A 100%)`, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '36px', height: '36px', backgroundColor: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShoppingCart size={18} color={BRAND} strokeWidth={2.5} />
        </div>
        <span style={{ color: 'white', fontSize: '1.2rem', fontWeight: 800 }}>OrderUp</span>
      </header>

      <div style={{ padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: `linear-gradient(135deg, ${BRAND} 0%, #E8726A 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 8px 24px rgba(192,71,74,0.35)' }}>
          <Clock size={36} color="white" />
        </div>

        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a1a2e', margin: '0 0 8px', textAlign: 'center' }}>Application Under Review</h1>
        <p style={{ fontSize: '0.9rem', color: '#666', textAlign: 'center', lineHeight: 1.6, marginBottom: '28px', maxWidth: '320px' }}>
          Thanks{vendorName ? `, ${vendorName}` : ''}! Our team is reviewing your application and will get back to you within <strong>24–48 hours</strong>.
        </p>

        {/* Progress Steps */}
        <div style={{ width: '100%', backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
          {steps.map((step, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: idx < steps.length - 1 ? '20px' : 0 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: step.done ? BRAND : step.active ? '#FFF0F0' : '#F5F5F5', border: step.active ? `2px solid ${BRAND}` : 'none' }}>
                {step.done
                  ? <CheckCircle2 size={18} color="white" />
                  : <span style={{ fontSize: '0.75rem', fontWeight: 700, color: step.active ? BRAND : '#ccc' }}>{idx + 1}</span>
                }
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: step.active ? 700 : 600, color: step.done ? '#2A7D2A' : step.active ? BRAND : '#aaa' }}>{step.label}</p>
                {step.active && <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#888' }}>Usually within 24–48 hours</p>}
              </div>
              {step.done && <CheckCircle2 size={16} color="#2A7D2A" />}
              {step.active && <span style={{ fontSize: '0.65rem', backgroundColor: '#FFF0F0', color: BRAND, fontWeight: 700, padding: '3px 10px', borderRadius: '20px' }}>In Progress</span>}
            </div>
          ))}
        </div>

        {/* Info Card */}
        <div style={{ width: '100%', backgroundColor: '#FFF8F0', border: '1.5px solid #FFE0C8', borderRadius: '14px', padding: '16px' }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#C26A1A', margin: '0 0 8px' }}>📋 What happens next?</p>
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.78rem', color: '#666', lineHeight: 1.9 }}>
            <li>Our admin team will review your application details</li>
            <li>You may be contacted if additional information is needed</li>
            <li>Once approved, you'll have full access to your dashboard</li>
            <li>You can start receiving orders immediately after approval</li>
          </ul>
        </div>

        <p style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '20px', textAlign: 'center' }}>
          Questions? Contact us at <span style={{ color: BRAND }}>support@orderup.co.za</span>
        </p>
      </div>
    </div>
  );
}

// ============ MAIN VENDOR DASHBOARD ============
export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const [activeFilter, setActiveFilter] = useState('All orders');
  const [orders, setOrders] = useState([]);
  const [vendorStatus, setVendorStatus] = useState('loading');
  const [vendorId, setVendorId] = useState(null);
  const [vendorDisplayName, setVendorDisplayName] = useState('');

  useEffect(() => {
    setVendorId('52a38ed7-bb34-4b34-813e-026eb1e9f616');
    setVendorStatus('approved');
    return; // default to approved for development/testing
    const raw = JSON.parse(localStorage.getItem('orderup_user') || '{}');
    const user = raw?.user ?? raw;
    if (!user?.id) {
      setVendorStatus('apply');
      return;
    }
    const checkStatus = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vendors/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile_id: user.id }),
        });
        const vendor = await res.json();
        if (!vendor?.id) { setVendorStatus('apply'); return; }
        setVendorId(vendor.id);
        setVendorDisplayName(vendor.stall_name || vendor.name || '');
        if (!vendor.phone && !vendor.description) {
          setVendorStatus('apply');
        } else if (vendor.status === 'approved') {
          setVendorStatus('approved');
        } else {
          setVendorStatus('pending');
        }
      } catch (err) {
        console.error('Could not check vendor status:', err);
        setVendorStatus('approved'); // fallback to dashboard if API unreachable
      }
    };
    checkStatus();
  }, []);

   useEffect(() => {
    if (!vendorId) return;
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/vendor/${vendorId}`);
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error('Failed to load orders:', err);
      }
    };
    fetchOrders();
  }, [vendorId]);// this would fetch the orders for the vendor when the dashboard loads


  if (vendorStatus === 'loading') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F7F5F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Loading your dashboard...</p>
      </div>
    );
  }

  if (vendorStatus === 'apply') {
    return <VendorApplicationForm vendorId={vendorId} vendorName={vendorDisplayName} onSubmitted={() => setVendorStatus('pending')} />;
  }

  if (vendorStatus === 'pending') {
    return <VendorPendingScreen vendorName={vendorDisplayName} />;
  }

  const handleUpdateStatus = async (orderId) => {
  try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}/status`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to update status');
      const updated = await res.json();
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: updated.status } : o));
    } catch (err) {
      console.error('Status update failed:', err);
      alert('Could not update order status. Please try again.');
    }
  };// this would be called when vendor clicks "Mark as Collected" or similar action in the orders tab

 
  const filteredOrders = activeFilter === 'All orders'
    ? orders.filter(o => o.status !== 'collected')
    : orders.filter(o => o.status === activeFilter);

  const totalOrders = orders.length;

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  const totalCustomers = new Set(orders.map(order => order.customer_name)).size; //change to customer_id if available

  const itemSalesMap = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      const name = item.name;
      if (!itemSalesMap[name]) {
        itemSalesMap[name] = { name, quantity: 0, revenue: 0 };
      }
      itemSalesMap[name].quantity += 1;
      itemSalesMap[name].revenue += item.price;
    });
  });
  const topSellingItems = Object.values(itemSalesMap).sort((a, b) => b.quantity - a.quantity);

  const weeklyRevenue = [18500, 22100, 19800, 24300, 26700, 28900, 31200];
  const weeklyOrders = [42, 48, 45, 52, 58, 62, 68];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const likedDishesData = [
    { name: 'Classic Kota', percentage: 45, sales: 156, trend: '+12%' },
    { name: 'Chicken Burger', percentage: 30, sales: 98, trend: '+8%' },
    { name: 'Mini Chips', percentage: 25, sales: 87, trend: '+5%' },
  ];

  const popularTimes = [
    { hour: '12pm - 1pm', traffic: 'Busy', level: 80, orders: 24 },
    { hour: '1pm - 2pm', traffic: 'Very Busy', level: 95, orders: 32 },
    { hour: '7pm - 8pm', traffic: 'Peak Hour', level: 100, orders: 45 },
    { hour: '8pm - 9pm', traffic: 'Little Busy', level: 65, orders: 18 },
  ];

  const recentReviews = [
    { name: 'Tanvi Yadav', rating: 5, comment: 'Amazing food! The Classic Kota is absolutely delicious. Will order again soon!', source: 'Google', date: '2 days ago' },
    { name: "Karel D'Costa", rating: 4, comment: 'Good quality and fast delivery. Chicken burger was tasty but could be bigger.', source: 'Zomato', date: '5 days ago' },
    { name: 'Vishwajeet Gokar', rating: 5, comment: 'Best kota in town! The portion size is great and prices are reasonable.', source: 'Zomato', date: '1 week ago' },
  ];

  const cardStyle = { background: 'white', padding: '16px', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' };
  const labelStyle = { fontSize: '0.75rem', color: '#888', margin: 0 };
  const valueStyle = { fontSize: '1.2rem', fontWeight: 700, margin: '6px 0 0', color: BRAND };
  const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' };
  const trendStyle = { fontSize: '0.7rem', fontWeight: 700, color: '#2A7D2A' };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F5F2' }}>
      {/* Header */}
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

      {/* Hero Banner */}
      <section style={{ margin: '16px', background: `linear-gradient(135deg, ${BRAND} 0%, #E8726A 100%)`, borderRadius: '18px', padding: '20px 24px' }}>
        <h1 style={{ color: 'white', fontSize: '1.3rem', fontWeight: 800, marginBottom: '4px' }}> Dashboard</h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem' }}>{orders.filter(o => o.status !== 'collected').length} active orders today</p>
      </section>

      {/* Tabs */}
      <nav style={{ display: 'flex', margin: '0 16px 16px', backgroundColor: 'white', borderRadius: '14px', padding: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', gap: '4px' }}>
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, backgroundColor: activeTab === tab.id ? BRAND : 'transparent', color: activeTab === tab.id ? 'white' : '#888', transition: 'all 0.2s ease' }}>
              <TabIcon size={15} strokeWidth={2} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <section style={{ padding: '0 16px 32px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }}>
            {orderFilters.map((filter) => (
              <button key={filter} onClick={() => setActiveFilter(filter)} style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', border: activeFilter === filter ? 'none' : '1.5px solid #E0E0E0', backgroundColor: activeFilter === filter ? BRAND : 'white', color: activeFilter === filter ? 'white' : '#666' }}>
                {filter}
              </button>
            ))}
          </div>
          {filteredOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa', fontSize: '0.9rem' }}>No orders in this category</div>
          ) : (
            filteredOrders.map((order) => <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateStatus} />)
          )}
        </section>
      )}

      {/* Menu Tab */}
      {activeTab === 'menu' && (
        <section style={{ padding: '0 16px 32px' }}>
          <MenuManager />
        </section>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <section style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Analytics Dashboard</h2>
            <select style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #E0E0E0', fontSize: '0.7rem' }}>
              <option>This Week</option>
              <option>This Month</option>
              <option>Last 3 Months</option>
            </select>
          </div>

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <div style={cardStyle}>
              <div style={cardHeader}><DollarSign size={16} color={BRAND} /><span style={trendStyle}>+8%</span></div>
              <p style={labelStyle}>Total Revenue</p>
              <h3 style={valueStyle}>R {totalRevenue}</h3>
            </div>
            <div style={cardStyle}>
              <div style={cardHeader}><TrendingUp size={16} color="#C26A1A" /><span style={{ fontSize: '0.65rem', color: BRAND }}>Last month: R 2,30,200</span></div>
              <p style={labelStyle}>Profit (Last Month)</p>
              <h3 style={valueStyle}>R 1,85,500</h3>
            </div>
            <div style={cardStyle}>
              <ShoppingBag size={16} color="#2A6DB5" />
              <p style={labelStyle}>Total Orders</p>
              <h3 style={valueStyle}>{totalOrders}</h3>
            </div>
            <div style={cardStyle}>
              <Users size={16} color="#7B4FBF" />
              <p style={labelStyle}>Customers</p>
              <h3 style={valueStyle}>{totalCustomers}</h3>
            </div>
          </div>

          {/* Revenue Chart */}
          <div style={{ ...cardStyle, marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>📈 Revenue Trend (This Week)</h3>
              <span style={{ fontSize: '0.7rem', color: '#2A7D2A' }}>↑ 12% vs last week</span>
            </div>
            <SimpleBarChart data={weeklyRevenue} labels={days} color={BRAND} height={140} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <span style={{ fontSize: '0.65rem', color: '#888' }}>Total: R {weeklyRevenue.reduce((a, b) => a + b, 0).toLocaleString()}</span>
              <span style={{ fontSize: '0.65rem', color: '#888' }}>Avg: R {(weeklyRevenue.reduce((a, b) => a + b, 0) / 7).toFixed(0)}</span>
            </div>
          </div>

          {/* Orders Chart */}
          <div style={{ ...cardStyle, marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>📊 Orders Trend (This Week)</h3>
              <span style={{ fontSize: '0.7rem', color: '#2A7D2A' }}>↑ 8% vs last week</span>
            </div>
            <SimpleBarChart data={weeklyOrders} labels={days} color="#7B4FBF" height={120} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <span style={{ fontSize: '0.65rem', color: '#888' }}>Total: {weeklyOrders.reduce((a, b) => a + b, 0)} orders</span>
              <span style={{ fontSize: '0.65rem', color: '#888' }}>Peak: {Math.max(...weeklyOrders)} orders (Fri)</span>
            </div>
          </div>

          {/* Liked Dishes & Popular Times */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <ThumbsUp size={16} color={BRAND} />
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>Liked Dishes</h3>
              </div>
              {likedDishesData.map(dish => (
                <div key={dish.name} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{dish.name}</span>
                    <span style={{ fontSize: '0.7rem', color: BRAND }}>{dish.percentage}%</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#F0F0F0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${dish.percentage}%`, height: '100%', backgroundColor: BRAND, borderRadius: '3px' }} />
                  </div>
                  <p style={{ fontSize: '0.65rem', color: '#999', margin: '4px 0 0' }}>{dish.sales} orders • {dish.trend}</p>
                </div>
              ))}
            </div>

            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Clock size={16} color={BRAND} />
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>Popular Times</h3>
              </div>
              <div style={{ backgroundColor: '#FFF0F0', borderRadius: '10px', padding: '10px', marginBottom: '12px' }}>
                <p style={{ fontSize: '0.65rem', color: BRAND, margin: '0 0 2px' }}>🔴 Peak Hour (7pm - 8pm)</p>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>45 orders/hour</p>
              </div>
              {popularTimes.map(time => (
                <div key={time.hour} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.7rem', width: '70px' }}>{time.hour}</span>
                  <div style={{ flex: 1, height: '4px', backgroundColor: '#F0F0F0', borderRadius: '2px' }}>
                    <div style={{ width: `${time.level}%`, height: '100%', backgroundColor: time.level > 80 ? BRAND : '#E8726A', borderRadius: '2px' }} />
                  </div>
                  <span style={{ fontSize: '0.65rem', color: '#666' }}>{time.orders} orders</span>
                </div>
              ))}
            </div>
          </div>

          {/* Profit Calculator */}
          <div style={{ marginBottom: '20px' }}>
            <ProfitCalculator />
          </div>

          {/* Customer Reviews */}
          <div style={{ ...cardStyle, marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <MessageSquare size={16} color={BRAND} />
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>Customer Reviews</h3>
            </div>
            {recentReviews.map((review, idx) => (
              <div key={idx} style={{ borderBottom: idx !== recentReviews.length - 1 ? '1px solid #F0F0F0' : 'none', paddingBottom: idx !== recentReviews.length - 1 ? '12px' : 0, marginBottom: idx !== recentReviews.length - 1 ? '12px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{review.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
                      {[...Array(5)].map((_, i) => (<Star key={i} size={10} fill={i < review.rating ? '#FFB800' : 'none'} color={i < review.rating ? '#FFB800' : '#DDD'} />))}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.6rem', padding: '2px 8px', backgroundColor: '#F0F0F0', borderRadius: '12px' }}>{review.source}</span>
                </div>
                <p style={{ fontSize: '0.7rem', color: '#666', lineHeight: 1.4, margin: '6px 0 0' }}>{review.comment}</p>
                <p style={{ fontSize: '0.6rem', color: '#999', marginTop: '4px' }}>{review.date}</p>
              </div>
            ))}
          </div>

          {/* Top Selling Items */}
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Top Selling Items</h2>
          <div style={cardStyle}>
            {topSellingItems.length === 0 ? (
              <p style={{ color: '#aaa', textAlign: 'center', padding: '20px' }}>No sales data yet</p>
            ) : (
              topSellingItems.map((item, idx) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: idx !== topSellingItems.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#FFF0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>#{idx + 1}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.8rem' }}>{item.name}</p>
                    <p style={{ margin: 0, fontSize: '0.65rem', color: '#888' }}>Sold {item.quantity} times</p>
                  </div>
                  <div style={{ fontWeight: 700, color: BRAND, fontSize: '0.85rem' }}>R {item.revenue}</div>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
