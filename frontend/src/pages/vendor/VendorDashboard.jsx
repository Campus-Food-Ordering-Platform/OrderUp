import { useState, useEffect } from 'react';
import {
  ShoppingCart, UserRound, UtensilsCrossed, BarChart2, Trash2,
  TrendingUp, Users, ShoppingBag, DollarSign, CheckCircle2,
  Search, Star, Clock, MessageSquare, ThumbsUp, XCircle, Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
        {(order.items ?? []).map((item, i) => (
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
const CATEGORIES_DEFAULT = ['Cafe', 'Fast Food', 'Asian', 'Pizza', 'Healthy', 'Indian','Mains'];
//const ALLERGENS = ["Cow's Milk", 'Peanuts', 'Tree Nuts', 'Soya', 'Gluten', 'Egg', 'Fish', 'Shellfish'];
//const DIETARY_TAGS = ['Halaal', 'Vegetarian', 'Vegan', 'Kosher', 'Nut-Free', 'Gluten-Free', 'Dairy-Free'];

const ALLERGENS = [
  { id: "Cow's Milk", label: "Cow's Milk", definition: "Contains milk or milk-derived ingredients such as cheese, butter, cream or lactose." },
  { id: "Peanuts", label: "Peanuts", definition: "Contains peanuts or peanut-derived ingredients." },
  { id: "Tree Nuts", label: "Tree Nuts", definition: "Contains almonds, Brazil nuts, cashew nuts, hazelnuts, macadamia nuts, pecan nut, pistachio nuts or walnuts." },
  { id: "Soya", label: "Soya", definition: "Contains soybeans or soy-derived ingredients." },
  { id: "Gluten", label: "Gluten", definition: "Contains wheat, rye, barley, oats or crossbred hybrids. Regulated in South Africa as Significant Cereals under R146 of 2010." },
  { id: "Egg", label: "Egg", definition: "Contains egg or egg-derived ingredients." },
  { id: "Fish", label: "Fish", definition: "Contains fish or fish-derived ingredients." },
  { id: "Shellfish", label: "Shellfish", definition: "Contains prawns, crab, lobster, crayfish, mussels, oysters or similar seafood. Regulated in South Africa as Crustaceans and Molluscs under R146 of 2010." },
];

const DIETARY_TAGS = [
  { id: "Halaal", label: "Halaal", definition: "Contains no pork or pork by-products and no alcohol. Prepared according to Islamic dietary law as defined by SANHA." },
  { id: "Vegetarian", label: "Vegetarian", definition: "Contains no meat or fish but may contain dairy and eggs." },
  { id: "Vegan", label: "Vegan", definition: "Contains no animal products including meat, fish, dairy, eggs or honey." },
  { id: "Kosher", label: "Kosher", definition: "Prepared according to Jewish dietary law. Meat and dairy are not mixed." },
  { id: "Nut-Free", label: "Nut-Free", definition: "Contains no tree nuts or peanuts. Suitable for people with nut allergies." },
  { id: "Gluten-Free", label: "Gluten-Free", definition: "Contains no wheat, rye, barley, oats or crossbred hybrids. Suitable for people with coeliac disease or gluten intolerance." },
  { id: "Dairy-Free", label: "Dairy-Free", definition: "Contains no milk or milk-derived ingredients. Suitable for people with lactose intolerance or a dairy allergy." },
];

const tagColors = {
  Halaal: { bg: '#E0F7EF', color: '#2A9D6A' },
  Vegetarian: { bg: '#F0FFF0', color: '#3A8A3A' },
  Vegan: { bg: '#E8F8E8', color: '#2A7D2A' },
  Kosher: { bg: '#FFF8E1', color: '#B8860B' },
  'Nut-Free': { bg: '#FFF8E1', color: '#B8860B' },
  'Gluten-Free': { bg: '#F3E8FF', color: '#7B4FBF' },
  'Dairy-Free': { bg: '#E8F4FD', color: '#77ade7' },
};


const makeEmptyForm = () => ({
  name: '', description: '', price: '', category: CATEGORIES_DEFAULT[0], 
  allergens: [], tags: [], available: true, image_url: null,
});

// ============ MENU MANAGER COMPONENT ============
function MenuManager() {
  const [items, setItems] = useState([]);
  const [vendorId, setVendorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(makeEmptyForm());
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [customCategories, setCustomCategories] = useState([]);

  const emptyForm = makeEmptyForm();

useEffect(() => {
  const raw = JSON.parse(localStorage.getItem('orderup_user') || '{}');
  const user = raw?.user ?? raw;
  if (!user?.id) { setLoading(false); return; }

  const init = async () => {
    try {
      // Use /status instead of /register — register breaks for approved vendors
      const statusRes = await fetch(`${import.meta.env.VITE_API_URL}/api/vendors/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: user.id }),
      });

      if (!statusRes.ok) {
        const err = await statusRes.text();
        throw new Error(`Status check failed: ${statusRes.status} - ${err}`);
      }

      const data = await statusRes.json();

      if (!data || data.type !== 'vendor' || !data.id) {
        console.log('No approved vendor found:', data);
        setLoading(false);
        return;
      }

      setVendorId(data.id);

      const menuRes = await fetch(`${import.meta.env.VITE_API_URL}/api/vendors/${data.id}/menu`);
      if (!menuRes.ok) throw new Error(`Menu fetch failed: ${menuRes.status}`);
      const menuData = await menuRes.json();
      setItems(Array.isArray(menuData) ? menuData : []);
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

  const toggleAllergen = (allergen) => {
  setForm(prev => ({
    ...prev,
    allergens: prev.allergens.includes(allergen) 
      ? prev.allergens.filter(a => a !== allergen) 
      : [...prev.allergens, allergen],
  }));
};

  const handleImageFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    try {
      const signRes = await fetch(
  `${import.meta.env.VITE_API_URL}/api/upload/sign?folder=orderup/menu-items&resource_type=image`);
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
    if (Number(form.price) <= 0) {
      alert('Price must be greater than R0.00');
      return;
}    const payload = { ...form, price: Number(form.price) };
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
    setForm(makeEmptyForm());
    setEditingItem(null);
    setShowForm(false);
  };

const handleEdit = (item) => {
  setForm({ 
    ...item, 
    price: String(item.price), 
    allergens: item.allergens || [],
    tags: item.tags || [], 
    image_url: item.image_url || null 
  });
  setEditingItem(item.id);
  setShowForm(true);
};

  const handleDelete = async (id) => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/vendors/${vendorId}/menu/${id}`, { method: 'DELETE' });
    setItems(prev => prev.filter(i => i.id !== id));
  };
  // this files checks if our thing is available 
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
      <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#555', margin: '0 0 8px' }}>Menu categories</p>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {['All', ...CATEGORIES_DEFAULT, ...customCategories].map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            style={{ padding: '5px 16px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', border: activeCategory === cat ? 'none' : '1.5px solid #E0E0E0', backgroundColor: activeCategory === cat ? BRAND : 'white', color: activeCategory === cat ? 'white' : '#666' }}>
            {cat}
          </button>
        ))}
        <button
          onClick={() => {
            const newCat = prompt('Enter new category name:');
            if (newCat && newCat.trim() && !CATEGORIES_DEFAULT.includes(newCat.trim()) && !customCategories.includes(newCat.trim())) {
              setCustomCategories([...customCategories, newCat.trim()]);
              setActiveCategory(newCat.trim());
            }
          }}
          style={{ padding: '5px 16px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', border: '1.5px dashed #C0474A', backgroundColor: 'transparent', color: '#C0474A' }}>
          + Add Category
        </button>
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
                  style={{ width: '100%', padding: '10px 14px 10px 28px', borderRadius: '10px', border: '1.5px solid #EBEBEB', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}          min="0.01"  // ← add this
        step="0.01" />
              </div>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #EBEBEB', fontSize: '0.85rem', outline: 'none', backgroundColor: 'white' }}>
                {[...CATEGORIES_DEFAULT, ...customCategories].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
              
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#555', margin: '0 0 6px' }}>Allergens</p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {ALLERGENS.map(allergen => {
                const selected = form.allergens.includes(allergen.id);
                return (
                  <div key={allergen.id} style={{ position: 'relative' }}>
                    <button
                      onClick={() => toggleAllergen(allergen.id)}
                      style={{
                        padding: '4px 8px 4px 12px', borderRadius: '20px',
                        fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                        border: 'none', display: 'flex', alignItems: 'center', gap: '4px',
                        backgroundColor: selected ? '#FFE8E8' : '#F5F5F5',
                        color: selected ? '#C0474A' : '#999',
                        outline: selected ? '1.5px solid #C0474A' : '1.5px solid transparent',
                      }}>
                      {allergen.label}
                      <span
                        onMouseEnter={() => setActiveTooltip(allergen.id)}
                        onMouseLeave={() => setActiveTooltip(null)}
                        onClick={e => { e.stopPropagation(); setActiveTooltip(activeTooltip === allergen.id ? null : allergen.id); }}
                        style={{ fontSize: '0.65rem', color: selected ? '#C0474A' : '#bbb', cursor: 'help', fontWeight: 700 }}>
                        ⓘ
                      </span>
                    </button>
                    {activeTooltip === allergen.id && (
                      <div style={{
                        position: 'absolute', bottom: '110%', left: '0',
                        transform: 'none', backgroundColor: '#1a1a2e',
                        color: 'white', fontSize: '0.68rem', padding: '8px 10px',
                        borderRadius: '8px', width: '180px', zIndex: 100,
                        lineHeight: 1.5, boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        pointerEvents: 'none',
                      }}>
                        {allergen.definition}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#555', margin: '6px 0 6px' }}>Dietary Tags</p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {DIETARY_TAGS.map(tag => {
                const selected = form.tags.includes(tag.id);
                return (
                  <div key={tag.id} style={{ position: 'relative' }}>
                    <button
                      onClick={() => toggleTag(tag.id)}
                      style={{
                        padding: '4px 8px 4px 12px', borderRadius: '20px',
                        fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                        border: 'none', display: 'flex', alignItems: 'center', gap: '4px',
                        backgroundColor: selected ? (tagColors[tag.id]?.bg || '#eee') : '#F5F5F5',
                        color: selected ? (tagColors[tag.id]?.color || '#444') : '#999',
                        outline: selected ? `1.5px solid ${tagColors[tag.id]?.color || '#ccc'}` : '1.5px solid transparent',
                      }}>
                      {tag.label}
                      <span
                        onMouseEnter={() => setActiveTooltip(tag.id)}
                        onMouseLeave={() => setActiveTooltip(null)}
                        onClick={e => { e.stopPropagation(); setActiveTooltip(activeTooltip === tag.id ? null : activeTooltip); }}
                        style={{ fontSize: '0.65rem', color: selected ? (tagColors[tag.id]?.color || '#444') : '#bbb', cursor: 'help', fontWeight: 700 }}>
                        ⓘ
                      </span>
                    </button>
                    {activeTooltip === tag.id && (
                     <div style={{
                        position: 'absolute', bottom: '110%', left: '0',
                        transform: 'none', backgroundColor: '#1a1a2e',
                        color: 'white', fontSize: '0.68rem', padding: '8px 10px',
                        borderRadius: '8px', width: '180px', zIndex: 100,
                        lineHeight: 1.5, boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        pointerEvents: 'none',
                      }}>
                        {tag.definition}
                      </div>
                    )}
                  </div>
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
              {/* 
              Diplaying "tags" on menu_items card, now comdining allergens and d tags
              */}
             <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
                {[...(item.tags || []), ...(item.allergens || [])].map(tag => (
                  <span key={tag} style={{ backgroundColor: tagColors[tag]?.bg || '#FFE8E8', color: tagColors[tag]?.color || '#C0474A', fontSize: '0.62rem', fontWeight: 600, padding: '2px 8px', borderRadius: '20px' }}>{tag}</span>
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

function RevenueCalculator({ vendorId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [duration, setDuration] = useState('week');
  const [growthRate, setGrowthRate] = useState(0);
  const [applyDiscount, setApplyDiscount] = useState(false);
  const [discountPct, setDiscountPct] = useState(10);
  const [items, setItems] = useState([]);
  const [timeSeries, setTimeSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showChart, setShowChart] = useState(false);

  const DURATIONS = [
    { key: 'week',    label: 'Next Week',    weeks: 1    },
    { key: '2weeks',  label: '2 Weeks',      weeks: 2    },
    { key: '3weeks',  label: '3 Weeks',      weeks: 3    },
    { key: 'month',   label: 'Next Month',   weeks: 4.33 },
    { key: '2months', label: '2 Months',     weeks: 8.66 },
  ];

  const linearRegression = (points) => {
    const n = points.length;
    if (n === 0) return { m: 0, b: 0 };
    if (n === 1) return { m: 0, b: points[0].y };
    const sumX  = points.reduce((s, p) => s + p.x, 0);
    const sumY  = points.reduce((s, p) => s + p.y, 0);
    const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
    const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX || 1);
    const b = (sumY - m * sumX) / n;
    return { m, b };
  };

  useEffect(() => {
    if (!vendorId) return;
    setLoading(true);
    const fetchData = async () => {
      try {
        const [itemsRes, tsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/analytics/items/${vendorId}?range=month`),
          fetch(`${import.meta.env.VITE_API_URL}/api/analytics/items/${vendorId}/timeseries`),
        ]);
        const itemsJson = await itemsRes.json();
        const tsJson    = await tsRes.json();
        setItems(Array.isArray(itemsJson.data) ? itemsJson.data : []);
        setTimeSeries(Array.isArray(tsJson.data) ? tsJson.data : []);
      } catch (err) {
        console.error('RevenueCalculator fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [vendorId]);

  // ── fix: clear selected item when user edits search ────────
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedItem(null);
    setShowChart(false);
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setSearchTerm(item.name);
    setShowChart(false);
  };

  const filteredItems = items.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedDuration = DURATIONS.find(d => d.key === duration) || DURATIONS[0];

  const { projection, chartData } = (() => {
    if (!selectedItem) return { projection: null, chartData: null };

    const rows = timeSeries
      .filter(r => r.name === selectedItem.name)
      .sort((a, b) => new Date(a.week) - new Date(b.week))
      .map((r, i) => ({ x: i, y: Number(r.quantity), week: r.week }));

    const totalQty = Number(selectedItem.monthlyOrders) || 1;
    const totalRev = Number(selectedItem.monthlyRevenue) || 0;
    const avgPrice = totalRev / totalQty;

    const { m, b } = linearRegression(rows);

    // how many future weekly bars to show
    const futureBarsCount = Math.ceil(selectedDuration.weeks);

    const pastBars = rows.map((r, i) => ({
      label: `W${i + 1}`,
      value: r.y,
      projected: false,
    }));

    const futureBars = Array.from({ length: futureBarsCount }, (_, i) => {
      const x = rows.length + i;
      const raw = Math.max(0, m * x + b) * (1 + growthRate / 100);
      return {
        label: `+W${i + 1}`,
        value: raw,
        projected: true,
      };
    });

    const allBars = [...pastBars, ...futureBars];
    const maxVal  = Math.max(...allBars.map(b => b.value), 1);

    // total projected orders over the duration
    const projectedOrders = futureBars.reduce((s, b) => s + b.value, 0);
    let projectedRevenue = projectedOrders * avgPrice;
    if (applyDiscount) projectedRevenue *= (1 - discountPct / 100);

    const confidence = Math.min(100, Math.round((rows.length / 12) * 100));
    const trend = rows.length >= 2
      ? rows[rows.length - 1].y - rows[rows.length - 2].y
      : 0;

    return {
      projection: {
        projectedRevenue,
        projectedOrders: Math.round(projectedOrders),
        avgPrice,
        confidence,
        trend,
        dataPoints: rows.length,
      },
      chartData: { allBars, maxVal },
    };
  })();

  const scenarioLabel = (() => {
    if (growthRate === 0)   return { text: 'Model prediction (no adjustment)',      color: '#888' };
    if (growthRate <= -30)  return { text: 'Slow period / low demand expected',     color: BRAND };
    if (growthRate < 0)     return { text: 'Slightly below expected demand',        color: '#C26A1A' };
    if (growthRate >= 50)   return { text: 'Major promo or event expected 🎉',      color: '#2A7D2A' };
    if (growthRate >= 20)   return { text: 'Running a promotion',                   color: '#2A7D2A' };
    return                         { text: 'Slightly above expected demand',        color: '#2A6DB5' };
  })();

  return (
    <div style={{ background: 'white', borderRadius: '14px', padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>

      {/* Header */}
      <div style={{ marginBottom: '12px' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 4px' }}>📈 Revenue Projection</h3>
        <p style={{ fontSize: '0.7rem', color: '#888', margin: 0 }}>
          ML-powered forecast using linear regression on your order history
        </p>
      </div>

      {/* Item search */}
      <div style={{ position: 'relative', marginBottom: '12px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
        <input
          type="text"
          placeholder="Search menu item..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1.5px solid #EBEBEB', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
        />
        {/* show dropdown when typing and no item selected yet */}
        {searchTerm && !selectedItem && filteredItems.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #EBEBEB', borderRadius: '10px', maxHeight: '150px', overflowY: 'auto', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            {filteredItems.map(item => (
              <div key={item.name} onClick={() => handleSelectItem(item)}
                style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.8rem', borderBottom: '1px solid #F0F0F0' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F5F5F5'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
                {item.name}
                <span style={{ color: '#aaa', marginLeft: '6px' }}>
                  ~R{(Number(item.monthlyRevenue) / (Number(item.monthlyOrders) || 1)).toFixed(2)}/unit
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Duration buttons */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {DURATIONS.map(d => (
          <button key={d.key} onClick={() => { setDuration(d.key); setShowChart(false); }}
            style={{ flex: '1 1 auto', padding: '6px 4px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 600, border: 'none', cursor: 'pointer', backgroundColor: duration === d.key ? BRAND : '#F0F0F0', color: duration === d.key ? 'white' : '#666', whiteSpace: 'nowrap' }}>
            {d.label}
          </button>
        ))}
      </div>

      {/* What-if slider */}
      <div style={{ marginBottom: '14px', padding: '12px', backgroundColor: '#F9F9F9', borderRadius: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#555' }}>What-if adjustment</span>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: growthRate >= 0 ? '#2A7D2A' : BRAND }}>
            {growthRate >= 0 ? '+' : ''}{growthRate}%
          </span>
        </div>
        <input type="range" min="-50" max="100" value={growthRate}
          onChange={e => setGrowthRate(Number(e.target.value))}
          style={{ width: '100%', accentColor: BRAND, marginBottom: '4px' }} />
        <p style={{ fontSize: '0.65rem', color: scenarioLabel.color, margin: 0, fontStyle: 'italic' }}>
          {scenarioLabel.text}
        </p>
        <p style={{ fontSize: '0.6rem', color: '#bbb', margin: '4px 0 0' }}>
          Drag to model scenarios — e.g. +20% if running a promo, -20% for a slow week
        </p>
      </div>

      {/* Discount */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <input type="checkbox" checked={applyDiscount} onChange={e => setApplyDiscount(e.target.checked)} style={{ accentColor: BRAND }} />
        <span style={{ fontSize: '0.7rem' }}>Apply discount</span>
        {applyDiscount && (
          <>
            <input type="number" min="1" max="99" value={discountPct}
              onChange={e => setDiscountPct(Number(e.target.value))}
              style={{ width: '48px', padding: '2px 6px', borderRadius: '6px', border: '1.5px solid #EBEBEB', fontSize: '0.7rem', outline: 'none' }} />
            <span style={{ fontSize: '0.7rem', color: '#888' }}>%</span>
          </>
        )}
      </div>

      {loading && <p style={{ fontSize: '0.75rem', color: '#aaa', textAlign: 'center' }}>Loading data...</p>}

      {/* Projection result */}
      {projection && !loading && (
        <div style={{ backgroundColor: '#F9F9F9', borderRadius: '12px', padding: '14px', marginBottom: '12px' }}>

          {/* Confidence */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.65rem', color: '#888' }}>Model confidence</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: projection.confidence > 60 ? '#2A7D2A' : '#C26A1A' }}>
                {projection.confidence}%
              </span>
            </div>
            <div style={{ height: '4px', backgroundColor: '#E0E0E0', borderRadius: '2px' }}>
              <div style={{ width: `${projection.confidence}%`, height: '100%', backgroundColor: projection.confidence > 60 ? '#2A7D2A' : '#C26A1A', borderRadius: '2px' }} />
            </div>
            <p style={{ fontSize: '0.6rem', color: '#bbb', margin: '4px 0 0' }}>
              Based on {projection.dataPoints} week{projection.dataPoints !== 1 ? 's' : ''} of data
              {projection.dataPoints < 4 && ' — more data improves accuracy'}
            </p>
          </div>

          {/* Trend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.65rem', color: '#888' }}>Recent trend:</span>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: projection.trend > 0 ? '#2A7D2A' : projection.trend < 0 ? BRAND : '#888' }}>
              {projection.trend > 0 ? '↑ Growing' : projection.trend < 0 ? '↓ Declining' : '→ Stable'}
            </span>
          </div>

          {/* Revenue */}
          <p style={{ fontSize: '0.7rem', color: '#888', margin: '0 0 2px' }}>
            Projected revenue — {selectedDuration.label.toLowerCase()}
          </p>
          <p style={{ fontSize: '1.4rem', fontWeight: 800, color: BRAND, margin: '0 0 4px' }}>
            R {projection.projectedRevenue.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p style={{ fontSize: '0.65rem', color: '#888', margin: '0 0 12px' }}>
            ~{projection.projectedOrders} orders × R{projection.avgPrice.toFixed(2)}/unit
            {applyDiscount ? ` after ${discountPct}% discount` : ''}
            {growthRate !== 0 ? ` · ${growthRate > 0 ? '+' : ''}${growthRate}% what-if` : ''}
          </p>

          {/* Show projection button */}
          <button onClick={() => setShowChart(v => !v)}
            style={{ width: '100%', padding: '8px', borderRadius: '10px', border: `1.5px solid ${BRAND}`, backgroundColor: showChart ? BRAND : 'white', color: showChart ? 'white' : BRAND, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
            {showChart ? 'Hide Chart' : '📊 Show Projection Chart'}
          </button>
        </div>
      )}

      {/* Chart — taller, shown on demand */}
      {showChart && chartData && !loading && (
        <div style={{ backgroundColor: '#F9F9F9', borderRadius: '12px', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: BRAND }} />
              <span style={{ fontSize: '0.6rem', color: '#888' }}>Past orders</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'rgba(232,114,106,0.5)', border: '1.5px dashed #E8726A' }} />
              <span style={{ fontSize: '0.6rem', color: '#888' }}>Projected</span>
            </div>
          </div>

          {/* Taller chart — 200px */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '200px', overflowX: 'auto', paddingBottom: '4px' }}>
            {chartData.allBars.map((bar, i) => (
              <div key={i} style={{ minWidth: '28px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.55rem', color: '#888', marginBottom: '2px' }}>
                  {bar.value > 0 ? Math.round(bar.value) : ''}
                </span>
                <div style={{
                  width: '100%',
                  height: `${Math.round((bar.value / chartData.maxVal) * 85)}%`,
                  backgroundColor: bar.projected ? 'rgba(232,114,106,0.45)' : BRAND,
                  borderRadius: '4px 4px 0 0',
                  border: bar.projected ? `1.5px dashed ${BRAND}` : 'none',
                  minHeight: bar.value > 0 ? '4px' : '0',
                  transition: 'height 0.3s ease',
                }} />
                <span style={{ fontSize: '0.55rem', color: bar.projected ? '#E8726A' : '#888', marginTop: '4px', whiteSpace: 'nowrap' }}>
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.6rem', color: '#bbb', textAlign: 'center', margin: '8px 0 0' }}>
            Dashed bars = ML projection · Solid bars = actual order history
          </p>
        </div>
      )}

      {!selectedItem && !loading && (
        <p style={{ fontSize: '0.75rem', color: '#bbb', textAlign: 'center', padding: '12px 0' }}>
          Search and select a menu item to see its projection
        </p>
      )}
    </div>
  );
}
// ============ VENDOR APPLICATION FORM ============
const VENDOR_CATEGORIES = ['Fast Food', 'Cafe', 'Asian', 'Pizza', 'Healthy', 'Indian', 'Mains'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];// for refined operating hours

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

function parseHoursString(str) {
  if (!str || typeof str !== 'string') return DEFAULT_HOURS;
  try {
    const parsed = JSON.parse(str);
    if (parsed && typeof parsed === 'object' && parsed.Mon) return parsed;
  } catch (_) {}
  return DEFAULT_HOURS;
}

function serializeHours(hoursObj) {
  const openDays = DAYS.filter(d => hoursObj[d]?.open);
  if (!openDays.length) return 'Closed';
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



function VendorApplicationForm({ vendorId, vendorName, onSubmitted }) {
  const [submitting, setSubmitting] = useState(false);
  const [sampleItem, setSampleItem] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [structuredHours, setStructuredHours] = useState(DEFAULT_HOURS);
  const [form, setForm] = useState({
    stall_name: vendorName || '',
    category: 'Fast Food',
    owner_name: '',
    owner_email: '',
    phone: '',
    location: '',
    description: '',
    health_cert_file: null,
    health_cert_name: '',
    health_certificate_url: null,
    bank_name: '',
    bank_account_number: '',
    sample_items: [],
    banner_url: null,
    logo_url: null,
  });

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

 const handleImageFile = async (file) => {
  if (!file || !file.type.startsWith('image/')) return;
  setUploadingImage(true);
  try {
    const signRes = await fetch(
      `${import.meta.env.VITE_API_URL}/api/upload/sign?folder=orderup/menu-items&resource_type=image`
    );
    const { timestamp, signature, apiKey, cloudName, folder } = await signRes.json();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('api_key', apiKey);
    formData.append('folder', folder);
    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: formData }
    );
    const data = await uploadRes.json();
    if (data.secure_url) update('banner_url', data.secure_url);
    else throw new Error('No URL returned');
  } catch (err) {
    console.error('Image upload failed:', err);
    alert('Image upload failed. Please try again.');
  } finally {
    setUploadingImage(false);
  }
};

const handleLogoFile = async (file) => {
  if (!file || !file.type.startsWith('image/')) return;
  setUploadingLogo(true);
  try {
    const signRes = await fetch(
      `${import.meta.env.VITE_API_URL}/api/upload/sign?folder=orderup/menu-items&resource_type=image`
    );
    const { timestamp, signature, apiKey, cloudName, folder } = await signRes.json();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('api_key', apiKey);
    formData.append('folder', folder);
    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: formData }
    );
    const data = await uploadRes.json();
    if (data.secure_url) update('logo_url', data.secure_url);
    else throw new Error('No URL returned');
  } catch (err) {
    console.error('Logo upload failed:', err);
    alert('Logo upload failed. Please try again.');
  } finally {
    setUploadingLogo(false);
  }
};

//allows us to post on cloudinary 
const handleCertFile = async (file) => {
  if (!file) return;
  try {
    const signRes = await fetch(
      `${import.meta.env.VITE_API_URL}/api/upload/sign?folder=orderup/certificates&resource_type=auto`
    );
    if (!signRes.ok) throw new Error('Failed to get upload signature');
    const { timestamp, signature, apiKey, cloudName, folder, resource_type } = await signRes.json();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('api_key', apiKey);
    formData.append('folder', folder);
    formData.append('resource_type', resource_type);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      { method: 'POST', body: formData }
    );

    if (!uploadRes.ok) {
      const errBody = await uploadRes.json();
      console.error('Cloudinary error:', errBody);
      throw new Error(errBody?.error?.message || 'Cloudinary upload failed');
    }

    const data = await uploadRes.json();
    if (data.secure_url) {
      update('health_certificate_url', data.secure_url);
      update('health_cert_name', file.name);
    } else {
      throw new Error('No URL returned from Cloudinary');
    }
  } catch (err) {
    console.error('Certificate upload failed:', err);
    alert(`Certificate upload failed: ${err.message}`);
  }
};

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

  const raw = JSON.parse(localStorage.getItem('orderup_user') || '{}');
  const user = raw?.user ?? raw;
  if (!user?.id) { alert('Not logged in'); return; }

 

  setSubmitting(true);
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vendors/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile_id: user.id,
        name: form.stall_name,
        owner_name: form.owner_name,
        owner_email: form.owner_email,
        description: form.description,
        category: form.category ? [form.category] : [],
        location: form.location,
        operating_hours: {
          hours: serializeHours(structuredHours),
          structured: JSON.stringify(structuredHours),
        },
        sample_items: form.sample_items.join(', ') || null,
        health_certificate_url: form.health_certificate_url,
        banner_url: form.banner_url,
        logo_url: form.logo_url,
      }),
    });
    if (!res.ok) throw new Error('Failed to submit');
    onSubmitted();
  } catch (err) {
    console.error(err);
    onSubmitted(); // existing fallback
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

        {/* Stall Photo */}
<div style={sectionStyle}>
  <label style={labelStyle}>Stall Photo</label>
  <div
    onClick={() => !uploadingImage && document.getElementById('vendor-banner-input').click()}
    onDragOver={e => e.preventDefault()}
    onDrop={e => { e.preventDefault(); handleImageFile(e.dataTransfer.files[0]); }}
    style={{ width: '100%', height: '160px', borderRadius: '12px', border: form.banner_url ? 'none' : '2px dashed #E0E0E0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: uploadingImage ? 'wait' : 'pointer', overflow: 'hidden', position: 'relative', backgroundColor: form.image_url ? 'transparent' : '#FAFAFA' }}
  >
    {uploadingImage ? (
      <p style={{ fontSize: '0.8rem', color: '#888' }}>Uploading...</p>
    ) : form.banner_url ? (
      <>
        <img src={form.banner_url} alt="Stall" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>Click to change photo</span>
        </div>
      </>
    ) : (
      <>
        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#888', margin: '0 0 4px' }}>Upload stall photo</p>
        <p style={{ fontSize: '0.75rem', color: '#bbb', margin: 0 }}>Click to browse or drag & drop</p>
      </>
    )}
    <input id="vendor-banner-input" type="file" accept="image/*" style={{ display: 'none' }}
      onChange={e => handleImageFile(e.target.files[0])} />
  </div>
  {form.banner_url && (
    <button onClick={() => update('banner_url', null)}
      style={{ marginTop: '6px', fontSize: '0.72rem', color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
      Remove photo
    </button>
  )}
</div>

{/* Stall Logo */}
<div style={sectionStyle}>
  <label style={labelStyle}>Stall Logo <span style={{ fontSize: '0.65rem', color: '#aaa', fontWeight: 400 }}>(circular icon shown on card)</span></label>
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div
      onClick={() => !uploadingLogo && document.getElementById('vendor-logo-input').click()}
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); handleLogoFile(e.dataTransfer.files[0]); }}
      style={{ width: '80px', height: '80px', borderRadius: '50%', border: form.logo_url ? 'none' : '2px dashed #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: uploadingLogo ? 'wait' : 'pointer', overflow: 'hidden', flexShrink: 0, backgroundColor: form.logo_url ? 'transparent' : '#FAFAFA', boxShadow: form.logo_url ? '0 2px 8px rgba(0,0,0,0.15)' : 'none' }}
    >
      {uploadingLogo ? (
        <p style={{ fontSize: '0.65rem', color: '#888', textAlign: 'center', padding: '4px' }}>Uploading...</p>
      ) : form.logo_url ? (
        <img src={form.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <p style={{ fontSize: '0.65rem', color: '#bbb', textAlign: 'center', padding: '4px' }}>Click to upload</p>
      )}
      <input id="vendor-logo-input" type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => handleLogoFile(e.target.files[0])} />
    </div>
    <div>
      <p style={{ fontSize: '0.8rem', color: '#555', margin: '0 0 4px', fontWeight: 600 }}>
        {form.logo_url ? 'Click circle to change' : 'Click circle to upload'}
      </p>
      <p style={{ fontSize: '0.72rem', color: '#aaa', margin: 0 }}>Square images work best. Will be shown as a circle.</p>
      {form.logo_url && (
        <button onClick={() => update('logo_url', null)}
          style={{ marginTop: '6px', fontSize: '0.72rem', color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          Remove logo
        </button>
      )}
    </div>
  </div>
</div>

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
          {/* operating hours is more refined */}
          <label style={labelStyle}>Operating Hours</label>
          <div style={{ border: '1.5px solid #EBEBEB', borderRadius: '12px', overflow: 'hidden' }}>
            {DAYS.map((day, idx) => {
              const d = structuredHours[day];
              return (
                <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderBottom: idx < DAYS.length - 1 ? '1px solid #F0F0F0' : 'none', backgroundColor: 'white' }}>
                  <div onClick={() => toggleDay(day)}
                    style={{ width: '34px', height: '19px', borderRadius: '10px', position: 'relative', cursor: 'pointer', flexShrink: 0, backgroundColor: d.open ? '#C0474A' : '#E0E0E0', transition: 'background 0.2s' }}>
                    <div style={{ position: 'absolute', top: '2px', left: d.open ? '17px' : '2px', width: '15px', height: '15px', borderRadius: '50%', backgroundColor: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: d.open ? '#1a1a2e' : '#bbb', width: '32px', flexShrink: 0 }}>{day}</span>
                  {d.open ? (
                    <>
                      <select value={d.from} onChange={e => updateDayHours(day, 'from', e.target.value)}
                        style={{ padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #EBEBEB', fontSize: '0.8rem', outline: 'none', backgroundColor: 'white', cursor: 'pointer' }}>
                        {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <span style={{ fontSize: '0.75rem', color: '#aaa', flexShrink: 0 }}>to</span>
                      <select value={d.to} onChange={e => updateDayHours(day, 'to', e.target.value)}
                        style={{ padding: '8px 10px', borderRadius: '8px', border: `1.5px solid ${d.from >= d.to ? '#C0474A' : '#EBEBEB'}`, fontSize: '0.8rem', outline: 'none', backgroundColor: 'white', cursor: 'pointer' }}>
                        {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      {d.from >= d.to && <span style={{ fontSize: '0.65rem', color: '#C0474A', flexShrink: 0 }}>⚠ invalid</span>}
                    </>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: '#bbb', fontStyle: 'italic' }}>Closed</span>
                  )}
                </div>
              );
            })}
          </div>
          {serializeHours(structuredHours) !== 'Closed' && (
            <p style={{ fontSize: '0.7rem', color: '#888', marginTop: '8px' }}>
              Preview: <span style={{ color: '#444', fontWeight: 600 }}>{serializeHours(structuredHours)}</span>
            </p>
          )}
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
            if (file) {
            update('health_cert_name', file.name);
            handleCertFile(file);
            }
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
function VendorSuspendedScreen({ vendorName }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F5F2' }}>
      <header style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #E8726A 100%)`, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '36px', height: '36px', backgroundColor: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShoppingCart size={18} color={BRAND} strokeWidth={2.5} />
        </div>
        <span style={{ color: 'white', fontSize: '1.2rem', fontWeight: 800 }}>OrderUp</span>
      </header>

      <div style={{ padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#FFE8E8', border: `3px solid ${BRAND}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
          <XCircle size={36} color={BRAND} />
        </div>

        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a1a2e', margin: '0 0 8px', textAlign: 'center' }}>
          Account Suspended
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#666', textAlign: 'center', lineHeight: 1.6, marginBottom: '28px', maxWidth: '320px' }}>
          {vendorName ? `${vendorName}, your` : 'Your'} vendor account has been temporarily suspended by an administrator.
        </p>

        <div style={{ width: '100%', backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '16px', borderLeft: `4px solid ${BRAND}` }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 10px' }}>
            What this means:
          </p>
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.82rem', color: '#666', lineHeight: 2 }}>
            <li>Your store is hidden from students</li>
            <li>You cannot receive new orders</li>
            <li>Your menu and data are preserved</li>
          </ul>
        </div>

        <div style={{ width: '100%', backgroundColor: '#FFF8F0', border: '1.5px solid #FFE0C8', borderRadius: '14px', padding: '16px' }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#C26A1A', margin: '0 0 6px' }}>
            📩 To appeal this decision:
          </p>
          <p style={{ fontSize: '0.78rem', color: '#666', margin: 0, lineHeight: 1.6 }}>
            Contact our support team at{' '}
            <span style={{ color: BRAND, fontWeight: 600 }}>support@orderup.co.za</span>{' '}
            with your vendor name and account details.
          </p>
        </div>
      </div>
    </div>
  );
}


// ============ MAIN VENDOR DASHBOARD ============
export default function VendorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [activeFilter, setActiveFilter] = useState('All orders');
  const [orders, setOrders] = useState([]);
  const [vendorStatus, setVendorStatus] = useState('loading');
  const [vendorId, setVendorId] = useState(null);
  const [vendorDisplayName, setVendorDisplayName] = useState('');
  const [activeReport, setActiveReport] = useState('sales');
  // so here we passing the vendor menu 
  useEffect(() => {
    const raw = JSON.parse(localStorage.getItem('orderup_user') || '{}');
    const user = raw?.user ?? raw;
    if (!user?.id) {
      setVendorStatus('apply');
      return;
    }
    // we then check the state of the user 
    const checkStatus = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vendors/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: user.id }),
    });
    const data = await res.json();

    if (!data || data.type === 'none') {
      setVendorStatus('apply');
      return;
    }

    if (data.type === 'application') {
      // Has submitted an application but not yet approved
      setVendorStatus(data.status === 'rejected' ? 'apply' : 'pending');
      return;
    }

    // Has a vendor row
    setVendorId(data.id);
    setVendorDisplayName(data.name || '');
    if (data.status === 'suspended') setVendorStatus('suspended');
    else if (data.status === 'active') setVendorStatus('approved');
    else setVendorStatus('pending');

  } catch (err) {
    console.error('Could not check vendor status:', err);
    setVendorStatus('apply');
  }

};
    checkStatus();
  }, [])

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


// rating variables:
  const [ratingsData, setRatingsData] = useState({ averageRating: null, totalRatings: 0, distribution: {5:0,4:0,3:0,2:0,1:0} });
  const [recentReviews, setRecentReviews] = useState([]);


  //  below we setup the weekly revenue and orders
  const [analyticsData, setAnalyticsData] = useState({
    weeklyRevenue: [],
    weeklyOrders: [],
    topSellingItems: [],
  });
// below we setup the ranges used for the graphs and dropdown menu interactions
  const [selectedRange, setSelectedRange] = useState('week'); 

  useEffect(() => {
  if (!vendorId) return;

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/analytics/graph/${vendorId}?range=${encodeURIComponent(selectedRange)}`
      );

      const json = await res.json();
      const data = json.data || {};

      setAnalyticsData({
        weeklyRevenue: (data.revenue || []).map((r) => ({
          x: new Date(r.period).getTime(),
          y: Number(r.revenue),
        })),

        weeklyOrders: (data.orders || []).map((o) => ({
          x: new Date(o.period).getTime(),
          y: Number(o.orders),
        })),

        topSellingItems: (data.items || []).map((i) => ({
          name: i.name,
          weeklyOrders: Number(i.weeklyOrders),
          monthlyOrders: Number(i.monthlyOrders),
          weeklyRevenue: Number(i.weeklyRevenue),
          monthlyRevenue: Number(i.monthlyRevenue),
        })),
      });

    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    }
  };

  const fetchRatings = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/vendor/${vendorId}/ratings`);
      const data = await res.json();
      setRatingsData(data);
    } catch (err) {
      console.error('Failed to fetch ratings:', err);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/vendor/${vendorId}`);
      const data = await res.json();
      const reviews = (Array.isArray(data) ? data : [])
        .filter(o => o.rating && o.review)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map(o => ({
          name: o.customer_name || 'Anonymous',
          rating: o.rating,
          comment: o.review,
          date: new Date(o.created_at).toLocaleDateString('en-ZA'),
        }));
      setRecentReviews(reviews);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  fetchAnalytics();
  fetchRatings();
  fetchReviews();


}, [vendorId, selectedRange]);

const rangeLabelMap = {
  day: 'Today',
  week: 'This Week',
  month: 'This Month',
  '3 months': 'Last 3 Months',
  '6 months': 'Last 6 Months',
  year: 'This Year',
};

const currentRangeLabel = rangeLabelMap[selectedRange];




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
if (vendorStatus === 'suspended') {
  return <VendorSuspendedScreen vendorName={vendorDisplayName} />;
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
  // orders.forEach(order => {
  //   order.items.forEach(item => {
  //     const name = item.name;
  //     if (!itemSalesMap[name]) {
  //       itemSalesMap[name] = { name, quantity: 0, revenue: 0 };
  //     }
  //     itemSalesMap[name].quantity += 1;
  //     itemSalesMap[name].revenue += item.price;
  //   });
  // });
  orders.forEach(order => {
  (order.items || []).forEach(item => {
    const name = item.name;

    if (!itemSalesMap[name]) {
      itemSalesMap[name] = { name, quantity: 0, revenue: 0 };
    }

    itemSalesMap[name].quantity += 1;
    itemSalesMap[name].revenue += parseFloat(item.price);
  });
});
const topSellingItems = Object.values(itemSalesMap).sort((a, b) => b.quantity - a.quantity);
const weeklyRevenue = analyticsData.weeklyRevenue ?? [];
const weeklyOrders = analyticsData.weeklyOrders ?? [];

const getChartInterval = (range) => {
  switch (range) {
    case 'day':
      return 'hour';

    case 'week':
      return 'weekday';

    case 'month':
      return 'day';

    case '3 months':
      return 'week';

    case '6 months':
      return 'week';

    case 'year':
      return 'month';

    default:
      return 'day';
  }
};

  const revenueChart = weeklyRevenue.map(p => p.y);
  const orderChart = weeklyOrders.map(p => p.y);

  const interval = getChartInterval(selectedRange);

  const getLabelFormat = (range) => {
    switch (range) {
      case 'day':
        return {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        };

      case 'week':
        return { weekday: 'short' }; // Mon, Tue

      case 'month':
        return { day: 'numeric' }; // 1, 2, 3...

      case '3 months':
      case '6 months':
        return { month: 'short', day: 'numeric'};
      case 'year':
        return { month: 'short' }; // Jan, Feb, Mar

      default:
        return { month: 'short', day: 'numeric'};
    }
  };


  const labelFormat = getLabelFormat(selectedRange);

  const labels = weeklyRevenue.map(p =>
    new Date(p.x).toLocaleDateString(undefined, labelFormat)
  );

  const totalRevenueChart = revenueChart.reduce((a, b) => a + b, 0);
  const avgRevenueChart =
    revenueChart.length > 0
      ? totalRevenueChart / revenueChart.length
      : 0;

  const totalOrdersChart = orderChart.reduce((a, b) => a + b, 0);
  const peakOrdersChart =
    orderChart.length > 0
      ? Math.max(...orderChart)
      : 0;


  const getRangeMs = (range) => {
    const now = new Date().getTime();

    switch (range) {
      case 'day': return 24 * 60 * 60 * 1000;
      case 'week': return 7 * 24 * 60 * 60 * 1000;
      case 'month': return 30 * 24 * 60 * 60 * 1000;
      case '3 months': return 90 * 24 * 60 * 60 * 1000;
      case '6 months': return 180 * 24 * 60 * 60 * 1000;
      case 'year': return 365 * 24 * 60 * 60 * 1000;
      default: return 7 * 24 * 60 * 60 * 1000;
    }
  };

  const now = Date.now();
  const rangeMs = getRangeMs(selectedRange);

  const currentStart = now - rangeMs;
  const previousStart = now - (2 * rangeMs);
  const previousEnd = currentStart;

  const ordersCurrent = orders.filter(o => {
    const t = new Date(o.created_at).getTime();
    return t >= currentStart && t <= now;
  });

  const ordersPrevious = orders.filter(o => {
    const t = new Date(o.created_at).getTime();
    return t >= previousStart && t < previousEnd;
  });




  


  const revenueCurrent = ordersCurrent.reduce(
    (sum, o) => sum + Number(o.total_amount),
    0
  );

  const ordersCountCurrent = ordersCurrent.length;

  const revenuePrevious = ordersPrevious.reduce(
    (sum, o) => sum + Number(o.total_amount),
    0
  );

  const ordersCountPrevious = ordersPrevious.length;

  const revenueVsLast = ((revenueCurrent - revenuePrevious)/revenuePrevious)*100;
  const ordersVsLast = ((ordersCountCurrent - ordersCountPrevious)/ordersCountPrevious)*100;

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
  <div 
    onClick={() => navigate('/vendor-settings')}
    style={{ 
      width: '34px', 
      height: '34px', 
      borderRadius: '50%', 
      backgroundColor: 'rgba(255,255,255,0.2)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      cursor: 'pointer' 
    }}
  >
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
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                value={selectedRange}
                onChange={(e) => setSelectedRange(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E0E0E0',
                  fontSize: '0.7rem'
                }}
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="3 months">Last 3 Months</option>
                <option value="6 months">Last 6 Months</option>
                <option value="year">This Year</option>
              </select>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/analytics/${vendorId}/revenue/export/csv`);
                    if (!res.ok) throw new Error('Export failed');
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `revenue-report-${new Date().toISOString().slice(0, 10)}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                  } catch (err) {
                    alert('Could not export CSV. Please try again.');
                  }
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px', borderRadius: '8px',
                  backgroundColor: BRAND, color: 'white',
                  border: 'none', fontSize: '0.75rem', fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Download size={13} />
                Export Revenue CSV
              </button>
            </div>
          </div>


          {/* ── Sales view (existing KPIs + charts) — only show when activeReport === 'sales' ── */}
          {activeReport === 'sales' && (<>

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <div style={cardStyle}>
              <div style={cardHeader}><DollarSign size={16} color={BRAND} /></div>
              <p style={labelStyle}>Total Revenue</p>
              <h3 style={valueStyle}>R {parseFloat(totalRevenue).toFixed(2)}</h3>
            </div>
            <div style={cardStyle}>
              <div style={cardHeader}><TrendingUp size={16} color="#C26A1A" />
              <span style={{ fontSize: '0.65rem', color: BRAND }}>  Previous period: R {revenuePrevious.toFixed(2)}</span></div>
              <p style={labelStyle}>
                Revenue ({currentRangeLabel})
              </p>

              <h3 style={valueStyle}>
                R {revenueCurrent.toFixed(2)}
              </h3>
            </div>
            <div style={cardStyle}>
              <div style={cardHeader}>
                <ShoppingCart size={16} color="#2A6DB5" />
                <span style={{ fontSize: '0.65rem', color: BRAND }}>  Previous period: {ordersCountPrevious}</span>
              </div>
                

              <p style={labelStyle}>
                Orders ({currentRangeLabel})
              </p>

              <h3 style={valueStyle}>
                {ordersCountCurrent}
              </h3>
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
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>📈Revenue Trend ({currentRangeLabel})</h3>
              <span style={{ fontSize: '0.7rem', color: '#2A7D2A' }}> {revenueVsLast.toFixed(2)}% vs last period</span>
            </div>
            <SimpleBarChart data={revenueChart} labels={labels} color={BRAND} height={140} />            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <span style={{ fontSize: '0.65rem', color: '#888' }}>
                Total: R {totalRevenueChart.toLocaleString()}
              </span>

              <span style={{ fontSize: '0.65rem', color: '#888' }}>
                Avg: R {avgRevenueChart.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Orders Chart */}
          <div style={{ ...cardStyle, marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>📊 Order Trend ({currentRangeLabel})</h3>
              <span style={{ fontSize: '0.7rem', color: '#2A7D2A' }}> {ordersVsLast.toFixed(2)}% vs last period</span>
            </div> 
            <SimpleBarChart data={orderChart} labels={labels} color={'#7B4FBF'} height={140} />            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <span style={{ fontSize: '0.65rem', color: '#888' }}>
                Total: {totalOrdersChart} orders
              </span>

              <span style={{ fontSize: '0.65rem', color: '#888' }}>
                Peak: {peakOrdersChart} orders
              </span>
            </div>
          </div>

          {/* Popular Times */}
          <div style={{ ...cardStyle, marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color={BRAND} />
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>Popular Times</h3>
              </div>
              <button
                onClick={() => {
                  const hourCounts = {};
                  orders.forEach(o => {
                    const hour = new Date(o.created_at).getHours();
                    const label = `${hour % 12 || 12}${hour < 12 ? 'am' : 'pm'} - ${(hour + 1) % 12 || 12}${(hour + 1) < 12 ? 'am' : 'pm'}`;
                    hourCounts[label] = (hourCounts[label] || 0) + 1;
                  });
                  const rows = Object.entries(hourCounts)
                    .map(([hour, count]) => ({ hour, orders: count }))
                    .sort((a, b) => b.orders - a.orders);
                  const csv = ['Hour,Orders', ...rows.map(r => `${r.hour},${r.orders}`)].join('\n');
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
                  a.download = `peak-hours-${new Date().toISOString().slice(0, 10)}.csv`;
                  a.click();
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '8px', backgroundColor: BRAND, color: 'white', border: 'none', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
              >
                <Download size={12} /> Export CSV
              </button>
            </div>
            {(() => {
              const hourCounts = {};
              orders.forEach(o => {
                const date = new Date(o.created_at);
                const hour = date.getHours();
                const label = `${hour % 12 || 12}${hour < 12 ? 'am' : 'pm'} - ${(hour + 1) % 12 || 12}${(hour + 1) < 12 ? 'am' : 'pm'}`;
                hourCounts[label] = (hourCounts[label] || 0) + 1;
              });
              const sorted = Object.entries(hourCounts)
                .map(([hour, count]) => ({ hour, orders: count }))
                .sort((a, b) => b.orders - a.orders);
              const peak = sorted[0];
              const max = peak?.orders || 1;
              return (
                <>
                  {peak && (
                    <div style={{ backgroundColor: '#FFF0F0', borderRadius: '10px', padding: '10px', marginBottom: '12px' }}>
                      <p style={{ fontSize: '0.65rem', color: BRAND, margin: '0 0 2px' }}>🔴 Peak Hour ({peak.hour})</p>
                      <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>{peak.orders} orders</p>
                    </div>
                  )}
                  {sorted.slice(0, 6).map(time => (
                    <div key={time.hour} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.7rem', width: '100px' }}>{time.hour}</span>
                      <div style={{ flex: 1, height: '4px', backgroundColor: '#F0F0F0', borderRadius: '2px' }}>
                        <div style={{ width: `${(time.orders / max) * 100}%`, height: '100%', backgroundColor: time.orders === max ? BRAND : '#E8726A', borderRadius: '2px' }} />
                      </div>
                      <span style={{ fontSize: '0.65rem', color: '#666' }}>{time.orders} orders</span>
                    </div>
                  ))}
                  {sorted.length === 0 && <p style={{ color: '#aaa', fontSize: '0.8rem', textAlign: 'center', padding: '20px 0' }}>No order data yet</p>}
                </>
              );
            })()}
          </div>

          {/* Revenue Calculator */}
          <div style={{ marginBottom: '20px' }}>
            <RevenueCalculator vendorId={vendorId}/>
          </div>

          {/* Customer Reviews */}
          <div style={{ ...cardStyle, marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={16} color={BRAND} />
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>Customer Reviews</h3>
              </div>
              {ratingsData.averageRating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Star size={14} fill="#FFB800" color="#FFB800" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a1a2e' }}>{ratingsData.averageRating}</span>
                  <span style={{ fontSize: '0.7rem', color: '#888' }}>({ratingsData.totalRatings} reviews)</span>
                </div>
              )}
            </div>

            {/* Star distribution */}
            {ratingsData.totalRatings > 0 && (
              <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#F9F9F9', borderRadius: '10px' }}>
                {[5,4,3,2,1].map(star => (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.65rem', color: '#888', width: '8px' }}>{star}</span>
                    <Star size={10} fill="#FFB800" color="#FFB800" />
                    <div style={{ flex: 1, height: '6px', backgroundColor: '#E0E0E0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${ratingsData.totalRatings > 0 ? (ratingsData.distribution[star] / ratingsData.totalRatings) * 100 : 0}%`, height: '100%', backgroundColor: BRAND, borderRadius: '3px' }} />
                    </div>
                    <span style={{ fontSize: '0.65rem', color: '#888', width: '16px' }}>{ratingsData.distribution[star]}</span>
                  </div>
                ))}
              </div>
            )}

            {recentReviews.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#aaa', fontSize: '0.8rem', padding: '20px 0' }}>No reviews yet</p>
            ) : (
              recentReviews.map((review, idx) => (
                <div key={idx} style={{ borderBottom: idx !== recentReviews.length - 1 ? '1px solid #F0F0F0' : 'none', paddingBottom: idx !== recentReviews.length - 1 ? '12px' : 0, marginBottom: idx !== recentReviews.length - 1 ? '12px' : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{review.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
                        {[...Array(5)].map((_, i) => (<Star key={i} size={10} fill={i < review.rating ? '#FFB800' : 'none'} color={i < review.rating ? '#FFB800' : '#DDD'} />))}
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.7rem', color: '#666', lineHeight: 1.4, margin: '6px 0 0' }}>{review.comment}</p>
                  <p style={{ fontSize: '0.6rem', color: '#999', marginTop: '4px' }}>{review.date}</p>
                </div>
              ))
            )}
          </div>

          {/* Top Selling Items */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Top Selling Items</h2>
              <button
                onClick={() => {
                  const csv = ['Rank,Item,Quantity Sold,Revenue', ...topSellingItems.map((item, i) => `${i + 1},${item.name},${item.quantity},${item.revenue}`)].join('\n');
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
                  a.download = `top-items-${new Date().toISOString().slice(0, 10)}.csv`;
                  a.click();
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '8px', backgroundColor: BRAND, color: 'white', border: 'none', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
              >
                <Download size={12} /> Export CSV
              </button>
            </div>
          
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
          </div>l
          </>)}
        </section>
      )}
    </div>
  );
}
