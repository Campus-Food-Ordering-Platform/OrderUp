import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import OrderConfirmedPage from './OrderConfirmedPage';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({
      state: {
        vendor: { name: 'Test Vendor', wait: 15 },
        total: 85,
        note: 'No onions please'
      }
    }),
    useNavigate: () => vi.fn()
  };
});

describe('OrderConfirmedPage', () => {
  it('renders the Order Placed heading', () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    expect(screen.getByText(/Order Placed/i)).toBeInTheDocument();
  });

  it('displays the vendor name in the confirmation message', () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    expect(screen.getAllByText(/Test Vendor/i)[0]).toBeInTheDocument();
  });

  it('shows the Live Order Status tracker section', () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    expect(screen.getByText(/Live Order Status/i)).toBeInTheDocument();
  });

  it('displays the special instructions note when provided', () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    expect(screen.getByText(/No onions please/i)).toBeInTheDocument();
  });

  it('shows the collection point information', () => {
    render(<MemoryRouter><OrderConfirmedPage /></MemoryRouter>);
    expect(screen.getByText(/The Matrix Food Court/i)).toBeInTheDocument();
  });
});
