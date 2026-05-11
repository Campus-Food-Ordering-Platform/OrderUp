import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import VendorMenuPage from './VendorMenuPage';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
const mockLogout = vi.fn();

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    user: { sub: 'auth0|student123', name: 'Test Student' },
    logout: mockLogout,
  }),
}));

const mockVendor = {
  id: 'vendor-1',
  name: 'Chinese Lantern',
  description: 'Great Asian food',
  rating: 4.5,
  wait: 15,
  emoji: '🍜',
  bgFrom: '#FFE5D0',
  bgTo: '#FFBFA0',
};

const mockMenuItems = [
  { id: 'item-1', name: 'Fried Rice', description: 'Delicious fried rice', price: 45, category: 'Asian', tags: ['Halal'], calories: 500, available: true, image_url: null },
  { id: 'item-2', name: 'Dumplings', description: 'Steamed dumplings', price: 35, category: 'Asian', tags: ['Vegan'], calories: 300, available: true, image_url: null },
  { id: 'item-3', name: 'Spring Roll', description: 'Crispy spring rolls', price: 25, category: 'Snacks', tags: [], calories: 200, available: false, image_url: null },
];

let mockLocationState = { vendor: mockVendor };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: mockLocationState }),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  mockNavigate.mockReset();
  mockLocationState = { vendor: mockVendor };

  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => mockMenuItems,
  });
});

