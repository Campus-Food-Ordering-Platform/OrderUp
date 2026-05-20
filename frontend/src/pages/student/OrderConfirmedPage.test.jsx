import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({ state: null, search: '' }),
    useNavigate: () => mockNavigate,
  };
});

// ── Sample order data ─────────────────────────────────────────────────────────

const makeOrder = (overrides = {}) => ({
  id: 'order-001',
  order_number: 'ORD9999',
  vendor_name: 'Test Vendor',
  vendor_location: 'The Matrix Food Court',
  total_amount: 85,
  note: 'No onions please',
  status: 'received',
  created_at: new Date().toISOString(),
  items: [
    { name: 'Burger', quantity: 2, unit_price: 40 },
    { name: 'Fries',  quantity: 1, unit_price: 5  },
  ],
  ...overrides,
});

// ── localStorage stub ─────────────────────────────────────────────────────────

const localStorageMock = (() => {
  let store = {};
  return {
    getItem:    vi.fn((key) => store[key] ?? null),
    setItem:    vi.fn((key, val) => { store[key] = val; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear:      vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Sets up localStorage so fetchActiveOrders finds a user id */
function setLocalUser(id = 'student-99') {
  localStorageMock.getItem.mockImplementation((key) => {
    if (key === 'orderup_user') return JSON.stringify({ id });
    return null;
  });
}

/** Default fetch: active-all returns one order, status poll returns 'received' */
function mockFetchWithOrders(orders = [makeOrder()]) {
  global.fetch = vi.fn((url) => {
    if (url.includes('/active-all')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(orders) });
    }
    if (url.includes('/status')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ status: 'received' }) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockNavigate.mockReset();
  localStorageMock.clear();
  setLocalUser();
  mockFetchWithOrders();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('OrderConfirmedPage', () => {

  // ── Loading state ─────────────────────────────────────────────────────────

  it('shows a loading spinner on initial render', () => {
    // fetch never resolves → component stays in loading state
    global.fetch = vi.fn(() => new Promise(() => {}));
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    expect(screen.getByText(/Loading your orders/i)).toBeInTheDocument();
  });

  // ── Header ────────────────────────────────────────────────────────────────

  it('renders the OrderUp brand in the header', async () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    expect(screen.getByText('OrderUp')).toBeInTheDocument();
  });

  // ── Active orders state ───────────────────────────────────────────────────

  it('shows "Active Orders" heading once orders load', async () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByText(/Active Orders/i)).toBeInTheDocument()
    );
  });

  it('displays the vendor name on the order card', async () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByText('Test Vendor')).toBeInTheDocument()
    );
  });

  it('displays the order number on the card', async () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByText(/ORD9999/i)).toBeInTheDocument()
    );
  });

  it('displays the total paid amount', async () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByText(/R 85\.00/i)).toBeInTheDocument()
    );
  });

  it('shows the order tracking steps', async () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText(/Order Received/i)).toBeInTheDocument();
      expect(screen.getByText(/Preparing/i)).toBeInTheDocument();
      expect(screen.getByText(/Ready for Collection/i)).toBeInTheDocument();
    });
  });

  it('shows the collection point information', async () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByText(/The Matrix Food Court/i)).toBeInTheDocument()
    );
  });

  it('shows the vendor stall reference in the collection info', async () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByText(/Test Vendor stall/i)).toBeInTheDocument()
    );
  });

  it('displays the special instructions note when provided', async () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByText(/No onions please/i)).toBeInTheDocument()
    );
  });

  it('does not show special instructions when note is absent', async () => {
    mockFetchWithOrders([makeOrder({ note: null })]);
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.queryByText(/SPECIAL INSTRUCTIONS/i)).not.toBeInTheDocument()
    );
  });

  it('shows item names and quantities on the order card', async () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText('Burger')).toBeInTheDocument();
      expect(screen.getByText('Fries')).toBeInTheDocument();
    });
  });

  it('renders a LIVE indicator badge', async () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByText('LIVE')).toBeInTheDocument()
    );
  });

  it('shows the correct order count in the subtitle', async () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByText(/1 order in progress/i)).toBeInTheDocument()
    );
  });

  it('renders multiple order cards when multiple orders are active', async () => {
    mockFetchWithOrders([
      makeOrder({ id: 'order-001', order_number: 'ORD0001', vendor_name: 'Vendor A' }),
      makeOrder({ id: 'order-002', order_number: 'ORD0002', vendor_name: 'Vendor B' }),
    ]);
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText('Vendor A')).toBeInTheDocument();
      expect(screen.getByText('Vendor B')).toBeInTheDocument();
      expect(screen.getByText(/2 orders in progress/i)).toBeInTheDocument();
    });
  });


  // ── Empty / no-user state ─────────────────────────────────────────────────

  it('shows "No Active Orders" when the orders list is empty', async () => {
    mockFetchWithOrders([]);
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByText(/No Active Orders/i)).toBeInTheDocument()
    );
  });

  it('shows a Browse Vendors button when there are no active orders', async () => {
    mockFetchWithOrders([]);
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByText('Browse Vendors')).toBeInTheDocument()
    );
  });

  it('navigates to student-dashboard when Browse Vendors is clicked', async () => {
    mockFetchWithOrders([]);
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    await waitFor(() => screen.getByText('Browse Vendors'));
    fireEvent.click(screen.getByText('Browse Vendors'));
    expect(mockNavigate).toHaveBeenCalledWith('/student-dashboard');
  });


  // ── Navigation ────────────────────────────────────────────────────────────

  it('navigates to student-dashboard when the Home icon is clicked', async () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    await waitFor(() => screen.getByText(/Active Orders/i));

    const homeButtons = screen
      .getAllByRole('generic')
      .filter(el =>
        el.getAttribute('style')?.includes('cursor: pointer') &&
        el.closest('header')
      );
    fireEvent.click(homeButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/student-dashboard');
  });

  it('navigates to student-history when the History icon is clicked', async () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    await waitFor(() => screen.getByText(/Active Orders/i));

    const headerButtons = screen
      .getAllByRole('generic')
      .filter(el =>
        el.getAttribute('style')?.includes('cursor: pointer') &&
        el.closest('header')
      );
    // Second clickable icon in the header is History
    fireEvent.click(headerButtons[1]);
    expect(mockNavigate).toHaveBeenCalledWith('/student-history');
  });

  // ── API fetch behaviour ───────────────────────────────────────────────────

  it('calls the active-all endpoint with the user id from localStorage', async () => {
    setLocalUser('student-42');
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/orders/student/student-42/active-all')
      )
    );
  });

  it('does not call fetch when no user id is present', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    global.fetch = vi.fn();
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    // Give effects time to run
    await act(async () => { await new Promise(r => setTimeout(r, 50)); });
    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining('/active-all')
    );
  });

  // ── Status polling ────────────────────────────────────────────────────────

  it('polls the status endpoint for each active order', async () => {
    vi.useFakeTimers();
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);

    // Wait for initial load
    await act(async () => { await Promise.resolve(); });

    // Advance past the 5 s poll interval
    await act(async () => { vi.advanceTimersByTime(5100); });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/orders/order-001/status')
    );

    vi.useRealTimers();
  });


});