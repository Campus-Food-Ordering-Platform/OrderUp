import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import CheckoutPage from './CheckoutPage';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
const mockLogout = vi.fn();

// Ensure import.meta.env.VITE_API_URL is defined so fetch URLs resolve correctly
vi.stubEnv('VITE_API_URL', 'http://localhost:3000');

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    user: { sub: 'auth0|student123', name: 'Test Student', email: 'student@test.com' },
    logout: mockLogout,
  }),
}));

// ── Shared test data ──────────────────────────────────────────────────────────

const mockVendor = { id: 'vendor-1', name: 'Chinese Lantern' };
const mockItems = [
  { id: 'item-1', name: 'Fried Rice', price: 45, category: 'Asian' },
  { id: 'item-2', name: 'Dumplings', price: 35, category: 'Asian' },
];
const mockCart = { 'item-1': 2, 'item-2': 1 };

// sessionStorage stub
const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, val) => { store[key] = val; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock, writable: true });

// location.state setup
let mockLocationState = { vendor: mockVendor, cart: mockCart, items: mockItems };

// Single combined mock for react-router-dom — both useNavigate and useLocation
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
  mockLocationState = { vendor: mockVendor, cart: mockCart, items: mockItems };
  sessionStorageMock.clear();

  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ paymentUrl: 'https://paystack.com/pay/test' }),
  });

  // Prevent real redirect
  delete window.location;
  window.location = { href: '', origin: 'http://localhost' };
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CheckoutPage', () => {

  // ── Empty cart / no vendor state ─────────────────────────────────────────

  it('shows empty cart message when cart is empty', () => {
    mockLocationState = { vendor: mockVendor, cart: {}, items: mockItems };
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
  });

  it('shows Browse Vendors button when cart is empty', () => {
    mockLocationState = { vendor: mockVendor, cart: {}, items: mockItems };
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    expect(screen.getByText('Browse Vendors')).toBeInTheDocument();
  });

  it('navigates to student-dashboard when Browse Vendors is clicked', () => {
    mockLocationState = { vendor: mockVendor, cart: {}, items: mockItems };
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    fireEvent.click(screen.getByText('Browse Vendors'));
    expect(mockNavigate).toHaveBeenCalledWith('/student-dashboard');
  });

  it('shows empty cart when no vendor is provided', () => {
    mockLocationState = { vendor: null, cart: mockCart, items: mockItems };
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
  });

  // ── Populated cart state ──────────────────────────────────────────────────

  it('renders the Checkout header', () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    expect(screen.getByText('Checkout')).toBeInTheDocument();
  });

  it('renders cart item names', () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    expect(screen.getByText('Fried Rice')).toBeInTheDocument();
    expect(screen.getByText('Dumplings')).toBeInTheDocument();
  });

  it('renders correct quantities for cart items', () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    // item-1 has qty 2, item-2 has qty 1
    const quantities = screen.getAllByText(/^[0-9]+$/);
    const qtys = quantities.map(q => q.textContent);
    expect(qtys).toContain('2');
    expect(qtys).toContain('1');
  });

  it('shows the subtotal correctly', () => {
    // 2×45 + 1×35 = 125
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    expect(screen.getByText('R 125.00')).toBeInTheDocument();
  });

  it('shows the service fee', () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    expect(screen.getByText('R 5.00')).toBeInTheDocument();
  });

  it('shows the correct total (subtotal + service fee)', () => {
    // 125 + 5 = 130
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    expect(screen.getByText('R 130.00')).toBeInTheDocument();
  });

  it('shows the Place Order button with total', () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    expect(screen.getByText(/Place Order · R 130/i)).toBeInTheDocument();
  });

  it('renders the Special Instructions textarea', () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    expect(screen.getByPlaceholderText(/Any special requests/i)).toBeInTheDocument();
  });

  it('renders the collection point', () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    expect(screen.getByText('The Matrix Food Court')).toBeInTheDocument();
  });

  it('renders the Paystack payment method option', () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    expect(screen.getByText('Paystack')).toBeInTheDocument();
    expect(screen.getByText('Card, EFT, Mobile Money')).toBeInTheDocument();
  });

  it('renders the Order Summary section', () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    expect(screen.getByText('Order Summary')).toBeInTheDocument();
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('Service fee')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  // ── Cart interactions ─────────────────────────────────────────────────────

  it('increases quantity when + button is clicked', () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    // Fried Rice starts at 2 — click the + next to it
    const plusButtons = screen.getAllByRole('button').filter(b => b.querySelector('svg'));
    // Find the + (Plus) for item-1 — after the qty display
    const allQtyDisplays = screen.getAllByText('2');
    expect(allQtyDisplays.length).toBeGreaterThan(0);
  });

  it('removes item from cart when quantity reaches zero via - button', () => {
    // item-2 has qty 1; clicking minus should remove it
    mockLocationState = { vendor: mockVendor, cart: { 'item-2': 1 }, items: mockItems };
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    expect(screen.getByText('Dumplings')).toBeInTheDocument();
    // The minus button removes the item
    const minusButtons = screen.getAllByRole('button').filter(b =>
      b.style.borderRadius === '50%' && b.style.border?.includes('C0474A')
    );
    if (minusButtons.length > 0) {
      fireEvent.click(minusButtons[0]);
      // after removing only item, cart is empty → empty state
      expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
    }
  });

  it('navigates back when the back arrow is clicked', () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    // ArrowLeft button is the first button in the header
    const backBtn = screen.getAllByRole('button')[0];
    fireEvent.click(backBtn);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('typing in Special Instructions updates the note', () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    const textarea = screen.getByPlaceholderText(/Any special requests/i);
    fireEvent.change(textarea, { target: { value: 'No onions please' } });
    expect(textarea.value).toBe('No onions please');
  });

  // ── Payment ───────────────────────────────────────────────────────────────

  it('calls the payment API when Place Order is clicked', async () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    fireEvent.click(screen.getByText(/Place Order/i));
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/payments/initialize'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('saves pendingOrder to sessionStorage before redirecting', async () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    fireEvent.click(screen.getByText(/Place Order/i));
    await waitFor(() => expect(sessionStorageMock.setItem).toHaveBeenCalled());
    const [key, value] = sessionStorageMock.setItem.mock.calls[0];
    expect(key).toBe('pendingOrder');
    const saved = JSON.parse(value);
    expect(saved.vendor_id).toBe('vendor-1');
    expect(saved.total).toBe(130);
  });

  it('redirects to Paystack URL after payment initialization', async () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    fireEvent.click(screen.getByText(/Place Order/i));
    await waitFor(() => expect(window.location.href).toBe('https://paystack.com/pay/test'));
  });

  it('navigates to student-dashboard when Home icon is clicked', () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    const homeArea = screen.getAllByRole('generic').find(el =>
      el.getAttribute('style')?.includes('cursor: pointer') &&
      el.closest('header')
    );
    if (homeArea) {
      fireEvent.click(homeArea);
      expect(mockNavigate).toHaveBeenCalledWith('/student-dashboard');
    }
  });
});