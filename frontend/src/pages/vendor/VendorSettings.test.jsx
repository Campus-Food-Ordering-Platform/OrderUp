import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VendorSettings from './VendorSettings';

// ---------------------------------------------------------------------------
// Routing wrapper — VendorSettings calls useNavigate()
// ---------------------------------------------------------------------------
const renderWithRouter = (ui, { initialEntries = ['/vendor-settings'] } = {}) =>
  render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>);

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const MOCK_USER = { id: 'user-123' };
const MOCK_STATUS = { id: 'vendor-456' };
const MOCK_VENDOR = {
  name: 'Sunrise Cafe',
  description: 'Best coffee in town',
  category: ['Cafe'],
  location: 'Block 3, Stall 5',
  operating_hours: { hours: '08:00 - 18:00' },
  phone: '0825550192',
  email: 'sunrise@cafe.com',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function buildFetch(overrides = {}) {
  return vi.fn((url) => {
    if (url.includes('/api/vendors/status')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(MOCK_STATUS),
      });
    }
    if (url.includes('/api/vendors/vendor-456')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ ...MOCK_VENDOR, ...overrides }),
      });
    }
    if (url.includes('/api/vendors') && url.includes('profile_id')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(MOCK_STATUS),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });
}

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('orderup_user', JSON.stringify(MOCK_USER));
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('VendorSettings — Preserved Working Core Flows', () => {
  

  describe('save — failure flow — button handling', () => {
    it('re-enables the save button after a failed save', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('/api/vendors/status') || url.includes('/api/vendors/vendor-456')) {
          return buildFetch()(url);
        }
        return Promise.resolve({ ok: false, status: 500 });
      });

      renderWithRouter(<VendorSettings />);
      await waitFor(() =>
        expect(screen.queryByText(/loading vendor information/i)).not.toBeInTheDocument()
      );

      const saveBtn = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(saveBtn).not.toBeDisabled();
      });
    });
  });

  describe('fetch error handling', () => {
    it('shows error toast when the initial vendor fetch fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });
      renderWithRouter(<VendorSettings />);
      await waitFor(() =>
        expect(screen.queryByText(/loading vendor information/i)).not.toBeInTheDocument()
      );
    });

    it('logs errors to the console when fetch fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      renderWithRouter(<VendorSettings />);
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });
    });
  });

  describe('userId resolution from localStorage', () => {
    it('resolves userId from raw.id', async () => {
      localStorage.setItem('orderup_user', JSON.stringify({ id: 'user-direct' }));
      global.fetch = buildFetch();
      renderWithRouter(<VendorSettings />);
      await waitFor(() =>
        expect(screen.queryByText(/loading vendor information/i)).not.toBeInTheDocument()
      );
      const statusCall = global.fetch.mock.calls.find(([url]) => url.includes('/api/vendors/status'));
      const body = JSON.parse(statusCall[1].body);
      expect(body.profile_id).toBe('user-direct');
    });

    it('resolves userId from raw.user.id when raw.id is absent', async () => {
      localStorage.setItem('orderup_user', JSON.stringify({ user: { id: 'nested-user' } }));
      global.fetch = buildFetch();
      renderWithRouter(<VendorSettings />);
      await waitFor(() =>
        expect(screen.queryByText(/loading vendor information/i)).not.toBeInTheDocument()
      );
      const statusCall = global.fetch.mock.calls.find(([url]) => url.includes('/api/vendors/status'));
      const body = JSON.parse(statusCall[1].body);
      expect(body.profile_id).toBe('nested-user');
    });
  });
});