import { useState } from 'react';
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

const orderFilters = ['All orders', 'Confirmed', 'Preparing', 'Ready'];

// ============ MOCK ORDERS DATA ============
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
  Preparing: { bg: '#F0E8FF', color: '#7B4FBF', action: 'Mark Ready', next: 'Ready', btnBg: 'linear-gradient(135deg, #2A7D2A 0%, #4CAF50 100%)', btnColor: 'white' },
  Ready: { bg: '#E8F8E8', color: '#2A7D2A', action: 'Mark as Collected', next: 'Collected', btnBg: 'linear-gradient(135deg, #C0474A 0%, #E8726A 100%)', btnColor: 'white' },
  Collected: { bg: '#F0F0F0', color: '#888', action: null, next: null, btnBg: null, btnColor: null },
};

// ============ ORDER CARD COMPONENT ============
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

      <p style={{ fontSize: '0.78rem', color: '#888', marginBottom: '12px' }}>
        {order.customer}
      </p>

      <div style={{ borderTop: '1px solid #F5F5F5', paddingTop: '12px', marginBottom: '10px' }}>
        <p style={{ fontSize: '0.72rem', color: '#aaa', marginBottom: '6px' }}>Items:</p>
        {order.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.82rem', color: '#444' }}>{item.name}</span>
            <span style={{ fontSize: '0.82rem', color: '#444' }}>R {item.price}.00</span>
          </div>
        ))}
        {order.note && (
          <p style={{ fontSize: '0.78rem', color: BRAND, marginTop: '8px', fontStyle: 'italic' }}>
            Customer Notes: {order.note}
          </p>
        )}
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

// ============ MENU MANAGER DATA ============
const ALLERGENS = ['Halal', 'Vegan', 'Vegetarian', 'Nut-free', 'Gluten-free', 'Dairy-free', 'Egg-free'];
const CATEGORIES_DEFAULT = ['Mains', 'Sides', 'Drinks', 'Starters', 'Extras'];

const initialMenuItems = [
  { id: 1, name: 'Classic Kota', description: 'Quarter loaf with chips, polony and sauce.', price: 25, category: 'Mains', tags: ['Nut-free'], available: true, emoji: '🍔' },
  { id: 2, name: 'Chicken Burger', description: 'Crispy chicken fillet with lettuce and mayo.', price: 45, category: 'Mains', tags: ['Halal', 'Nut-free'], available: true, emoji: '🍗' },
  { id: 3, name: 'Mini Chips', description: 'Small portion of salted chips.', price: 15, category: 'Sides', tags: ['Vegan', 'Nut-free'], available: true, emoji: '🍟' },
];

const tagColors = {
  Halal: { bg: '#E0F7EF', color: '#2A9D6A' },
  Vegan: { bg: '#E8F8E8', color: '#2A7D2A' },
  Vegetarian: { bg: '#F0FFF0', color: '#3A8A3A' },
  'Nut-free': { bg: '#FFF8E1', color: '#B8860B' },
  'Gluten-free': { bg: '#F3E8FF', color: '#7B4FBF' },
  'Dairy-free': { bg: '#E8F4FD', color: '#2A6DB5' },
  'Egg-free': { bg: '#FFF0F0', color: '#C0474A' },
};

