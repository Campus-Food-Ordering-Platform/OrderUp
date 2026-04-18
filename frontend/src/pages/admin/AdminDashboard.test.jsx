import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AdminDashboard', () => {
  it('renders overview tab by default', () => {
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Total Vendors')).toBeInTheDocument();
  });

  it('switches to Vendors tab and displays vendor logic', () => {
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    
    const vendorsTab = screen.getByText('Vendors');
    fireEvent.click(vendorsTab);
    
    expect(screen.getByPlaceholderText('Search vendors or owners...')).toBeInTheDocument();
    expect(screen.getByText('Chinese Lantern')).toBeInTheDocument();
  });

  it('filters pending vendors and opens review modal', () => {
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    
    // Switch to Vendors
    fireEvent.click(screen.getByText('Vendors'));
    
    // Click Pending filter using a matcher to ignore the badge span
    fireEvent.click(screen.getByRole('button', { name: /Pending/i }));
    
    // Xpresso Cafe is pending. Chinese Lantern should ideally be hidden
    expect(screen.getByText('Xpresso Cafe')).toBeInTheDocument();
    expect(screen.queryByText('Chinese Lantern')).not.toBeInTheDocument();

    // Click Review Forms button
    const reviewButtons = screen.getAllByText('Review Forms');
    fireEvent.click(reviewButtons[0]);

    // Modal should appear
    expect(screen.getByText('Application Review')).toBeInTheDocument();
    
    // Check if the mock application details rendered
    expect(screen.getByText(/Valid \(Expires Nov 2026\)/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Approve Vendor'));
  });

  it('switches to Disputes tab and searches', () => {
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    
    fireEvent.click(screen.getByText('Disputes'));
    expect(screen.getByText('Order Lookup & Disputes')).toBeInTheDocument();
    
    const searchInput = screen.getByPlaceholderText('Search by Order ID (e.g. 45), student, or vendor...');
    fireEvent.change(searchInput, { target: { value: 'Jimmy' } });
    
    // Should see Jimmys orders but not Pizza Palace
    expect(screen.getByText('Samele Hlatswayo')).toBeInTheDocument();
    expect(screen.queryByText('Thabo Mokoena')).not.toBeInTheDocument();
  });
});