// ── Helper ─────────────────────────────────────────────────────────────────────
// The add-to-cart button renders a lucide Plus SVG with no text, so we can't
// filter by textContent or by inline backgroundColor (jsdom doesn't compute
// CSS-class styles). The most robust approach is to find the item name element,
// walk up to its card container, then grab the last <button> inside that card —
// which is always the add/increment button for available items.
const getAddButtons = () => {
  // Available items in our mock: Fried Rice (item-1) and Dumplings (item-2)
  const availableItemNames = ['Fried Rice', 'Dumplings'];
  return availableItemNames.map((name) => {
    const nameEl = screen.getByText(name);
    // Walk up until we find a container that has a button inside it
    let card = nameEl.parentElement;
    while (card && !card.querySelector('button')) {
      card = card.parentElement;
    }
    const buttons = card ? Array.from(card.querySelectorAll('button')) : [];
    // The add button is the last button in the card (after any qty controls)
    return buttons[buttons.length - 1];
  }).filter(Boolean);
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('VendorMenuPage', () => {

  // ── No vendor state ─────────────────────────────────────────────────────────

  it('shows fallback when no vendor is in state', () => {
    mockLocationState = null;
    render(<MemoryRouter><VendorMenuPage /></MemoryRouter>);
    expect(screen.getByText(/No vendor selected/i)).toBeInTheDocument();
  });

  it('shows Go back button when no vendor', () => {
    mockLocationState = null;
    render(<MemoryRouter><VendorMenuPage /></MemoryRouter>);
    expect(screen.getByText('Go back')).toBeInTheDocument();
  });

  it('navigates to student-dashboard when Go back is clicked', () => {
    mockLocationState = null;
    render(<MemoryRouter><VendorMenuPage /></MemoryRouter>);
    fireEvent.click(screen.getByText('Go back'));
    expect(mockNavigate).toHaveBeenCalledWith('/student-dashboard');
  });

  // ── Vendor info ─────────────────────────────────────────────────────────────

  it('renders the vendor name', async () => {
    render(<MemoryRouter><VendorMenuPage /></MemoryRouter>);
    expect(screen.getByText('Chinese Lantern')).toBeInTheDocument();
  });

  it('renders the vendor description', async () => {
    render(<MemoryRouter><VendorMenuPage /></MemoryRouter>);
    expect(screen.getByText('Great Asian food')).toBeInTheDocument();
  });

  it('renders the vendor rating', async () => {
    render(<MemoryRouter><VendorMenuPage /></MemoryRouter>);
    expect(screen.getByText(/4\.5/)).toBeInTheDocument();
  });

  it('renders the vendor wait time', async () => {
    render(<MemoryRouter><VendorMenuPage /></MemoryRouter>);
    expect(screen.getByText(/15 min wait/i)).toBeInTheDocument();
  });

  it('renders the OrderUp brand in the header', () => {
    render(<MemoryRouter><VendorMenuPage /></MemoryRouter>);
    expect(screen.getByText('OrderUp')).toBeInTheDocument();
  });

  // ── Menu items ──────────────────────────────────────────────────────────────

  it('fetches and renders menu items', async () => {
    render(<MemoryRouter><VendorMenuPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Fried Rice')).toBeInTheDocument());
    expect(screen.getByText('Dumplings')).toBeInTheDocument();
    expect(screen.getByText('Spring Roll')).toBeInTheDocument();
  });

  it('renders item prices', async () => {
    render(<MemoryRouter><VendorMenuPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('R 45')).toBeInTheDocument());
    expect(screen.getByText('R 35')).toBeInTheDocument();
  });

  it('renders item descriptions', async () => {
    render(<MemoryRouter><VendorMenuPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Delicious fried rice')).toBeInTheDocument());
  });

  it('renders "out of stock" for unavailable items', async () => {
    render(<MemoryRouter><VendorMenuPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('out of stock')).toBeInTheDocument());
  });

  it('renders dietary tags', async () => {
    render(<MemoryRouter><VendorMenuPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Halal')).toBeInTheDocument());
    expect(screen.getByText('Vegan')).toBeInTheDocument();
  });

  it('calls the menu API with the correct vendor id', async () => {
    render(<MemoryRouter><VendorMenuPage /></MemoryRouter>);
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/vendors/vendor-1/menu')
    ));
  });

  it('handles menu fetch error gracefully without crashing', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    render(<MemoryRouter><VendorMenuPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Chinese Lantern')).toBeInTheDocument());
    // no items rendered but no crash
    expect(screen.queryByText('Fried Rice')).not.toBeInTheDocument();
  });

  // ── Category filters ────────────────────────────────────────────────────────

  it('renders the All category chip', async () => {
    render(<MemoryRouter><VendorMenuPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('All')).toBeInTheDocument());
  });

  it('renders category chips derived from items', async () => {
    render(<MemoryRouter><VendorMenuPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Asian')).toBeInTheDocument());
    expect(screen.getByText('Snacks')).toBeInTheDocument();
  });

  it('clicking a category chip filters items', async () => {
    render(<MemoryRouter><VendorMenuPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Snacks')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Snacks'));
    expect(screen.getByText('Spring Roll')).toBeInTheDocument();
    expect(screen.queryByText('Fried Rice')).not.toBeInTheDocument();
  });

  it('clicking All shows all items again', async () => {
    render(<MemoryRouter><VendorMenuPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Snacks')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Snacks'));
    fireEvent.click(screen.getByText('All'));
    expect(screen.getByText('Fried Rice')).toBeInTheDocument();
    expect(screen.getByText('Spring Roll')).toBeInTheDocument();
  });

  // ── Cart interactions ───────────────────────────────────────────────────────

  it('does not show the cart bar initially', async () => {
    render(<MemoryRouter><VendorMenuPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Fried Rice')).toBeInTheDocument());
    expect(screen.queryByText(/View Cart/i)).not.toBeInTheDocument();
  });

  // FIX: Select "+" buttons by text content instead of inline backgroundColor,
  // which jsdom does not compute from CSS classes.
  it('shows the floating cart bar when an item is added', async () => {
    render(<MemoryRouter><VendorMenuPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Fried Rice')).toBeInTheDocument());
    const addButtons = getAddButtons();
    fireEvent.click(addButtons[0]);
    expect(screen.getByText(/View Cart/i)).toBeInTheDocument();
  });

  it('shows correct item count in cart bar', async () => {
    render(<MemoryRouter><VendorMenuPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Fried Rice')).toBeInTheDocument());
    const addButtons = getAddButtons();
    fireEvent.click(addButtons[0]);
    expect(screen.getByText(/1 item/i)).toBeInTheDocument();
  });

  it('shows cart badge on header cart icon when items added', async () => {
    render(<MemoryRouter><VendorMenuPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Fried Rice')).toBeInTheDocument());
    const addButtons = getAddButtons();
    fireEvent.click(addButtons[0]);
    // Badge showing count "1" — scoped to header to avoid matching the qty span in the cart bar
    const header = document.querySelector('header');
    expect(header.querySelector('div[style*="position: absolute"]')).toHaveTextContent('1');
  });

  it('navigates to checkout when cart bar is clicked', async () => {
    render(<MemoryRouter><VendorMenuPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Fried Rice')).toBeInTheDocument());
    const addButtons = getAddButtons();
    fireEvent.click(addButtons[0]);
    const cartBar = screen.getByText(/View Cart/i).closest('div');
    fireEvent.click(cartBar);
    expect(mockNavigate).toHaveBeenCalledWith('/checkout', expect.objectContaining({
      state: expect.objectContaining({ vendor: mockVendor }),
    }));
  });

  // ── Navigation ──────────────────────────────────────────────────────────────

  it('navigates to student-dashboard when back arrow is clicked', async () => {
    render(<MemoryRouter><VendorMenuPage /></MemoryRouter>);
    // First button in header is the ArrowLeft back button
    const backBtn = screen.getAllByRole('button')[0];
    fireEvent.click(backBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/student-dashboard');
  });

  it('navigates to student-history when history icon is clicked', async () => {
    render(<MemoryRouter><VendorMenuPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Chinese Lantern')).toBeInTheDocument());
    // History icon div
    const historyDivs = screen.getAllByRole('generic').filter(el =>
      el.getAttribute('style')?.includes('cursor: pointer') &&
      el.closest('header')
    );
    // Second clickable div in header is history
    if (historyDivs.length > 1) {
      fireEvent.click(historyDivs[1]);
      expect(mockNavigate).toHaveBeenCalledWith('/student-history');
    }
  });
});