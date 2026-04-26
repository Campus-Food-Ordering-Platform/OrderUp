import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import VendorDashboard from './VendorDashboard';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const mockUser = { id: 'test_user_123' };
const localStorageMock = {
  getItem: vi.fn().mockImplementation((key) => {
    if (key === 'orderup_user') return JSON.stringify({ user: mockUser });
    return null;
  }),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

global.fetch = vi.fn();

describe('VendorDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // The orders endpoint returns an array, not a vendor object.
    // Using a single mockResolvedValue for all fetch calls meant
    // setOrders() received an object, causing orders.filter() to crash.
    // Now each URL pattern gets the correct response shape.
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/orders/vendor/'))
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      if (url.includes('/menu'))
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      if (url.includes('/api/vendors/register'))
        return Promise.resolve({ ok: true, json: () => Promise.resolve({
          id: 'mock_vendor_id',
          stall_name: 'Test Vendor',
          phone: '1234567890',
          description: 'Test vendor desc',
          status: 'approved'
        })});
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  it('renders the vendor dashboard and header', async () => {
    render(<MemoryRouter><VendorDashboard /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText('Menu')).toBeInTheDocument();
    });
  });

  it('switches to the Menu tab', async () => {
    render(<MemoryRouter><VendorDashboard /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText('Menu')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Menu'));
    await waitFor(() => {
      expect(screen.getByText(/Loading menu/i)).toBeInTheDocument();
    });
  });

  it('switches to the Analytics tab', async () => {
    render(<MemoryRouter><VendorDashboard /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Analytics'));
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Top Selling Items')).toBeInTheDocument();
  });
});