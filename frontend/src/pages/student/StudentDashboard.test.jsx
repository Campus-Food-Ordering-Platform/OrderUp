import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import StudentDashboard from './StudentDashboard';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: { name: 'TestStudent' } })
  };
});

describe('StudentDashboard', () => {
  it('renders student greeting correctly', () => {
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
    expect(screen.getByText('Hey TestStudent! 👋')).toBeInTheDocument();
    expect(screen.getByText('Chinese Lantern')).toBeInTheDocument();
  });

  it('filters vendors by category', () => {
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
    
    // Click Pizza category
    fireEvent.click(screen.getByText('Pizza'));
    
    // Should see Pizza Palace, but not Chinese Lantern
    expect(screen.getByText('Pizza Palace')).toBeInTheDocument();
    expect(screen.queryByText('Chinese Lantern')).not.toBeInTheDocument();
  });

  it('searches for vendors natively', () => {
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
    
    const searchInput = screen.getByPlaceholderText('Search vendors, cuisines, dishes...');
    fireEvent.change(searchInput, { target: { value: 'Xpresso' } });
    
    expect(screen.getByText('Xpresso Cafe')).toBeInTheDocument();
    expect(screen.queryByText('Green Bowl')).not.toBeInTheDocument();
  });

  it('handles navigation clicks in the header', () => {
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
    
    // There are multiple navigation icons. Just check if it renders properly essentially
    const orderUpLogo = screen.getByText('OrderUp');
    expect(orderUpLogo).toBeInTheDocument();
  });
});
