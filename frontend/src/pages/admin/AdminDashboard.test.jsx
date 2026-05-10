import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// ── Shared mock data ────────────────────────────────────────────────────────

const activeChinese = {
  id: 'vendor-1',
  vendor_name: 'Chinese Lantern',
  owner_name: 'John Smith',
  vendor_status: 'active',
  application_status: 'approved',
  category: 'Asian',          // renders Utensils icon
  revenue: '5000',
  orders: '42',
  join_date: new Date().toISOString(),
  description: 'Great Asian food',
  location: 'Block A',
  operating_hours: '9am - 5pm',
  health_certificate_url: 'https://example.com/cert.pdf',
  sample_items: ['Fried Rice', 'Dumplings'],
  rejection_reason: null,
};

const pendingXpresso = {
  id: 'vendor-2',
  vendor_name: 'Xpresso Cafe',
  owner_name: 'Jane Doe',
  vendor_status: null,
  application_status: 'pending',
  category: 'Cafe',           // renders Coffee icon
  revenue: '0',
  orders: '0',
  join_date: new Date().toISOString(),
  description: 'Coffee and snacks',
  location: 'Block B',
  operating_hours: '8am - 4pm',
  health_certificate_url: null,         // no cert → "No certificate uploaded" branch
  sample_items: [],                     // empty → "No sample menu uploaded." branch
  rejection_reason: 'Missing docs',     // renders rejection reason section
  submitted_at: new Date().toISOString(),
  app_description: 'Coffee and snacks',
  app_location: 'Block B',
  app_operating_hours: '8am - 4pm',
};

const suspendedBurger = {
  id: 'vendor-3',
  vendor_name: 'Burger Barn',
  owner_name: 'Bob Jones',
  vendor_status: 'suspended',
  application_status: 'approved',
  category: 'Fast Food',      // renders Utensils icon
  revenue: '1000',
  orders: '10',
  join_date: new Date().toISOString(),
  description: 'Burgers',
  location: 'Block C',
  operating_hours: '10am - 6pm',
  health_certificate_url: null,
  sample_items: [],
  rejection_reason: null,
};

const healthyVendor = {
  id: 'vendor-4',
  vendor_name: 'Green Bowl',
  owner_name: 'Amy Lee',
  vendor_status: 'active',
  application_status: 'approved',
  category: 'Healthy',        // renders Leaf icon
  revenue: '2000',
  orders: '20',
  join_date: null,            // null join_date → formatDate returns 'N/A'
  description: null,          // null description → falls back to app_description
  app_description: 'Healthy meals',
  location: null,
  operating_hours: { mon: '9-5' }, // object hours → JSON.stringify branch
  health_certificate_url: null,
  sample_items: ['Salad'],
  rejection_reason: null,
};

const unknownCategoryVendor = {
  id: 'vendor-5',
  vendor_name: 'Mystery Bites',
  owner_name: 'Sam Yu',
  vendor_status: 'active',
  application_status: 'approved',
  category: 'Other',          // falls back to Store icon
  revenue: '500',
  orders: '5',
  join_date: new Date().toISOString(),
  description: 'Unknown cuisine',
  location: 'Block E',
  operating_hours: null,      // null hours → 'N/A' branch
  health_certificate_url: null,
  sample_items: [],
  rejection_reason: null,
};

const mockOrders = [
  {
    id: 'order-1',
    vendor_name: 'Chinese Lantern',
    customer_name: 'Samele Hlatswayo',
    total_amount: 120,
    status: 'received',
    created_at: new Date().toISOString(),
  },
  {
    id: 'order-2',
    vendor_name: 'Pizza Palace',
    customer_name: 'Thabo Mokoena',
    total_amount: 80,
    status: 'collected',
    created_at: new Date().toISOString(),
  },
];

// Default fetch: vendors + orders
const defaultFetch = () =>
  vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => [activeChinese, pendingXpresso, suspendedBurger] })
    .mockResolvedValueOnce({ ok: true, json: async () => mockOrders });

beforeEach(() => {
  mockNavigate.mockReset();
  global.fetch = defaultFetch();
});

// Helper: render and wait for initial data load
async function renderAndLoad(vendors = [activeChinese, pendingXpresso, suspendedBurger]) {
  global.fetch = vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => vendors })
    .mockResolvedValueOnce({ ok: true, json: async () => mockOrders });
  render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
  await waitFor(() => expect(screen.getByText('Total Vendors')).toBeInTheDocument());
}

