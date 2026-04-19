import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import VendorDashboard from './VendorDashboard';

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

describe('VendorDashboard', () => {
  it('renders Jimmy\'s Dashboard', () => {
    render(<MemoryRouter><VendorDashboard /></MemoryRouter>);
    expect(screen.getByText(/Jimmy's Dashboard/i)).toBeInTheDocument();
  });

  it('switches to the Menu tab', () => {
    render(<MemoryRouter><VendorDashboard /></MemoryRouter>);
    
    // Switch to Menu
    fireEvent.click(screen.getByText('Menu'));
    expect(screen.getByText('Menu Items')).toBeInTheDocument();
  });

  it('switches to the Analytics tab', () => {
    render(<MemoryRouter><VendorDashboard /></MemoryRouter>);
    
    // Switch to Analytics
    fireEvent.click(screen.getByText('Analytics'));
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Top Selling Items')).toBeInTheDocument();
  });
});
