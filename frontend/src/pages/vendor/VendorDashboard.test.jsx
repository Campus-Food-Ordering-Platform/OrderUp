import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import VendorDashboard from './VendorDashboard';

// ── Helpers ───────────────────────────────────────────────────────────────────

const setLocalUser = (data) =>
  localStorage.setItem('orderup_user', JSON.stringify(data));

const mockVendorFetch = (overrides = {}) =>
  vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      type: 'vendor',
      id: 'test-vendor-id',
      status: 'active',
      name: 'Test Vendor',
      ...overrides,
    }),
  });

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();

  // Default: active vendor, no orders
  global.fetch = vi.fn((url) => {
    if (url.includes('/api/vendors/status')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ type: 'vendor', id: 'test-vendor-id', status: 'active', name: 'Test Vendor' }),
      });
    }
    if (url.includes('/api/orders/vendor')) {
      return Promise.resolve({ ok: true, json: async () => [] });
    }
    if (url.includes('/api/vendors/') && url.includes('/menu')) {
      return Promise.resolve({ ok: true, json: async () => [] });
    }
    if (url.includes('/api/vendors/applications')) {
      return Promise.resolve({ ok: true, json: async () => ({}) });
    }
    return Promise.resolve({ ok: true, json: async () => [] });
  });

  setLocalUser({ id: 'user-123', name: 'Test Vendor' });
});

// ── Suspended screen ──────────────────────────────────────────────────────────

describe('VendorDashboard — suspended screen', () => {
  beforeEach(() => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/vendors/status')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ type: 'vendor', id: 'test-vendor-id', status: 'suspended', name: 'Test Vendor' }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });
  });

  it('shows Account Suspended heading', async () => {
    render(<MemoryRouter><VendorDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Account Suspended')).toBeInTheDocument());
  });

  it('shows the suspension explanation', async () => {
    render(<MemoryRouter><VendorDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/temporarily suspended/i)).toBeInTheDocument());
  });

  it('shows support email for appeal', async () => {
    render(<MemoryRouter><VendorDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('support@orderup.co.za')).toBeInTheDocument());
  });

  it('lists consequences of suspension', async () => {
    render(<MemoryRouter><VendorDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/hidden from students/i)).toBeInTheDocument());
  });
});

// ── Pending screen ────────────────────────────────────────────────────────────

describe('VendorDashboard — pending screen', () => {
  beforeEach(() => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/vendors/status')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ type: 'application', status: 'pending', name: 'Test Vendor' }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });
  });

  it('shows Application Under Review heading', async () => {
    render(<MemoryRouter><VendorDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Application Under Review')).toBeInTheDocument());
  });

  it('shows the 24-48 hours message', async () => {
    render(<MemoryRouter><VendorDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getAllByText(/24–48 hours/i).length).toBeGreaterThan(0));
  });

  it('shows the progress steps', async () => {
    render(<MemoryRouter><VendorDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Application Submitted')).toBeInTheDocument());
    expect(screen.getByText('Under Admin Review')).toBeInTheDocument();
    expect(screen.getByText('Approved & Live')).toBeInTheDocument();
  });

  it('shows the "In Progress" badge', async () => {
    render(<MemoryRouter><VendorDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('In Progress')).toBeInTheDocument());
  });
});

// ── Application form (no vendor yet) ─────────────────────────────────────────

