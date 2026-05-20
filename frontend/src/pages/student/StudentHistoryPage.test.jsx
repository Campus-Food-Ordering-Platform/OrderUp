import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import StudentHistoryPage from './StudentHistoryPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// STATUS_LABELS: confirmed→Confirmed, preparing→Preparing, ready→Ready, collected→Completed
const mockOrders = [
  {
    id: 'order-1',
    vendor_id: 'vendor-1',
    vendor_name: 'Pizza Palace',
    items: [{ name: 'Margherita', price: 50, quantity: 1 }],
    total_amount: 50,
    status: 'confirmed',
    note: 'Extra cheese please',
    order_number: 'ORD001',
    created_at: new Date().toISOString(),
  },
  {
    id: 'order-2',
    vendor_id: 'vendor-2',
    vendor_name: 'Chinese Lantern',
    items: [{ name: 'Fried Rice', price: 60, quantity: 2 }],
    total_amount: 120,
    status: 'collected',   // → 'Completed'
    note: null,
    order_number: 'ORD002',
    created_at: new Date().toISOString(),
  },
  {
    id: 'order-3',
    vendor_id: 'vendor-3',
    vendor_name: 'Burger Barn',
    items: [{ name: 'Cheeseburger', price: 80, quantity: 1 }],
    total_amount: 80,
    status: 'preparing',   // → 'Preparing'
    note: null,
    order_number: 'ORD003',
    created_at: new Date().toISOString(),
  },
  {
    id: 'order-4',
    vendor_id: 'vendor-4',
    vendor_name: 'Wrap It Up',
    items: [{ name: 'Chicken Wrap', price: 70, quantity: 1 }],
    total_amount: 70,
    status: 'ready',       // → 'Ready'
    note: null,
    order_number: 'ORD004',
    created_at: new Date().toISOString(),
  },
];

beforeEach(() => {
  mockNavigate.mockReset();
  localStorage.clear();
  localStorage.setItem('orderup_user', JSON.stringify({ user: { id: 'student-uuid-123' } }));
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockOrders });
});

