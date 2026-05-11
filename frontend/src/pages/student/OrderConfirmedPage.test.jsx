import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import OrderConfirmedPage from './OrderConfirmedPage';

// ── Auth0 mock ────────────────────────────────────────────────────────────────

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    user: { sub: 'auth0|student123', name: 'Test Student' },
    logout: vi.fn(),
  }),
}));

// ── Router mock ───────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();

// Base state representing a completed order passed via location.state
const baseOrderState = {
  id: 'test-order-123',
  order_number: 'ORD9999',
  vendor: { name: 'Test Vendor', wait: 15 },
  total: 85,
  total_amount: 85,
  note: 'No onions please',
  status: 'received',
};

let mockLocationState = baseOrderState;

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({ state: mockLocationState, search: '' }),
    useNavigate: () => mockNavigate,
  };
});

// ── sessionStorage stub ───────────────────────────────────────────────────────

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

beforeEach(() => {
  vi.clearAllMocks();
  mockNavigate.mockReset();
  mockLocationState = baseOrderState;
  sessionStorageMock.getItem.mockReturnValue(null);

  // Default fetch: status poll returns 'received'
  global.fetch = vi.fn((url) => {
    if (url.includes('/status')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ status: 'received' }) });
    }
    if (url.includes('/api/orders/student')) {
      return Promise.resolve({ ok: false });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('OrderConfirmedPage', () => {

  // ── Success state ─────────────────────────────────────────────────────────

  it('renders the "Order Placed!" heading', () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    expect(screen.getByText(/Order Placed/i)).toBeInTheDocument();
  });

  it('renders the OrderUp brand in the header', () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    expect(screen.getByText('OrderUp')).toBeInTheDocument();
  });

  it('displays the vendor name in the confirmation message', () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    expect(screen.getAllByText(/Test Vendor/i)[0]).toBeInTheDocument();
  });

  it('shows the estimated wait time from vendor data', () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    expect(screen.getByText('15 min')).toBeInTheDocument();
  });

  it('displays the total paid amount', () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    expect(screen.getByText('R 85')).toBeInTheDocument();
  });

  it('shows the Live Order Status tracker section', () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    expect(screen.getByText(/Live Order Status/i)).toBeInTheDocument();
  });

  it('shows the order tracking steps', () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    expect(screen.getByText(/Order Received/i)).toBeInTheDocument();
    expect(screen.getByText(/Preparing/i)).toBeInTheDocument();
    expect(screen.getByText(/Ready for Collection/i)).toBeInTheDocument();
  });

  it('shows the collection point information', () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    expect(screen.getByText('The Matrix Food Court')).toBeInTheDocument();
  });

  it('shows the collection point stall reference', () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    expect(screen.getByText(/Collect at the Test Vendor stall/i)).toBeInTheDocument();
  });

  it('displays the special instructions note when provided', () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    expect(screen.getByText(/No onions please/i)).toBeInTheDocument();
  });

  it('shows the special instructions label', () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    expect(screen.getByText(/Your special instructions/i)).toBeInTheDocument();
  });

  it('does not show the special instructions section when note is absent', () => {
    mockLocationState = { ...baseOrderState, note: null };
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    expect(screen.queryByText(/Your special instructions/i)).not.toBeInTheDocument();
  });

  // ── No active order state ─────────────────────────────────────────────────

  it('shows "No Active Order" when there is no order data', () => {
    mockLocationState = null;
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    expect(screen.getByText(/No Active Order/i)).toBeInTheDocument();
  });

  it('shows a Browse Vendors button when there is no order', () => {
    mockLocationState = null;
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    expect(screen.getByText('Browse Vendors')).toBeInTheDocument();
  });

  it('navigates to student-dashboard when Browse Vendors is clicked', () => {
    mockLocationState = null;
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    fireEvent.click(screen.getByText('Browse Vendors'));
    expect(mockNavigate).toHaveBeenCalledWith('/student-dashboard');
  });

  // ── Navigation ─────────────────────────────────────────────────────────────

  it('navigates to student-dashboard when Home icon is clicked (order state)', () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    // Home icon is a clickable div in the header; find by navigating siblings
    const homeIcons = screen.getAllByRole('generic').filter(el =>
      el.getAttribute('style')?.includes('cursor: pointer') &&
      el.closest('header')
    );
    fireEvent.click(homeIcons[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/student-dashboard');
  });

  // ── Status polling ─────────────────────────────────────────────────────────

  it('polls the order status endpoint when orderData has an id', async () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/orders/test-order-123/status')
      )
    );
  });

  it('updates step when status changes to "preparing"', async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/status')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ status: 'preparing' }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    // After poll, "Preparing" step should be active (CURRENT badge)
    await waitFor(() =>
      expect(screen.getAllByText(/CURRENT/i).length).toBeGreaterThan(0)
    );
  });

  // ── Paystack callback (reference in URL) ──────────────────────────────────

  it('shows no-order state when reference is in URL but sessionStorage is empty', async () => {
    // Simulate Paystack redirect with ?reference=abc but no pending order in storage
    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useLocation: () => ({ state: null, search: '?reference=abc123' }),
        useNavigate: () => mockNavigate,
      };
    });

    global.fetch = vi.fn((url) => {
      if (url.includes('/api/payments/verify')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    sessionStorageMock.getItem.mockReturnValue(null);
    // With no pendingOrder in sessionStorage the component stays in no-order state
    mockLocationState = null;
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByText(/No Active Order/i)).toBeInTheDocument()
    );
  });
});