import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AuthCallback from './AuthCallback';

// Mock useNavigate from React Router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock Auth0 context hook
const mockUseAuth0 = vi.fn();
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => mockUseAuth0()
}));

// Mock the global Fetch API
global.fetch = vi.fn();

describe('AuthCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Loading indicator initially', () => {
    mockUseAuth0.mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
      user: null
    });

    render(<MemoryRouter><AuthCallback /></MemoryRouter>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('navigates to / when user is not authenticated', () => {
    mockUseAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      user: null
    });

    render(<MemoryRouter><AuthCallback /></MemoryRouter>);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('navigates to role-selection if fetch fails', async () => {
    mockUseAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { sub: 'auth0|123' },
      getAccessTokenSilently: vi.fn().mockResolvedValue('fake-token')
    });

    // Simulate an API error (user not in DB yet)
    global.fetch.mockResolvedValue({
      ok: false
    });

    render(<MemoryRouter><AuthCallback /></MemoryRouter>);

    // Wait for the async effect to resolve
    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/role-selection');
    });
  });

  it('navigates to student-dashboard if API returns customer role', async () => {
    mockUseAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { sub: 'auth0|123' },
      getAccessTokenSilently: vi.fn().mockResolvedValue('fake-token')
    });

    // Simulate a successful API response returning role: 'customer'
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ role: 'customer' })
    });

    render(<MemoryRouter><AuthCallback /></MemoryRouter>);

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/student-dashboard');
    });
  });
});