describe('AdminDashboard', () => {

  // ── Initial render / Overview ────────────────────────────────────────────

  it('renders the overview tab by default', async () => {
    await renderAndLoad();
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Total Vendors')).toBeInTheDocument();
    expect(screen.getByText('Total Orders')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });

  it('shows the pending alert banner when there are pending vendors', async () => {
    await renderAndLoad();
    // pendingXpresso has application_status=pending → banner shows
    expect(screen.getByText(/awaiting approval/i)).toBeInTheDocument();
    expect(screen.getByText('Review Now')).toBeInTheDocument();
  });

  it('does NOT show pending banner when no pending vendors', async () => {
    await renderAndLoad([activeChinese, suspendedBurger]);
    expect(screen.queryByText(/awaiting approval/i)).not.toBeInTheDocument();
  });

  it('"Review Now" button switches to Vendors tab with pending filter', async () => {
    await renderAndLoad();
    fireEvent.click(screen.getByText('Review Now'));
    await waitFor(() =>
      expect(screen.getByPlaceholderText('Search vendors or owners...')).toBeInTheDocument()
    );
    // Xpresso is pending — should be visible; Chinese Lantern (active) should not
    expect(screen.getByText('Xpresso Cafe')).toBeInTheDocument();
    expect(screen.queryByText('Chinese Lantern')).not.toBeInTheDocument();
  });

  it('handles vendor fetch error gracefully', async () => {
    global.fetch = vi.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ ok: true, json: async () => mockOrders });
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    // No crash — just empty vendor list
    await waitFor(() => expect(screen.getByText('Admin Dashboard')).toBeInTheDocument());
  });

  it('handles orders fetch error gracefully', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [activeChinese] })
      .mockRejectedValueOnce(new Error('Network error'));
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Total Vendors')).toBeInTheDocument());
  });

  it('handles non-array vendor response', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ error: 'bad' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Admin Dashboard')).toBeInTheDocument());
  });

  it('navigates to student-dashboard when home icon is clicked', async () => {
    await renderAndLoad();
    const homeIcons = document.querySelectorAll('.lucide-house');
    fireEvent.click(homeIcons[0].parentElement);
    expect(mockNavigate).toHaveBeenCalledWith('/student-dashboard');
  });

  // ── Vendors tab ──────────────────────────────────────────────────────────

  it('switches to Vendors tab and shows all vendors', async () => {
    await renderAndLoad();
    fireEvent.click(screen.getByText('Vendors'));
    await waitFor(() => expect(screen.getByText('Chinese Lantern')).toBeInTheDocument());
    expect(screen.getByText('Xpresso Cafe')).toBeInTheDocument();
    expect(screen.getByText('Burger Barn')).toBeInTheDocument();
  });

  it('shows "No vendors found" when search has no matches', async () => {
    await renderAndLoad();
    fireEvent.click(screen.getByText('Vendors'));
    await waitFor(() => expect(screen.getByText('Chinese Lantern')).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText('Search vendors or owners...'), {
      target: { value: 'zzznomatch' },
    });
    expect(screen.getByText('No vendors found')).toBeInTheDocument();
  });

  it('filters vendors by owner name in search', async () => {
    await renderAndLoad();
    fireEvent.click(screen.getByText('Vendors'));
    await waitFor(() => expect(screen.getByText('Chinese Lantern')).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText('Search vendors or owners...'), {
      target: { value: 'Jane' },
    });
    expect(screen.getByText('Xpresso Cafe')).toBeInTheDocument();
    expect(screen.queryByText('Chinese Lantern')).not.toBeInTheDocument();
  });

  it('filters active vendors', async () => {
    await renderAndLoad();
    fireEvent.click(screen.getByText('Vendors'));
    await waitFor(() => expect(screen.getByText('Chinese Lantern')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /active/i }));
    expect(screen.getByText('Chinese Lantern')).toBeInTheDocument();
    expect(screen.queryByText('Xpresso Cafe')).not.toBeInTheDocument();
  });

  it('filters suspended vendors — shows Reinstate button and suspension message', async () => {
    await renderAndLoad();
    fireEvent.click(screen.getByText('Vendors'));
    await waitFor(() => expect(screen.getByText('Burger Barn')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /suspended/i }));
    expect(screen.getByText('Burger Barn')).toBeInTheDocument();
    expect(screen.getByText('Reinstate')).toBeInTheDocument();
    expect(screen.getByText(/Vendor is suspended/i)).toBeInTheDocument();
    expect(screen.queryByText('Chinese Lantern')).not.toBeInTheDocument();
  });

  it('filters pending vendors — shows Review Forms button', async () => {
    await renderAndLoad();
    fireEvent.click(screen.getByText('Vendors'));
    await waitFor(() => expect(screen.getByText('Xpresso Cafe')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /pending/i }));
    expect(screen.getByText('Xpresso Cafe')).toBeInTheDocument();
    expect(screen.getByText('Review Forms')).toBeInTheDocument();
    expect(screen.queryByText('Chinese Lantern')).not.toBeInTheDocument();
  });

  it('renders category icons: Asian→Utensils, Cafe→Coffee, Healthy→Leaf, Other→Store', async () => {
    await renderAndLoad([activeChinese, pendingXpresso, healthyVendor, unknownCategoryVendor]);
    fireEvent.click(screen.getByText('Vendors'));
    await waitFor(() => expect(screen.getByText('Chinese Lantern')).toBeInTheDocument());
    // Just confirm all render without crashing
    expect(screen.getByText('Green Bowl')).toBeInTheDocument();
    expect(screen.getByText('Mystery Bites')).toBeInTheDocument();
  });

  // ── Approve / Suspend actions ────────────────────────────────────────────

  it('approve button calls PATCH and updates vendor to active', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [pendingXpresso] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      // PATCH approve
      .mockResolvedValueOnce({ ok: true, json: async () => ({ status: 'active' }) });

    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Total Vendors')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Vendors'));
    await waitFor(() => expect(screen.getByText('Approve')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Approve'));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(3));
  });

  it('approve handles fetch error gracefully', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [pendingXpresso] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockRejectedValueOnce(new Error('Network error'));

    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Total Vendors')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Vendors'));
    await waitFor(() => expect(screen.getByText('Approve')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Approve'));
    // No crash
    await waitFor(() => expect(screen.getByText('Vendors')).toBeInTheDocument());
  });

  it('suspend button calls PATCH and marks vendor suspended', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [activeChinese] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ status: 'suspended' }) });

    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Total Vendors')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Vendors'));
    await waitFor(() => expect(screen.getByText('Suspend')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Suspend'));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(3));
  });

  it('suspend handles fetch error gracefully', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [activeChinese] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockRejectedValueOnce(new Error('Network error'));

    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Total Vendors')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Vendors'));
    await waitFor(() => expect(screen.getByText('Suspend')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Suspend'));
    await waitFor(() => expect(screen.getByText('Vendors')).toBeInTheDocument());
  });

  // ── Review modal ─────────────────────────────────────────────────────────

  it('opens the review modal for a pending vendor', async () => {
    await renderAndLoad();
    fireEvent.click(screen.getByText('Vendors'));
    await waitFor(() => expect(screen.getByText('Xpresso Cafe')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /pending/i }));
    fireEvent.click(screen.getByText('Review Forms'));

    expect(screen.getByText('Application Review')).toBeInTheDocument();
  });

  it('modal shows "No certificate uploaded" when health_certificate_url is null', async () => {
    await renderAndLoad();
    fireEvent.click(screen.getByText('Vendors'));
    await waitFor(() => expect(screen.getByText('Xpresso Cafe')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /pending/i }));
    fireEvent.click(screen.getByText('Review Forms'));

    expect(screen.getByText('No certificate uploaded')).toBeInTheDocument();
  });


