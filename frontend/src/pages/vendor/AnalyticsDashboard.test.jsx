import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AnalyticsBoard from './AnalyticsDashboard';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds a minimal fetch mock that resolves with the provided JSON bodies.
 * Call order matches the Promise.all order in the component:
 *   1. revenue  2. orders  3. customers
 */
function mockFetch({ revenue = [], orders = [], customers = [] } = {}) {
  const makeResponse = (data) =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data }),
    });

  return vi
    .fn()
    .mockImplementationOnce(() => makeResponse(revenue))
    .mockImplementationOnce(() => makeResponse(orders))
    .mockImplementationOnce(() => makeResponse(customers));
}

/** Sample data sets reused across tests */
const SAMPLE = {
  revenue: [
    { period: '2025-05-01', revenue: 2500 },
    { period: '2025-05-02', revenue: 1800 },
  ],
  orders: [
    { period: '2025-05-01', orders: 10 },
    { period: '2025-05-02', orders: 8 },
  ],
  customers: [
    { period: '2025-05-01', unique_customers: 7 },
    { period: '2025-05-02', unique_customers: 5 },
  ],
};

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  // Provide a dummy API URL so the fetch URLs resolve without throwing
  vi.stubEnv('VITE_API_URL', 'https://api.example.com');
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AnalyticsBoard', () => {

  // ── Rendering guards ──────────────────────────────────────────────────────

  describe('when vendor_id is missing', () => {
    it('does not call fetch', () => {
      const fetchSpy = vi.spyOn(global, 'fetch');
      render(<AnalyticsBoard />);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('shows loading state indefinitely (no data arrives)', () => {
      render(<AnalyticsBoard />);
      expect(screen.getByText(/loading analytics/i)).toBeInTheDocument();
    });
  });

  // ── Loading state ─────────────────────────────────────────────────────────

  describe('loading state', () => {
    it('shows the loading indicator while fetches are in-flight', () => {
      // Never resolve so we can inspect the loading state
      vi.spyOn(global, 'fetch').mockReturnValue(new Promise(() => {}));
      render(<AnalyticsBoard vendor_id="vendor-1" />);
      expect(screen.getByText(/loading analytics/i)).toBeInTheDocument();
    });

    it('hides the loading indicator once data arrives', async () => {
      global.fetch = mockFetch(SAMPLE);
      render(<AnalyticsBoard vendor_id="vendor-1" />);
      await waitFor(() =>
        expect(screen.queryByText(/loading analytics/i)).not.toBeInTheDocument()
      );
    });
  });

  // ── KPI calculations ──────────────────────────────────────────────────────

  /**
   * The component renders currency as:
   *   <h3>R {value.toLocaleString()}</h3>
   *
   * Two quirks to handle in tests:
   *   1. The "R" and the number are in *separate text nodes* inside the <h3>,
   *      so a plain string/regex can't match the full "R 4 300" in one shot.
   *      We use a custom matcher that collapses all child text content first.
   *   2. toLocaleString() uses the test runner's locale. On South African
   *      machines it emits a narrow no-break space (U+202F) as the thousands
   *      separator ("4 300"), not a comma ("4,300"). The custom matcher
   *      normalises any whitespace character so either locale passes.
   */
  const byKpiText = (expected) => (_, element) => {
    // Collapse all text nodes inside the element, normalise whitespace
    const full = (element.textContent || '').replace(/\s+/g, ' ').trim();
    return typeof expected === 'string'
      ? full === expected
      : expected.test(full);
  };

  describe('KPI calculations', () => {
    it('sums revenue correctly', async () => {
      global.fetch = mockFetch(SAMPLE);
      render(<AnalyticsBoard vendor_id="vendor-1" />);

      // 2500 + 1800 = 4300 — locale may format as "4,300" or "4 300"
      await waitFor(() =>
        expect(screen.getByText(byKpiText(/^R\s+4.300$/))).toBeInTheDocument()
      );
    });

    it('sums orders correctly', async () => {
      global.fetch = mockFetch(SAMPLE);
      render(<AnalyticsBoard vendor_id="vendor-1" />);

      // 10 + 8 = 18
      await waitFor(() =>
        expect(screen.getByText('18')).toBeInTheDocument()
      );
    });

    it('sums active customers correctly', async () => {
      global.fetch = mockFetch(SAMPLE);
      render(<AnalyticsBoard vendor_id="vendor-1" />);

      // 7 + 5 = 12
      await waitFor(() =>
        expect(screen.getByText('12')).toBeInTheDocument()
      );
    });

    it('calculates average revenue per order correctly', async () => {
      global.fetch = mockFetch(SAMPLE);
      render(<AnalyticsBoard vendor_id="vendor-1" />);

      // 4300 / 18 ≈ 238.89 — "R" and "238.89" are separate text nodes
      await waitFor(() =>
        expect(screen.getByText(byKpiText(/^R\s+238\.89$/))).toBeInTheDocument()
      );
    });

    it('shows R 0.00 average revenue when there are no orders', async () => {
      global.fetch = mockFetch({ ...SAMPLE, orders: [] });
      render(<AnalyticsBoard vendor_id="vendor-1" />);

      // "R" and "0.00" are separate text nodes inside the <h3>
      await waitFor(() =>
        expect(screen.getByText(byKpiText(/^R\s+0\.00$/))).toBeInTheDocument()
      );
    });

    it('handles missing/null revenue values gracefully', async () => {
      const revenue = [{ period: '2025-05-01', revenue: null }];
      global.fetch = mockFetch({ ...SAMPLE, revenue });
      render(<AnalyticsBoard vendor_id="vendor-1" />);

      // Total revenue card should show "R 0" — use the label to scope the lookup
      await waitFor(() => {
        const card = screen.getByText('Total Revenue').closest('div');
        expect(card.querySelector('h3').textContent.replace(/\s+/g, ' ').trim()).toBe('R 0');
      });
    });

    it('handles empty data arrays without crashing', async () => {
      global.fetch = mockFetch({ revenue: [], orders: [], customers: [] });
      render(<AnalyticsBoard vendor_id="vendor-1" />);

      await waitFor(() =>
        expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
      );
    });
  });

  // ── Static UI ─────────────────────────────────────────────────────────────

  describe('static UI', () => {
    it('renders all four KPI card labels', async () => {
      global.fetch = mockFetch(SAMPLE);
      render(<AnalyticsBoard vendor_id="vendor-1" />);

      await waitFor(() => {
        expect(screen.getByText('Total Revenue')).toBeInTheDocument();
        expect(screen.getByText('Total Orders')).toBeInTheDocument();
        expect(screen.getByText('Active Customers')).toBeInTheDocument();
        expect(screen.getByText('Average Revenue Per Order')).toBeInTheDocument();
      });
    });

    it('renders the range selector with all three options', async () => {
      global.fetch = mockFetch(SAMPLE);
      render(<AnalyticsBoard vendor_id="vendor-1" />);

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
        expect(screen.getByText('This Week')).toBeInTheDocument();
        expect(screen.getByText('This Month')).toBeInTheDocument();
        expect(screen.getByText('Last 3 Months')).toBeInTheDocument();
      });
    });

    it('defaults the range selector to "month"', async () => {
      global.fetch = mockFetch(SAMPLE);
      render(<AnalyticsBoard vendor_id="vendor-1" />);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        expect(select.value).toBe('month');
      });
    });
  });

  // ── Range selector interaction ────────────────────────────────────────────

  describe('range selector', () => {
    it('re-fetches data when the range changes', async () => {
      // Provide enough mock responses for two fetches (initial + refetch)
      const makeResponse = (data) =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ data }) });

      global.fetch = vi
        .fn()
        // --- first fetch (month) ---
        .mockImplementationOnce(() => makeResponse(SAMPLE.revenue))
        .mockImplementationOnce(() => makeResponse(SAMPLE.orders))
        .mockImplementationOnce(() => makeResponse(SAMPLE.customers))
        // --- second fetch (week) ---
        .mockImplementationOnce(() => makeResponse([{ period: '2025-05-05', revenue: 500 }]))
        .mockImplementationOnce(() => makeResponse([{ period: '2025-05-05', orders: 2 }]))
        .mockImplementationOnce(() => makeResponse([{ period: '2025-05-05', unique_customers: 1 }]));

      render(<AnalyticsBoard vendor_id="vendor-1" />);

      // Wait for first render to finish
      await waitFor(() =>
        expect(screen.queryByText(/loading analytics/i)).not.toBeInTheDocument()
      );

      const callsBefore = global.fetch.mock.calls.length;

      fireEvent.change(screen.getByRole('combobox'), {
        target: { value: 'week' },
      });

      await waitFor(() =>
        expect(global.fetch.mock.calls.length).toBeGreaterThan(callsBefore)
      );
    });

    it('includes the selected range in the fetch URL', async () => {
      global.fetch = mockFetch(SAMPLE);
      render(<AnalyticsBoard vendor_id="vendor-1" />);

      await waitFor(() =>
        expect(screen.queryByText(/loading analytics/i)).not.toBeInTheDocument()
      );

      // Initial fetch should use the default 'month' range
      const urls = global.fetch.mock.calls.map(([url]) => url);
      expect(urls.every((url) => url.includes('range=month'))).toBe(true);
    });
  });

  // ── Error handling ────────────────────────────────────────────────────────

  describe('error handling', () => {
    it('resets all KPIs to 0 when a fetch returns a non-ok response', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({}),
      });

      render(<AnalyticsBoard vendor_id="vendor-1" />);

      await waitFor(() =>
        expect(screen.queryByText(/loading analytics/i)).not.toBeInTheDocument()
      );

      // Revenue card shows "R 0", avg card shows "R 0.00" — check both via label scoping
      const revenueCard = screen.getByText('Total Revenue').closest('div');
      expect(revenueCard.querySelector('h3').textContent.replace(/\s+/g, ' ').trim()).toBe('R 0');

      const avgCard = screen.getByText('Average Revenue Per Order').closest('div');
      expect(avgCard.querySelector('h3').textContent.replace(/\s+/g, ' ').trim()).toBe('R 0.00');
    });

    it('resets all KPIs to 0 when fetch rejects (network error)', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

      render(<AnalyticsBoard vendor_id="vendor-1" />);

      await waitFor(() =>
        expect(screen.queryByText(/loading analytics/i)).not.toBeInTheDocument()
      );

      const revenueCard = screen.getByText('Total Revenue').closest('div');
      expect(revenueCard.querySelector('h3').textContent.replace(/\s+/g, ' ').trim()).toBe('R 0');
    });

    it('logs the error to the console on failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(global, 'fetch').mockRejectedValue(new Error('boom'));

      render(<AnalyticsBoard vendor_id="vendor-1" />);

      await waitFor(() =>
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to fetch analytics:',
          expect.any(Error)
        )
      );
    });
  });

  // ── Vendor isolation ──────────────────────────────────────────────────────

  describe('vendor_id in fetch URL', () => {
    it('includes the vendor_id in every request URL', async () => {
      global.fetch = mockFetch(SAMPLE);
      render(<AnalyticsBoard vendor_id="vendor-42" />);

      await waitFor(() =>
        expect(screen.queryByText(/loading analytics/i)).not.toBeInTheDocument()
      );

      const urls = global.fetch.mock.calls.map(([url]) => url);
      expect(urls.every((url) => url.includes('vendor-42'))).toBe(true);
    });
  });
});