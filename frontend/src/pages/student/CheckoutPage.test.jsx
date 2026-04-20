import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import CheckoutPage from './CheckoutPage';

// Set up matchMedia mock for JSDOM
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

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({
      state: {
        vendor: { name: 'Test Vendor' },
        cart: { '1': 2 },
        items: [{ id: 1, name: 'Test Item', price: 50 }]
      }
    }),
    useNavigate: () => vi.fn()
  };
});

describe('CheckoutPage', () => {
  it('renders the checkout page successfully with mock state', () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.getByText('Test Vendor')).toBeInTheDocument();
    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });
});