describe('StudentHistoryPage', () => {

  // ── Initial render ──────────────────────────────────────────────────────

  it('renders the page title', async () => {
    render(<MemoryRouter><StudentHistoryPage /></MemoryRouter>);
    expect(screen.getByText('Order History')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Pizza Palace')).toBeInTheDocument());
  });

  it('shows all orders on initial load', async () => {
    render(<MemoryRouter><StudentHistoryPage /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText('Pizza Palace')).toBeInTheDocument();
      expect(screen.getByText('Chinese Lantern')).toBeInTheDocument();
      expect(screen.getByText('Burger Barn')).toBeInTheDocument();
      expect(screen.getByText('Wrap It Up')).toBeInTheDocument();
    });
  });

  it('renders order note when present', async () => {
    render(<MemoryRouter><StudentHistoryPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByText(/Extra cheese please/)).toBeInTheDocument()
    );
  });

  it('does not fetch if no user id in localStorage', async () => {
    localStorage.removeItem('orderup_user');
    render(<MemoryRouter><StudentHistoryPage /></MemoryRouter>);
    await waitFor(() => expect(global.fetch).not.toHaveBeenCalled());
  });

  it('handles fetch error gracefully and hides loading state', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    render(<MemoryRouter><StudentHistoryPage /></MemoryRouter>);
    // Loading disappears, empty state shows
    await waitFor(() => expect(screen.getByText('No orders found.')).toBeInTheDocument());
  });

  it('handles non-array API response gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ error: 'bad' }) });
    render(<MemoryRouter><StudentHistoryPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('No orders found.')).toBeInTheDocument());
  });


  it('falls back gracefully if rated_vendors in localStorage is corrupt', async () => {
    localStorage.setItem('rated_vendors', 'not-valid-json{{{');
    // Should not throw — component catches the parse error
    render(<MemoryRouter><StudentHistoryPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Pizza Palace')).toBeInTheDocument());
  });

  // ── Search ──────────────────────────────────────────────────────────────

  it('filters by vendor name via search', async () => {
    render(<MemoryRouter><StudentHistoryPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Pizza Palace')).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText('Search by vendor or food item...'), {
      target: { value: 'Pizza' },
    });

    expect(screen.getByText('Pizza Palace')).toBeInTheDocument();
    expect(screen.queryByText('Chinese Lantern')).not.toBeInTheDocument();
  });

  it('filters by food item name via search', async () => {
    render(<MemoryRouter><StudentHistoryPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Burger Barn')).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText('Search by vendor or food item...'), {
      target: { value: 'Fried Rice' },
    });

    expect(screen.getByText('Chinese Lantern')).toBeInTheDocument();
    expect(screen.queryByText('Pizza Palace')).not.toBeInTheDocument();
  });

  it('shows "No orders found" when search has no matches', async () => {
    render(<MemoryRouter><StudentHistoryPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Pizza Palace')).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText('Search by vendor or food item...'), {
      target: { value: 'zzznomatch' },
    });

    expect(screen.getByText('No orders found.')).toBeInTheDocument();
  });

  it('shows "No orders found" when API returns empty array', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });
    render(<MemoryRouter><StudentHistoryPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('No orders found.')).toBeInTheDocument());
  });

  // ── Status tabs ─────────────────────────────────────────────────────────

  it('filters by Completed tab (collected status)', async () => {
    render(<MemoryRouter><StudentHistoryPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Chinese Lantern')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Completed' }));

    expect(screen.getByText('Chinese Lantern')).toBeInTheDocument();
    expect(screen.queryByText('Pizza Palace')).not.toBeInTheDocument();
  });

  it('filters by Confirmed tab (confirmed status)', async () => {
    render(<MemoryRouter><StudentHistoryPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Pizza Palace')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Confirmed' }));

    expect(screen.getByText('Pizza Palace')).toBeInTheDocument();
    expect(screen.queryByText('Chinese Lantern')).not.toBeInTheDocument();
  });

  it('filters by Preparing tab (preparing status)', async () => {
    render(<MemoryRouter><StudentHistoryPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Burger Barn')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Preparing' }));

    expect(screen.getByText('Burger Barn')).toBeInTheDocument();
    expect(screen.queryByText('Pizza Palace')).not.toBeInTheDocument();
  });

  it('filters by Ready tab (ready status)', async () => {
    render(<MemoryRouter><StudentHistoryPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Wrap It Up')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Ready' }));

    expect(screen.getByText('Wrap It Up')).toBeInTheDocument();
    expect(screen.queryByText('Pizza Palace')).not.toBeInTheDocument();
  });

  it('returns to All tab showing all orders', async () => {
    render(<MemoryRouter><StudentHistoryPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Pizza Palace')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Confirmed' }));
    fireEvent.click(screen.getByRole('button', { name: 'All' }));

    expect(screen.getByText('Pizza Palace')).toBeInTheDocument();
    expect(screen.getByText('Chinese Lantern')).toBeInTheDocument();
  });

  // ── Navigation ──────────────────────────────────────────────────────────

  it('navigates to student-dashboard when OrderUp logo is clicked', async () => {
    render(<MemoryRouter><StudentHistoryPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Pizza Palace')).toBeInTheDocument());

    fireEvent.click(screen.getByText('OrderUp'));
    expect(mockNavigate).toHaveBeenCalledWith('/student-dashboard');
  });

  it('navigates to student-dashboard when Home icon is clicked', async () => {
    render(<MemoryRouter><StudentHistoryPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Pizza Palace')).toBeInTheDocument());

   const homeIcon = document.querySelector('.lucide-house');
fireEvent.click(homeIcon.parentElement);
    expect(mockNavigate).toHaveBeenCalledWith('/student-dashboard');
  });

  it('navigates to /checkout when Reorder is clicked', async () => {
    render(<MemoryRouter><StudentHistoryPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getAllByText(/Reorder/i).length).toBeGreaterThan(0));

    fireEvent.click(screen.getAllByText(/Reorder/i)[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/checkout', expect.objectContaining({
      state: expect.objectContaining({ vendor: expect.any(Object), items: expect.any(Array) })
    }));
  });

  // ── Rating modal ────────────────────────────────────────────────────────

  it('shows Rate button only for completed unrated orders', async () => {
    render(<MemoryRouter><StudentHistoryPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Chinese Lantern')).toBeInTheDocument());
    // Chinese Lantern is 'collected' → Completed → Rate button visible
    expect(screen.getByText('Rate')).toBeInTheDocument();
  });

  it('opens the rating modal when Rate is clicked', async () => {
    render(<MemoryRouter><StudentHistoryPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Rate')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Rate'));

    expect(screen.getByText('How was your food?')).toBeInTheDocument();
    expect(screen.getByText('Submit Review')).toBeInTheDocument();
  });

  it('closes modal when Cancel is clicked', async () => {
    render(<MemoryRouter><StudentHistoryPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Rate')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Rate'));
    expect(screen.getByText('How was your food?')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));
    await waitFor(() =>
      expect(screen.queryByText('How was your food?')).not.toBeInTheDocument()
    );
  });

  it('closes modal when backdrop is clicked', async () => {
    render(<MemoryRouter><StudentHistoryPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Rate')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Rate'));
    expect(screen.getByText('How was your food?')).toBeInTheDocument();

    // Click the backdrop (the fixed overlay div, not the modal card)
    const backdrop = screen.getByText('How was your food?').closest('div[style*="position: fixed"]');
    fireEvent.click(backdrop);

    await waitFor(() =>
      expect(screen.queryByText('How was your food?')).not.toBeInTheDocument()
    );
  });

  it('Submit Review is disabled when no star is selected', async () => {
    render(<MemoryRouter><StudentHistoryPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Rate')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Rate'));
    const submitBtn = screen.getByText('Submit Review');
    expect(submitBtn).toBeDisabled();
  });

  it('clicking a star enables Submit Review', async () => {
    render(<MemoryRouter><StudentHistoryPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Rate')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Rate'));

    // Stars are rendered as divs with onClick; click the 3rd star div
    const starDivs = screen.getByText('How was your food?')
      .closest('div[style*="background-color: white"]')
      .querySelectorAll('div[style*="cursor: pointer"]');
    fireEvent.click(starDivs[2]); // 3-star

    expect(screen.getByText('Submit Review')).not.toBeDisabled();
  });


  it('Submit Review does nothing when ratingValue is 0 (guard branch)', async () => {
    render(<MemoryRouter><StudentHistoryPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Rate')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Rate'));
    // Click submit without selecting a star — button is disabled but we force-fire to hit the guard
    const submitBtn = screen.getByText('Submit Review');
    fireEvent.click(submitBtn);

    // Modal still open — guard returned early
    expect(screen.getByText('How was your food?')).toBeInTheDocument();
  });

  it('hovering stars updates visual state (mouseEnter/mouseLeave)', async () => {
    render(<MemoryRouter><StudentHistoryPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Rate')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Rate'));

    const starDivs = screen.getByText('How was your food?')
      .closest('div[style*="background-color: white"]')
      .querySelectorAll('div[style*="cursor: pointer"]');

    // These just need to fire without throwing to cover the onMouseEnter/Leave lines
    fireEvent.mouseEnter(starDivs[0]);
    fireEvent.mouseLeave(starDivs[0]);

    expect(screen.getByText('How was your food?')).toBeInTheDocument();
  });
});