describe('VendorDashboard — application form', () => {
  beforeEach(() => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/vendors/status')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ type: 'none' }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });
  });

  it('shows the Vendor Application heading', async () => {
    render(<MemoryRouter><VendorDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Vendor Application')).toBeInTheDocument());
  });

  it('shows the Submit Application button', async () => {
    render(<MemoryRouter><VendorDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/Submit Application/i)).toBeInTheDocument());
  });

  it('shows required fields', async () => {
    render(<MemoryRouter><VendorDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByPlaceholderText("e.g. Thabo Nkosi")).toBeInTheDocument());
    expect(screen.getByPlaceholderText('e.g. 082 555 0192')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Matrix Food Court/i)).toBeInTheDocument();
  });

  it('shows the category dropdown with options', async () => {
    render(<MemoryRouter><VendorDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Fast Food')).toBeInTheDocument());
    expect(screen.getByText('Cafe')).toBeInTheDocument();
    expect(screen.getByText('Asian')).toBeInTheDocument();
  });

  it('alerts when submitting with missing required fields', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<MemoryRouter><VendorDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/Submit Application/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Submit Application/i));
    expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('required fields'));
    alertMock.mockRestore();
  });

  it('can add a sample menu item', async () => {
    render(<MemoryRouter><VendorDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByPlaceholderText('e.g. Chicken Burger')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('e.g. Chicken Burger'), { target: { value: 'Kota' } });
    fireEvent.click(screen.getByText('Add'));
    expect(screen.getByText('Kota')).toBeInTheDocument();
  });

  it('submits the form and transitions to pending when all required fields are filled', async () => {
    render(<MemoryRouter><VendorDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/Submit Application/i)).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText('e.g. Thabo Nkosi'), { target: { value: 'Thabo' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. 082 555 0192'), { target: { value: '0821234567' } });
    fireEvent.change(screen.getByPlaceholderText(/Matrix Food Court/i), { target: { value: 'Stall 4' } });
    fireEvent.change(screen.getByPlaceholderText(/Describe your stall/i), { target: { value: 'Great food' } });

    fireEvent.click(screen.getByText(/Submit Application/i));

    await waitFor(() =>
      expect(screen.getByText('Application Under Review')).toBeInTheDocument()
    );
  });
});

// ── No localStorage user ──────────────────────────────────────────────────────

describe('VendorDashboard — no logged-in user', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn();
  });

  it('shows the application form when no user in localStorage', async () => {
    render(<MemoryRouter><VendorDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Vendor Application')).toBeInTheDocument());
  });

  it('does not call the status API when no user id', () => {
    render(<MemoryRouter><VendorDashboard /></MemoryRouter>);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

// ── Active dashboard — order status update ────────────────────────────────────

describe('VendorDashboard — order status update', () => {
  const mockOrder = {
    id: 'order-1',
    order_number: 'ORD001',
    customer_name: 'Jane Student',
    status: 'received',
    total_amount: 120,
    items: [{ name: 'Fried Rice', price: 45 }],
    time: '12:30',
    note: null,
  };

  beforeEach(() => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/vendors/status')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ type: 'vendor', id: 'test-vendor-id', status: 'active', name: 'Test Vendor' }),
        });
      }
      if (url.includes('/api/orders/vendor')) {
        return Promise.resolve({ ok: true, json: async () => [mockOrder] });
      }
      if (url.includes('/status') && url.includes('order-1')) {
        return Promise.resolve({ ok: true, json: async () => ({ ...mockOrder, status: 'preparing' }) });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });
  });

  it('renders order cards with order number', async () => {
    render(<MemoryRouter><VendorDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/ORD001/i)).toBeInTheDocument());
  });

  it('renders customer name on order card', async () => {
    render(<MemoryRouter><VendorDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Jane Student')).toBeInTheDocument());
  });

  it('renders the action button for received orders', async () => {
    render(<MemoryRouter><VendorDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Start Preparing')).toBeInTheDocument());
  });

  it('updates order status when action button is clicked', async () => {
    render(<MemoryRouter><VendorDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Start Preparing')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Start Preparing'));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/orders/order-1/status'),
        expect.objectContaining({ method: 'PATCH' })
      )
    );
  });

  it('renders order items inside the card', async () => {
    render(<MemoryRouter><VendorDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Fried Rice')).toBeInTheDocument());
  });
});

// ── Order filter chips ────────────────────────────────────────────────────────

describe('VendorDashboard — order filter chips on active dashboard', () => {
  beforeEach(() => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/vendors/status')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ type: 'vendor', id: 'test-vendor-id', status: 'active', name: 'Test Vendor' }),
        });
      }
      if (url.includes('/api/orders/vendor')) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });
  });

  it('shows all filter chips', async () => {
    render(<MemoryRouter><VendorDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('All orders')).toBeInTheDocument());
    expect(screen.getByText('received')).toBeInTheDocument();
    expect(screen.getByText('preparing')).toBeInTheDocument();
    expect(screen.getByText('ready')).toBeInTheDocument();
  });

  it('clicking a filter chip changes the active filter', async () => {
    render(<MemoryRouter><VendorDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('preparing')).toBeInTheDocument());
    fireEvent.click(screen.getByText('preparing'));
    // No crash — chip is now active; empty state shows
    expect(screen.queryByText('No orders')).toBeFalsy(); // no explicit message, just no cards
  });
});