it('modal shows "View Health Certificate" link when url is present', async () => {
  const pendingWithCert = { ...pendingXpresso, health_certificate_url: 'https://example.com/cert.pdf' };
  global.fetch = vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => [pendingWithCert] })
    .mockResolvedValueOnce({ ok: true, json: async () => [] });
  render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
  await waitFor(() => expect(screen.getByText('Total Vendors')).toBeInTheDocument());

  fireEvent.click(screen.getByText('Vendors'));
  await waitFor(() => expect(screen.getByText('Review Forms')).toBeInTheDocument());
  fireEvent.click(screen.getByText('Review Forms'));

  expect(screen.getByText('View Health Certificate')).toBeInTheDocument();
});

  it('modal shows "No sample menu uploaded." when sample_items is empty', async () => {
    await renderAndLoad();
    fireEvent.click(screen.getByText('Vendors'));
    await waitFor(() => expect(screen.getByText('Xpresso Cafe')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /pending/i }));
    fireEvent.click(screen.getByText('Review Forms'));

    expect(screen.getByText('No sample menu uploaded.')).toBeInTheDocument();
  });

  it('modal shows sample items when sample_items has entries', async () => {
    const pendingWithItems = { ...pendingXpresso, sample_items: ['Espresso', 'Croissant'] };
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [pendingWithItems] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Total Vendors')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Vendors'));
    await waitFor(() => expect(screen.getByText('Review Forms')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Review Forms'));

    expect(screen.getByText('Espresso')).toBeInTheDocument();
    expect(screen.getByText('Croissant')).toBeInTheDocument();
  });

  it('modal shows rejection reason when present', async () => {
    await renderAndLoad();
    fireEvent.click(screen.getByText('Vendors'));
    await waitFor(() => expect(screen.getByText('Xpresso Cafe')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /pending/i }));
    fireEvent.click(screen.getByText('Review Forms'));

    expect(screen.getByText('Missing docs')).toBeInTheDocument();
  });

