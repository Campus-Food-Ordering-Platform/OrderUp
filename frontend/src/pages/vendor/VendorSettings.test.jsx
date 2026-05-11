import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

/**
 * Builds a fetch mock that resolves the status + vendor detail chain.
 * Optionally accepts overrides so individual tests can simulate failures.
 */
function buildFetch({ statusOk = true, vendorOk = true, saveOk = true, vendorData = MOCK_VENDOR } = {}) {
  return vi.fn().mockImplementation((url, opts) => {
    // Status endpoint
    if (url.includes('/api/vendors/status')) {
      if (!statusOk) return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
      return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_STATUS) });
    }
    // Vendor detail endpoint (GET)
    if (url.includes('/api/vendors/vendor-456') && (!opts || opts.method !== 'PUT')) {
      if (!vendorOk) return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
      return Promise.resolve({ ok: true, json: () => Promise.resolve(vendorData) });
    }
    // Update endpoint (PUT)
    if (url.includes('/api/vendors/vendor-456') && opts?.method === 'PUT') {
      return Promise.resolve({ ok: saveOk, json: () => Promise.resolve({}) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
}

/** Sets the localStorage user entry used by fetchVendorData */
function setLocalUser(data = MOCK_USER) {
  localStorage.setItem('orderup_user', JSON.stringify(data));
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.stubEnv('VITE_API_URL', 'https://api.example.com');
  localStorage.clear();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('VendorSettings', () => {

  // ── Auth guard ────────────────────────────────────────────────────────────

  describe('auth guard', () => {
    it('redirects to "/" when there is no user in localStorage', async () => {
      // No user set — fetchVendorData should call navigate('/')
      // With MemoryRouter we can observe that the loading screen disappears
      // (the component returns early and stops loading)
      global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

      renderWithRouter(<VendorSettings />);

      // Component should stop showing loading once it redirects
      await waitFor(() =>
        expect(screen.queryByText(/loading vendor information/i)).not.toBeInTheDocument()
      );
    });

    it('redirects when localStorage value is unparseable', async () => {
      localStorage.setItem('orderup_user', 'not-json');
      global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

      renderWithRouter(<VendorSettings />);

      await waitFor(() =>
        expect(screen.queryByText(/loading vendor information/i)).not.toBeInTheDocument()
      );
    });
  });

  // ── Loading state ─────────────────────────────────────────────────────────

  describe('loading state', () => {
    it('shows loading indicator while fetches are in-flight', async () => {
      setLocalUser();
      global.fetch = vi.fn().mockReturnValue(new Promise(() => {})); // never resolves
      renderWithRouter(<VendorSettings />);
      expect(screen.getByText(/loading vendor information/i)).toBeInTheDocument();
    });

    it('hides loading indicator once vendor data arrives', async () => {
      setLocalUser();
      global.fetch = buildFetch();
      renderWithRouter(<VendorSettings />);
      await waitFor(() =>
        expect(screen.queryByText(/loading vendor information/i)).not.toBeInTheDocument()
      );
    });
  });

  // ── Initial data population ───────────────────────────────────────────────

  describe('data population from API', () => {
    it('populates the stall name input with fetched vendor name', async () => {
      setLocalUser();
      global.fetch = buildFetch();
      renderWithRouter(<VendorSettings />);
      await waitFor(() =>
        expect(screen.getByPlaceholderText('Enter your stall name').value).toBe('Sunrise Cafe')
      );
    });

    it('populates the description textarea', async () => {
      setLocalUser();
      global.fetch = buildFetch();
      renderWithRouter(<VendorSettings />);
      await waitFor(() =>
        expect(screen.getByPlaceholderText(/Describe your stall/i).value).toBe('Best coffee in town')
      );
    });

    it('populates the location input', async () => {
      setLocalUser();
      global.fetch = buildFetch();
      renderWithRouter(<VendorSettings />);
      await waitFor(() =>
        expect(screen.getByPlaceholderText(/Matrix Food Court/i).value).toBe('Block 3, Stall 5')
      );
    });

    it('populates operating hours input', async () => {
      setLocalUser();
      global.fetch = buildFetch();
      renderWithRouter(<VendorSettings />);
      await waitFor(() =>
        expect(screen.getByPlaceholderText(/09:00 - 21:00/i).value).toBe('08:00 - 18:00')
      );
    });

    it('populates phone input', async () => {
      setLocalUser();
      global.fetch = buildFetch();
      renderWithRouter(<VendorSettings />);
      await waitFor(() =>
        expect(screen.getByPlaceholderText(/0825550192/i).value).toBe('0825550192')
      );
    });

    it('populates email input', async () => {
      setLocalUser();
      global.fetch = buildFetch();
      renderWithRouter(<VendorSettings />);
      await waitFor(() =>
        expect(screen.getByPlaceholderText('your@email.com').value).toBe('sunrise@cafe.com')
      );
    });

    it('picks the first item from the category array', async () => {
      setLocalUser();
      global.fetch = buildFetch();
      renderWithRouter(<VendorSettings />);
      await waitFor(() =>
        expect(screen.getByRole('combobox').value).toBe('Cafe')
      );
    });

    it('handles vendor data with missing optional fields gracefully', async () => {
      setLocalUser();
      global.fetch = buildFetch({ vendorData: { name: 'Empty Stall' } });
      renderWithRouter(<VendorSettings />);
      await waitFor(() =>
        expect(screen.getByPlaceholderText('Enter your stall name').value).toBe('Empty Stall')
      );
    });
  });

  // ── Static UI ─────────────────────────────────────────────────────────────

  describe('static UI after load', () => {
    beforeEach(async () => {
      setLocalUser();
      global.fetch = buildFetch();
      renderWithRouter(<VendorSettings />);
      await waitFor(() =>
        expect(screen.queryByText(/loading vendor information/i)).not.toBeInTheDocument()
      );
    });

    it('renders the "Vendor Settings" header', () => {
      expect(screen.getByText('Vendor Settings')).toBeInTheDocument();
    });

    it('renders the "Edit Vendor Information" sub-heading', () => {
      expect(screen.getByText('Edit Vendor Information')).toBeInTheDocument();
    });

    it('renders the Save Changes button', () => {
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });

    it('renders the preview section with current vendor name', () => {
      expect(screen.getByText('Sunrise Cafe')).toBeInTheDocument();
    });

    it('renders preview location', () => {
      expect(screen.getByText(/Block 3, Stall 5/)).toBeInTheDocument();
    });

    it('renders preview operating hours', () => {
      expect(screen.getByText(/08:00 - 18:00/)).toBeInTheDocument();
    });

    it('renders category select with all expected options', () => {
      const select = screen.getByRole('combobox');
      const options = Array.from(select.options).map(o => o.value);
      expect(options).toContain('Fast Food');
      expect(options).toContain('Cafe');
      expect(options).toContain('Asian');
      expect(options).toContain('Pizza');
      expect(options).toContain('Healthy');
      expect(options).toContain('Indian');
    });
  });

  // ── Field interactions ────────────────────────────────────────────────────

  describe('field interactions', () => {
    beforeEach(async () => {
      setLocalUser();
      global.fetch = buildFetch();
      renderWithRouter(<VendorSettings />);
      await waitFor(() =>
        expect(screen.queryByText(/loading vendor information/i)).not.toBeInTheDocument()
      );
    });

    it('updates stall name when user types', async () => {
      const input = screen.getByPlaceholderText('Enter your stall name');
      await userEvent.clear(input);
      await userEvent.type(input, 'New Name');
      expect(input.value).toBe('New Name');
    });

    it('updates description when user types', async () => {
      const textarea = screen.getByPlaceholderText(/Describe your stall/i);
      await userEvent.clear(textarea);
      await userEvent.type(textarea, 'Updated description');
      expect(textarea.value).toBe('Updated description');
    });

    it('updates location when user types', async () => {
      const input = screen.getByPlaceholderText(/Matrix Food Court/i);
      await userEvent.clear(input);
      await userEvent.type(input, 'New Location');
      expect(input.value).toBe('New Location');
    });

    it('updates category via select', async () => {
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Pizza' } });
      expect(screen.getByRole('combobox').value).toBe('Pizza');
    });

    it('updates phone number', async () => {
      const input = screen.getByPlaceholderText(/0825550192/i);
      await userEvent.clear(input);
      await userEvent.type(input, '0834567890');
      expect(input.value).toBe('0834567890');
    });

    it('updates email', async () => {
      const input = screen.getByPlaceholderText('your@email.com');
      await userEvent.clear(input);
      await userEvent.type(input, 'new@email.com');
      expect(input.value).toBe('new@email.com');
    });

    it('updates operating hours', async () => {
      const input = screen.getByPlaceholderText(/09:00 - 21:00/i);
      await userEvent.clear(input);
      await userEvent.type(input, '10:00 - 20:00');
      expect(input.value).toBe('10:00 - 20:00');
    });
  });

  // ── Validation ────────────────────────────────────────────────────────────

  describe('validation', () => {
    beforeEach(async () => {
      setLocalUser();
      global.fetch = buildFetch();
      renderWithRouter(<VendorSettings />);
      await waitFor(() =>
        expect(screen.queryByText(/loading vendor information/i)).not.toBeInTheDocument()
      );
    });

    it('shows error toast when stall name is cleared and saved', async () => {
      const input = screen.getByPlaceholderText('Enter your stall name');
      await userEvent.clear(input);
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
      await waitFor(() =>
        expect(screen.getByText('Stall name is required')).toBeInTheDocument()
      );
    });

    it('shows error toast when location is cleared and saved', async () => {
      const input = screen.getByPlaceholderText(/Matrix Food Court/i);
      await userEvent.clear(input);
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
      await waitFor(() =>
        expect(screen.getByText('Location is required')).toBeInTheDocument()
      );
    });

    it('shows error for invalid phone number (too short)', async () => {
      const input = screen.getByPlaceholderText(/0825550192/i);
      await userEvent.clear(input);
      await userEvent.type(input, '12345');
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
      await waitFor(() =>
        expect(screen.getByText(/valid 10-digit phone number/i)).toBeInTheDocument()
      );
    });

    it('accepts a valid 10-digit phone number', async () => {
      const input = screen.getByPlaceholderText(/0825550192/i);
      await userEvent.clear(input);
      await userEvent.type(input, '0825551234');
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
      await waitFor(() =>
        expect(screen.queryByText(/valid 10-digit phone number/i)).not.toBeInTheDocument()
      );
    });

    it('shows error for malformed email address', async () => {
      const input = screen.getByPlaceholderText('your@email.com');
      await userEvent.clear(input);
      await userEvent.type(input, 'bad-email');
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
      await waitFor(() =>
        expect(screen.getByText(/valid email address/i)).toBeInTheDocument()
      );
    });

    it('accepts a valid email address', async () => {
      const input = screen.getByPlaceholderText('your@email.com');
      await userEvent.clear(input);
      await userEvent.type(input, 'valid@email.com');
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
      await waitFor(() =>
        expect(screen.queryByText(/valid email address/i)).not.toBeInTheDocument()
      );
    });

    it('allows empty phone (field is optional)', async () => {
      const input = screen.getByPlaceholderText(/0825550192/i);
      await userEvent.clear(input);
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
      await waitFor(() =>
        expect(screen.queryByText(/valid 10-digit phone number/i)).not.toBeInTheDocument()
      );
    });

    it('allows empty email (field is optional)', async () => {
      const input = screen.getByPlaceholderText('your@email.com');
      await userEvent.clear(input);
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
      await waitFor(() =>
        expect(screen.queryByText(/valid email address/i)).not.toBeInTheDocument()
      );
    });
  });

  // ── Save success ──────────────────────────────────────────────────────────

  describe('save — success flow', () => {
    beforeEach(async () => {
      setLocalUser();
      global.fetch = buildFetch();
      renderWithRouter(<VendorSettings />);
      await waitFor(() =>
        expect(screen.queryByText(/loading vendor information/i)).not.toBeInTheDocument()
      );
    });

    it('shows "Saving..." label while the PUT is in-flight', async () => {
      // Hold the PUT response
      global.fetch = buildFetch();
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
      await waitFor(() =>
        expect(screen.getByText('Saving...')).toBeInTheDocument()
      );
    });

    it('disables the save button while saving', async () => {
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
      );
    });

    it('shows success toast after a successful save', async () => {
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
      await waitFor(() =>
        expect(screen.getByText(/Profile updated successfully/i)).toBeInTheDocument()
      );
    });

    it('sends the vendor data as JSON in the PUT body', async () => {
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
      await waitFor(() =>
        expect(screen.getByText(/Profile updated successfully/i)).toBeInTheDocument()
      );
      const putCall = global.fetch.mock.calls.find(
        ([url, opts]) => url.includes('vendor-456') && opts?.method === 'PUT'
      );
      expect(putCall).toBeDefined();
      const body = JSON.parse(putCall[1].body);
      expect(body.name).toBe('Sunrise Cafe');
    });

    it('wraps category as an array in the PUT body', async () => {
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
      await waitFor(() =>
        expect(screen.getByText(/Profile updated successfully/i)).toBeInTheDocument()
      );
      const putCall = global.fetch.mock.calls.find(
        ([url, opts]) => url.includes('vendor-456') && opts?.method === 'PUT'
      );
      const body = JSON.parse(putCall[1].body);
      expect(Array.isArray(body.category)).toBe(true);
      expect(body.category).toContain('Cafe');
    });

    it('sends an empty category array when no category is selected', async () => {
      fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } });
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
      await waitFor(() =>
        expect(screen.getByText(/Profile updated successfully/i)).toBeInTheDocument()
      );
      const putCall = global.fetch.mock.calls.find(
        ([url, opts]) => url.includes('vendor-456') && opts?.method === 'PUT'
      );
      const body = JSON.parse(putCall[1].body);
      expect(body.category).toEqual([]);
    });
  });

  // ── Save failure ──────────────────────────────────────────────────────────

  describe('save — failure flow', () => {
    beforeEach(async () => {
      setLocalUser();
      global.fetch = buildFetch({ saveOk: false });
      renderWithRouter(<VendorSettings />);
      await waitFor(() =>
        expect(screen.queryByText(/loading vendor information/i)).not.toBeInTheDocument()
      );
    });

    it('shows error toast when the PUT returns a non-ok response', async () => {
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
      await waitFor(() =>
        expect(screen.getByText(/Failed to save changes/i)).toBeInTheDocument()
      );
    });

    it('re-enables the save button after a failed save', async () => {
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /save changes/i })).not.toBeDisabled()
      );
    });
  });

  // ── Fetch error handling ──────────────────────────────────────────────────

  describe('fetch error handling', () => {
    it('shows error toast when the initial vendor fetch fails', async () => {
      setLocalUser();
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      renderWithRouter(<VendorSettings />);
      await waitFor(() =>
        expect(screen.getByText(/Failed to load vendor information/i)).toBeInTheDocument()
      );
    });

    it('logs errors to the console when fetch fails', async () => {
      setLocalUser();
      global.fetch = vi.fn().mockRejectedValue(new Error('boom'));
      renderWithRouter(<VendorSettings />);
      await waitFor(() =>
        expect(console.error).toHaveBeenCalled()
      );
    });
  });

  // ── Preview section ───────────────────────────────────────────────────────

  describe('live preview', () => {
    beforeEach(async () => {
      setLocalUser();
      global.fetch = buildFetch();
      renderWithRouter(<VendorSettings />);
      await waitFor(() =>
        expect(screen.queryByText(/loading vendor information/i)).not.toBeInTheDocument()
      );
    });

    it('shows "Stall Name" placeholder in preview when name is cleared', async () => {
      const input = screen.getByPlaceholderText('Enter your stall name');
      await userEvent.clear(input);
      // The preview renders vendorData.name || 'Stall Name' inside a <strong>.
      // getAllByText because the input placeholder also contains "Stall Name".
      const matches = screen.getAllByText('Stall Name');
      const inPreview = matches.some(el => el.tagName === 'STRONG');
      expect(inPreview).toBe(true);
    });

    it('shows "No description yet" in preview when description is cleared', async () => {
      const textarea = screen.getByPlaceholderText(/Describe your stall/i);
      await userEvent.clear(textarea);
      expect(screen.getByText('No description yet')).toBeInTheDocument();
    });

    it('shows "Location not set" in preview when location is cleared', async () => {
      const input = screen.getByPlaceholderText(/Matrix Food Court/i);
      await userEvent.clear(input);
      expect(screen.getByText(/Location not set/)).toBeInTheDocument();
    });

    it('updates preview name in real time as user types', async () => {
      const input = screen.getByPlaceholderText('Enter your stall name');
      await userEvent.clear(input);
      await userEvent.type(input, 'Moonrise Grill');
      expect(screen.getByText('Moonrise Grill')).toBeInTheDocument();
    });

    it('truncates description to 100 chars in preview', async () => {
      const textarea = screen.getByPlaceholderText(/Describe your stall/i);
      // Use fireEvent (not userEvent.type) to instantly set a long value —
      // userEvent.type is character-by-character and causes test timeouts.
      fireEvent.change(textarea, { target: { value: 'B'.repeat(200) } });
      // The preview renders description.substring(0, 100).
      // Find the preview container (the orange-bordered box below the form card).
      const previewSection = screen.getByText(/How students see you/i).closest('div');
      // The preview <p> should contain exactly 100 Bs, not 200.
      const previewText = previewSection.querySelector('p').textContent;
      expect(previewText).toBe('B'.repeat(100));
    });
  });

  // ── userId resolution ─────────────────────────────────────────────────────

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