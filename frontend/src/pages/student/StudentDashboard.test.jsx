import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import StudentDashboard from './StudentDashboard';

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    user: { sub: 'auth0|test123', name: 'TestStudent', given_name: 'TestStudent' },
    logout: vi.fn(),
  }),
}));

vi.mock('../../utils/subscribeToPush', () => ({
  subscribeToPush: vi.fn().mockResolvedValue(undefined),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Minimal navigator.serviceWorker stub so the push useEffect doesn't throw
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    ready: Promise.resolve({
      pushManager: { getSubscription: vi.fn().mockResolvedValue(null) },
    }),
  },
  writable: true,
});

const mockVendors = [
  { id: '1', name: 'Pizza Palace', category: 'Pizza', description: 'Best pizza in town', operating_hours: { hours: '9am - 9pm' } },
  { id: '2', name: 'Chinese Lantern', category: 'Asian', description: 'Authentic Asian cuisine', operating_hours: { hours: '10am - 8pm' } },
  { id: '3', name: 'Xpresso Cafe', category: 'Cafe', description: 'Great coffee and snacks', operating_hours: { hours: '7am - 5pm' } },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockNavigate.mockReset();

  global.fetch = vi.fn((url) => {
    if (url.includes('/api/vendors') && !url.includes('student')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockVendors) });
    }
    if (url.includes('/api/orders/student')) {
      // No active order
      return Promise.resolve({ ok: false });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
  });
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('StudentDashboard', () => {

  // ── Rendering ──────────────────────────────────────────────────────────────

  it('renders the OrderUp brand name', () => {
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
    expect(screen.getByText('OrderUp')).toBeInTheDocument();
  });

  it('renders the personalised greeting with the user name', async () => {
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
    // The greeting is split across nodes: "Hey there " + {name} + "!"
    // Use a custom matcher to check the combined textContent
    await waitFor(() => {
      const greeting = screen.getByText((_, element) =>
        element?.textContent === 'Hey there TestStudent!'
      );
      expect(greeting).toBeInTheDocument();
    });
  });

  it('renders the search input field', () => {
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
    expect(
      screen.getByPlaceholderText('Search vendors, cuisines, dishes...')
    ).toBeInTheDocument();
  });

  it('renders the "Vendors Near You" section heading', async () => {
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByText('Vendors Near You')).toBeInTheDocument()
    );
  });

  it('renders the notification button when push is not enabled', async () => {
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByText(/Enable order notifications/i)).toBeInTheDocument()
    );
  });

  // ── Vendor loading ─────────────────────────────────────────────────────────

  it('displays all vendors returned from the API', async () => {
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText('Pizza Palace')).toBeInTheDocument();
      expect(screen.getByText('Chinese Lantern')).toBeInTheDocument();
      expect(screen.getByText('Xpresso Cafe')).toBeInTheDocument();
    });
  });

  it('shows an error message when the API call fails', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: false, status: 500 }));
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByText(/Could not load vendors/i)).toBeInTheDocument()
    );
  });

  it('shows an error message when fetch throws a network error', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByText(/Could not load vendors/i)).toBeInTheDocument()
    );
  });

  // ── Category filtering ─────────────────────────────────────────────────────

  it('shows all vendors when "All" filter is active (default)', async () => {
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Pizza Palace')).toBeInTheDocument());
    expect(screen.getByText('Chinese Lantern')).toBeInTheDocument();
    expect(screen.getByText('Xpresso Cafe')).toBeInTheDocument();
  });

  it('filters to only Pizza vendors when Pizza chip is clicked', async () => {
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Pizza Palace')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Pizza'));
    expect(screen.getByText('Pizza Palace')).toBeInTheDocument();
    expect(screen.queryByText('Chinese Lantern')).not.toBeInTheDocument();
    expect(screen.queryByText('Xpresso Cafe')).not.toBeInTheDocument();
  });

  it('filters to only Asian vendors when Asian chip is clicked', async () => {
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Chinese Lantern')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Asian'));
    expect(screen.getByText('Chinese Lantern')).toBeInTheDocument();
    expect(screen.queryByText('Pizza Palace')).not.toBeInTheDocument();
  });

  it('shows "No vendors found" when filter matches nothing', async () => {
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Pizza Palace')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Healthy'));
    expect(screen.getByText(/No vendors found/i)).toBeInTheDocument();
  });

  it('resets to all vendors when All chip is clicked after filtering', async () => {
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Pizza Palace')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Pizza'));
    expect(screen.queryByText('Chinese Lantern')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('All'));
    expect(screen.getByText('Chinese Lantern')).toBeInTheDocument();
  });

  // ── Search ─────────────────────────────────────────────────────────────────

  it('filters vendors by search query matching name', async () => {
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Pizza Palace')).toBeInTheDocument());
    fireEvent.change(
      screen.getByPlaceholderText('Search vendors, cuisines, dishes...'),
      { target: { value: 'pizza' } }
    );
    expect(screen.getByText('Pizza Palace')).toBeInTheDocument();
    expect(screen.queryByText('Chinese Lantern')).not.toBeInTheDocument();
  });

  it('filters vendors by search query matching description', async () => {
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Chinese Lantern')).toBeInTheDocument());
    fireEvent.change(
      screen.getByPlaceholderText('Search vendors, cuisines, dishes...'),
      { target: { value: 'authentic' } }
    );
    expect(screen.getByText('Chinese Lantern')).toBeInTheDocument();
    expect(screen.queryByText('Pizza Palace')).not.toBeInTheDocument();
  });

  it('shows "No vendors found" with the search term when no match', async () => {
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Pizza Palace')).toBeInTheDocument());
    fireEvent.change(
      screen.getByPlaceholderText('Search vendors, cuisines, dishes...'),
      { target: { value: 'zzznomatch' } }
    );
    expect(screen.getByText(/No vendors found.*zzznomatch/i)).toBeInTheDocument();
  });

  // ── Navigation ─────────────────────────────────────────────────────────────

  it('navigates to vendor-menu when a vendor card is clicked', async () => {
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Pizza Palace')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Pizza Palace'));
    expect(mockNavigate).toHaveBeenCalledWith(
      '/vendor-menu',
      expect.objectContaining({ state: expect.objectContaining({ vendor: expect.objectContaining({ name: 'Pizza Palace' }) }) })
    );
  });

  it('navigates to student-dashboard when Home icon is clicked', async () => {
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('OrderUp')).toBeInTheDocument());
    // Home icon button is the first nav icon
    const homeButtons = screen.getAllByRole('generic').filter(el =>
      el.getAttribute('style')?.includes('cursor: pointer') &&
      el.closest('header')
    );
    fireEvent.click(homeButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/student-dashboard');
  });

  // ── Active order banner ────────────────────────────────────────────────────

  it('does not show active order banner when there is no active order', async () => {
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Pizza Palace')).toBeInTheDocument());
    expect(screen.queryByText(/Active order/i)).not.toBeInTheDocument();
  });

  it('shows active order banner when an active order exists', async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/vendors') && !url.includes('student')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockVendors) });
      }
      if (url.includes('/api/orders/student')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'order-123',
            vendor_name: 'Pizza Palace',
            status: 'preparing',
            total_amount: 75,
            items: [{ name: 'Margherita' }],
          }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByText(/Active order/i)).toBeInTheDocument()
    );
    expect(screen.getByText('preparing')).toBeInTheDocument();
  });
});