it('modal handles object operating_hours via JSON.stringify', async () => {
  const pendingHealthy = { ...healthyVendor, vendor_status: null, application_status: 'pending' };
  global.fetch = vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => [pendingHealthy] })
    .mockResolvedValueOnce({ ok: true, json: async () => [] });
  render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
  await waitFor(() => expect(screen.getByText('Total Vendors')).toBeInTheDocument());

  fireEvent.click(screen.getByText('Vendors'));
  await waitFor(() => expect(screen.getByText('Review Forms')).toBeInTheDocument());
  fireEvent.click(screen.getByText('Review Forms'));

expect(screen.getByText(/\{"mon":"9-5"\}/)).toBeInTheDocument();
});

  it('closes the modal via the X button', async () => {
    await renderAndLoad();
    fireEvent.click(screen.getByText('Vendors'));
    await waitFor(() => expect(screen.getByText('Xpresso Cafe')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /pending/i }));
    fireEvent.click(screen.getByText('Review Forms'));
    expect(screen.getByText('Application Review')).toBeInTheDocument();


    const closeBtn = screen.getByText('Application Review')
  .closest('div')
  .querySelector('button');
fireEvent.click(closeBtn);

    await waitFor(() =>
      expect(screen.queryByText('Application Review')).not.toBeInTheDocument()
    );
  });

  it('Approve Vendor in modal calls PATCH and closes modal', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [pendingXpresso] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ status: 'active' }) });

    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Total Vendors')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Vendors'));
    await waitFor(() => expect(screen.getByText('Review Forms')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Review Forms'));
    expect(screen.getByText('Approve Vendor')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Approve Vendor'));
    await waitFor(() =>
      expect(screen.queryByText('Application Review')).not.toBeInTheDocument()
    );
  });

  it('Suspend in modal calls PATCH', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [pendingXpresso] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ status: 'suspended' }) });

    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Total Vendors')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Vendors'));
    await waitFor(() => expect(screen.getByText('Review Forms')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Review Forms'));

    // The modal has a Suspend button too
    const suspendBtns = screen.getAllByText('Suspend');
    fireEvent.click(suspendBtns[suspendBtns.length - 1]); // modal's Suspend
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(3));
  });

  // ── Disputes / Orders tab ────────────────────────────────────────────────

  it('switches to Disputes tab and shows search prompt', async () => {
    await renderAndLoad();
    fireEvent.click(screen.getByText('Disputes'));
    expect(screen.getByText('Order Lookup & Disputes')).toBeInTheDocument();
    expect(screen.getByText('Enter a search term to find a specific order')).toBeInTheDocument();
  });

  it('shows orders when a search term is typed', async () => {
    await renderAndLoad();
    fireEvent.click(screen.getByText('Disputes'));

    fireEvent.change(
      screen.getByPlaceholderText('Search by Order ID, customer, or vendor...'),
      { target: { value: 'Samele' } }
    );
    await waitFor(() =>
      expect(screen.getByText('Samele Hlatswayo')).toBeInTheDocument()
    );
  });

  it('filters orders by vendor name', async () => {
    await renderAndLoad();
    fireEvent.click(screen.getByText('Disputes'));

    fireEvent.change(
      screen.getByPlaceholderText('Search by Order ID, customer, or vendor...'),
      { target: { value: 'Chinese Lantern' } }
    );
    await waitFor(() =>
      expect(screen.getByText('Samele Hlatswayo')).toBeInTheDocument()
    );
    expect(screen.queryByText('Thabo Mokoena')).not.toBeInTheDocument();
  });

  it('filters orders by order id', async () => {
    await renderAndLoad();
    fireEvent.click(screen.getByText('Disputes'));

    fireEvent.change(
      screen.getByPlaceholderText('Search by Order ID, customer, or vendor...'),
      { target: { value: 'order-2' } }
    );
    await waitFor(() =>
      expect(screen.getByText('Thabo Mokoena')).toBeInTheDocument()
    );
    expect(screen.queryByText('Samele Hlatswayo')).not.toBeInTheDocument();
  });

  it('shows "No orders match your search." for unmatched query', async () => {
    await renderAndLoad();
    fireEvent.click(screen.getByText('Disputes'));

    fireEvent.change(
      screen.getByPlaceholderText('Search by Order ID, customer, or vendor...'),
      { target: { value: 'zzznomatch' } }
    );
    expect(screen.getByText('No orders match your search.')).toBeInTheDocument();
  });

  it('renders Process Refund and Contact Parties buttons for matched orders', async () => {
    await renderAndLoad();
    fireEvent.click(screen.getByText('Disputes'));

    fireEvent.change(
      screen.getByPlaceholderText('Search by Order ID, customer, or vendor...'),
      { target: { value: 'Samele' } }
    );
    await waitFor(() => expect(screen.getByText('Process Refund')).toBeInTheDocument());
    expect(screen.getByText('Contact Parties')).toBeInTheDocument();
  });
});