// ============ MENU MANAGER COMPONENT ============
function MenuManager() {
  const [items, setItems] = useState(initialMenuItems);
  const [categories, setCategories] = useState(CATEGORIES_DEFAULT);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showCatInput, setShowCatInput] = useState(false);
  const [newCat, setNewCat] = useState('');

  const emptyForm = { name: '', description: '', price: '', category: categories[0], tags: [], available: true, emoji: '🍽️' };
  const [form, setForm] = useState(emptyForm);

  const filteredItems = activeCategory === 'All'
    ? items
    : items.filter(i => i.category === activeCategory);

  const toggleTag = (tag) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }));
  };

  const handleSave = () => {
    if (!form.name || !form.price) return;
    if (editingItem !== null) {
      setItems(prev => prev.map(i => i.id === editingItem ? { ...form, id: editingItem, price: Number(form.price) } : i));
    } else {
      setItems(prev => [...prev, { ...form, id: Date.now(), price: Number(form.price) }]);
    }
    setForm(emptyForm);
    setEditingItem(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setForm({ ...item, price: String(item.price) });
    setEditingItem(item.id);
    setShowForm(true);
  };

  const handleDelete = (id) => setItems(prev => prev.filter(i => i.id !== id));
  const toggleAvailable = (id) => setItems(prev => prev.map(i => i.id === id ? { ...i, available: !i.available } : i));

  const handleAddCategory = () => {
    if (newCat.trim() && !categories.includes(newCat.trim())) {
      setCategories(prev => [...prev, newCat.trim()]);
    }
    setNewCat('');
    setShowCatInput(false);
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
          <button onClick={() => setShowCatInput(true)} style={{ background: 'none', border: `1.5px solid ${BRAND}`, color: BRAND, borderRadius: '2rem', padding: '4px 12px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>
            + Add Category
          </button>
        </div>

        {showCatInput && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Category name..." style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #EBEBEB', fontSize: '0.85rem', outline: 'none' }} />
            <button onClick={handleAddCategory} style={{ backgroundColor: BRAND, color: 'white', border: 'none', borderRadius: '10px', padding: '8px 16px', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}>Add</button>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['All', ...categories].map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: '5px 16px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', border: activeCategory === cat ? 'none' : '1.5px solid #E0E0E0', backgroundColor: activeCategory === cat ? BRAND : 'white', color: activeCategory === cat ? 'white' : '#666' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', marginBottom: '16px', border: `1.5px solid ${BRAND}` }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 14px' }}>{editingItem ? 'Edit Item' : 'New Menu Item'}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file && file.type.startsWith('image/')) { const reader = new FileReader(); reader.onload = (ev) => setForm(p => ({ ...p, image: ev.target.result })); reader.readAsDataURL(file); } }} style={{ width: '100%', height: '160px', borderRadius: '12px', border: '2px dashed #E0E0E0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: form.image ? 'transparent' : '#FAFAFA', overflow: 'hidden', position: 'relative' }} onClick={() => document.getElementById('food-img-input').click()}>
              {form.image ? (
                <>
                  <img src={form.image} alt="Food preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>Click to change image</span>
                  </div>
                </>
              ) : (
                <>
                  <span style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🍽️</span>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#888', margin: '0 0 4px' }}>Upload image of food item</p>
                  <p style={{ fontSize: '0.75rem', color: '#bbb', margin: 0 }}>Click to browse or drag & drop</p>
                </>
              )}
              <input id="food-img-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = (ev) => setForm(p => ({ ...p, image: ev.target.result })); reader.readAsDataURL(file); } }} />
            </div>

            <input placeholder="Item name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #EBEBEB', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }} />
            <textarea placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #EBEBEB', fontSize: '0.85rem', resize: 'none', outline: 'none', fontFamily: 'inherit' }} />

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem', color: '#888' }}>R</span>
                <input placeholder="Price *" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} type="number" style={{ width: '100%', padding: '10px 14px 10px 28px', borderRadius: '10px', border: '1.5px solid #EBEBEB', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #EBEBEB', fontSize: '0.85rem', outline: 'none', backgroundColor: 'white' }}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#555', margin: '0 0 6px' }}>Dietary & Allergen Info</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {ALLERGENS.map(tag => {
                  const selected = form.tags.includes(tag);
                  return (
                    <button key={tag} onClick={() => toggleTag(tag)} style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', border: 'none', backgroundColor: selected ? (tagColors[tag]?.bg || '#eee') : '#F5F5F5', color: selected ? (tagColors[tag]?.color || '#444') : '#999', outline: selected ? `1.5px solid ${tagColors[tag]?.color || '#ccc'}` : '1.5px solid transparent' }}>
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
          <article key={item.id} style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: item.available ? '1.5px solid transparent' : '1.5px solid #E0E0E0', opacity: item.available ? 1 : 0.6 }}>
            <div style={{ height: '80px', background: 'linear-gradient(135deg, #FFF3CD, #FFE08A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>{item.emoji}</div>
            <div style={{ padding: '10px 12px' }}>
              <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 2px' }}>{item.name}</h3>
              <p style={{ fontSize: '0.72rem', color: '#888', margin: '0 0 6px', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</p>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
                {item.tags.map(tag => (<span key={tag} style={{ backgroundColor: tagColors[tag]?.bg || '#F0F0F0', color: tagColors[tag]?.color || '#666', fontSize: '0.62rem', fontWeight: 600, padding: '2px 8px', borderRadius: '20px' }}>{tag}</span>))}
              </div>
              <p style={{ fontSize: '0.88rem', fontWeight: 700, color: BRAND, margin: '0 0 10px' }}>R {item.price}.00</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <div onClick={() => toggleAvailable(item.id)} style={{ width: '36px', height: '20px', borderRadius: '10px', position: 'relative', cursor: 'pointer', backgroundColor: item.available ? BRAND : '#E0E0E0', transition: 'background 0.2s' }}>
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
      {filteredItems.length === 0 && (<div style={{ textAlign: 'center', padding: '3rem', color: '#aaa', fontSize: '0.9rem' }}><UtensilsCrossed size={40} color="#ddd" style={{ marginBottom: '12px' }} /><p>No items in this category yet.</p></div>)}
    </div>
  );
}

// ============ ANALYTICS COMPONENTS ============

// Simple Bar Chart Component
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

// Profit Calculator Component
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
            {filteredItems.map(item => (<div key={item.id} onClick={() => handleSelectItem(item)} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.8rem', borderBottom: '1px solid #F0F0F0' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F5F5'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>{item.name} - R{item.basePrice}</div>))}
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

// ============ MAIN VENDOR DASHBOARD ============
export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const [activeFilter, setActiveFilter] = useState('All orders');
  const [orders, setOrders] = useState(mockOrders);

  const handleUpdateStatus = (orderId, newStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
  };

  const filteredOrders = activeFilter === 'All orders'
    ? orders.filter((o) => o.status !== 'Collected')
    : orders.filter((o) => o.status === activeFilter);

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const completedOrders = orders.filter(o => o.status === 'Collected').length;
  const avgOrderValue = totalOrders ? (totalRevenue / totalOrders).toFixed(2) : 0;
  const totalCustomers = new Set(orders.map(order => order.customer)).size;

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

  // Analytics data
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
    { name: 'Karel D\'Costa', rating: 4, comment: 'Good quality and fast delivery. Chicken burger was tasty but could be bigger.', source: 'Zomato', date: '5 days ago' },
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
        <h1 style={{ color: 'white', fontSize: '1.3rem', fontWeight: 800, marginBottom: '4px' }}>Jimmy's Dashboard</h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem' }}>{orders.filter(o => o.status !== 'Collected').length} active orders today</p>
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
          {/* Header */}
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
              <div style={cardHeader}><DollarSign size={16} color={BRAND} /><span style={{ fontSize: '0.65rem', color: '#2A7D2A' }}>+8%</span></div>
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
              <span style={{ fontSize: '0.65rem', color: '#888' }}>Total: R {weeklyRevenue.reduce((a,b) => a+b, 0).toLocaleString()}</span>
              <span style={{ fontSize: '0.65rem', color: '#888' }}>Avg: R {(weeklyRevenue.reduce((a,b) => a+b, 0) / 7).toFixed(0)}</span>
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
              <span style={{ fontSize: '0.65rem', color: '#888' }}>Total: {weeklyOrders.reduce((a,b) => a+b, 0)} orders</span>
              <span style={{ fontSize: '0.65rem', color: '#888' }}>Peak: {Math.max(...weeklyOrders)} orders (Fri)</span>
            </div>
          </div>

          {/* Liked Dishes & Popular Times */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            {/* Liked Dishes */}
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

            {/* Popular Times */}
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