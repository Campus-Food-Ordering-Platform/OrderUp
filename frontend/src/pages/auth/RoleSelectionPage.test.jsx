import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import RoleSelectionPage from './RoleSelectionPage';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
const mockGetAccessTokenSilently = vi.fn().mockResolvedValue('mock-token');

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    user: { sub: 'auth0|test123', name: 'Test User', email: 'test@example.com' },
    getAccessTokenSilently: mockGetAccessTokenSilently,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockNavigate.mockReset();
  localStorage.clear();

  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ user: { id: 'user-1', role: 'customer', name: 'Test User' } }),
  });
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('RoleSelectionPage', () => {

  it('renders the OrderUp brand in the header', () => {
    render(<MemoryRouter><RoleSelectionPage /></MemoryRouter>);
    expect(screen.getByText('OrderUp')).toBeInTheDocument();
  });

  it('renders the Welcome to OrderUp heading', () => {
    render(<MemoryRouter><RoleSelectionPage /></MemoryRouter>);
    expect(screen.getByText('Welcome to OrderUp')).toBeInTheDocument();
  });

  it('renders the Select Your Role heading', () => {
    render(<MemoryRouter><RoleSelectionPage /></MemoryRouter>);
    expect(screen.getByText('Select Your Role')).toBeInTheDocument();
  });

  it('renders both role cards', () => {
    render(<MemoryRouter><RoleSelectionPage /></MemoryRouter>);
    expect(screen.getByText('Student')).toBeInTheDocument();
    expect(screen.getByText('Vendor')).toBeInTheDocument();
  });

  it('renders student role tags', () => {
    render(<MemoryRouter><RoleSelectionPage /></MemoryRouter>);
    expect(screen.getByText('Order Food')).toBeInTheDocument();
    expect(screen.getByText('Track Order')).toBeInTheDocument();
    expect(screen.getByText('View History')).toBeInTheDocument();
  });

  it('renders vendor role tags', () => {
    render(<MemoryRouter><RoleSelectionPage /></MemoryRouter>);
    expect(screen.getByText('Manage Menu')).toBeInTheDocument();
    expect(screen.getByText('Process Orders')).toBeInTheDocument();
    expect(screen.getByText('View Analytics')).toBeInTheDocument();
  });

  it('Continue button is disabled initially', () => {
    render(<MemoryRouter><RoleSelectionPage /></MemoryRouter>);
    expect(screen.getByText('Continue')).toBeDisabled();
  });

  it('shows name input when Student card is clicked', () => {
    render(<MemoryRouter><RoleSelectionPage /></MemoryRouter>);
    fireEvent.click(screen.getByText('Student'));
    expect(screen.getByPlaceholderText('e.g. Naomi')).toBeInTheDocument();
    expect(screen.getByText('Your display name')).toBeInTheDocument();
  });

  it('shows name input when Vendor card is clicked', () => {
    render(<MemoryRouter><RoleSelectionPage /></MemoryRouter>);
    fireEvent.click(screen.getByText('Vendor'));
    expect(screen.getByPlaceholderText('e.g. Sausage Saloon')).toBeInTheDocument();
    expect(screen.getByText('Your stall name')).toBeInTheDocument();
  });

  it('Continue button remains disabled when role selected but name is empty', () => {
    render(<MemoryRouter><RoleSelectionPage /></MemoryRouter>);
    fireEvent.click(screen.getByText('Student'));
    expect(screen.getByText('Continue')).toBeDisabled();
  });

  it('Continue button becomes enabled when role and name are both provided', () => {
    render(<MemoryRouter><RoleSelectionPage /></MemoryRouter>);
    fireEvent.click(screen.getByText('Student'));
    fireEvent.change(screen.getByPlaceholderText('e.g. Naomi'), { target: { value: 'Naomi' } });
    expect(screen.getByText('Continue')).not.toBeDisabled();
  });

  it('navigates to student-dashboard after successful student signup', async () => {
    render(<MemoryRouter><RoleSelectionPage /></MemoryRouter>);
    fireEvent.click(screen.getByText('Student'));
    fireEvent.change(screen.getByPlaceholderText('e.g. Naomi'), { target: { value: 'Naomi' } });
    fireEvent.click(screen.getByText('Continue'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/student-dashboard'));
  });

  it('navigates to vendor-dashboard after successful vendor signup', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { id: 'user-1', role: 'vendor', name: 'My Stall' } }),
    });
    render(<MemoryRouter><RoleSelectionPage /></MemoryRouter>);
    fireEvent.click(screen.getByText('Vendor'));
    fireEvent.change(screen.getByPlaceholderText('e.g. Sausage Saloon'), { target: { value: 'My Stall' } });
    fireEvent.click(screen.getByText('Continue'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/vendor-dashboard'));
  });

  it('calls the signup API with correct payload for student', async () => {
    render(<MemoryRouter><RoleSelectionPage /></MemoryRouter>);
    fireEvent.click(screen.getByText('Student'));
    fireEvent.change(screen.getByPlaceholderText('e.g. Naomi'), { target: { value: 'Naomi' } });
    fireEvent.click(screen.getByText('Continue'));
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.role).toBe('customer');
    expect(body.name).toBe('Naomi');
  });

  it('calls the signup API with correct payload for vendor', async () => {
    render(<MemoryRouter><RoleSelectionPage /></MemoryRouter>);
    fireEvent.click(screen.getByText('Vendor'));
    fireEvent.change(screen.getByPlaceholderText('e.g. Sausage Saloon'), { target: { value: 'My Stall' } });
    fireEvent.click(screen.getByText('Continue'));
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.role).toBe('vendor');
    expect(body.name).toBe('My Stall');
  });

  it('saves user data to localStorage on successful signup', async () => {
    render(<MemoryRouter><RoleSelectionPage /></MemoryRouter>);
    fireEvent.click(screen.getByText('Student'));
    fireEvent.change(screen.getByPlaceholderText('e.g. Naomi'), { target: { value: 'Naomi' } });
    fireEvent.click(screen.getByText('Continue'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
    const stored = JSON.parse(localStorage.getItem('orderup_user'));
    expect(stored).toBeTruthy();
  });

  it('does not navigate when API returns error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Signup failed' }),
    });
    render(<MemoryRouter><RoleSelectionPage /></MemoryRouter>);
    fireEvent.click(screen.getByText('Student'));
    fireEvent.change(screen.getByPlaceholderText('e.g. Naomi'), { target: { value: 'Naomi' } });
    fireEvent.click(screen.getByText('Continue'));
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('does not navigate when fetch throws', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    render(<MemoryRouter><RoleSelectionPage /></MemoryRouter>);
    fireEvent.click(screen.getByText('Student'));
    fireEvent.change(screen.getByPlaceholderText('e.g. Naomi'), { target: { value: 'Naomi' } });
    fireEvent.click(screen.getByText('Continue'));
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('switching from Student to Vendor shows the vendor input', () => {
    render(<MemoryRouter><RoleSelectionPage /></MemoryRouter>);
    fireEvent.click(screen.getByText('Student'));
    expect(screen.getByPlaceholderText('e.g. Naomi')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Vendor'));
    expect(screen.getByPlaceholderText('e.g. Sausage Saloon')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('e.g. Naomi')).not.toBeInTheDocument();
  });
});