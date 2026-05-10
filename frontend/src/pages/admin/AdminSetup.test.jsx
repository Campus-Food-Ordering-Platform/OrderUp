import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AdminSetupPage from './AdminSetupPage';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
const mockLoginWithRedirect = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// Default auth state: authenticated
let mockAuthState = {
  user: { sub: 'auth0|admin123', name: 'Admin User' },
  isAuthenticated: true,
  isLoading: false,
  loginWithRedirect: mockLoginWithRedirect,
};

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => mockAuthState,
}));

// sessionStorage stub
const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, val) => { store[key] = val; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock, writable: true });

beforeEach(() => {
  vi.clearAllMocks();
  mockNavigate.mockReset();
  sessionStorageMock.clear();
  sessionStorageMock.getItem.mockReturnValue(null); // gate not passed by default

  mockAuthState = {
    user: { sub: 'auth0|admin123', name: 'Admin User' },
    isAuthenticated: true,
    isLoading: false,
    loginWithRedirect: mockLoginWithRedirect,
  };

  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ message: 'Admin created' }),
  });
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AdminSetupPage', () => {

  // ── Password gate ──────────────────────────────────────────────────────────

  it('shows the Restricted Access heading by default', () => {
    render(<MemoryRouter><AdminSetupPage /></MemoryRouter>);
    expect(screen.getByText('Restricted Access')).toBeInTheDocument();
  });

  it('shows the password input', () => {
    render(<MemoryRouter><AdminSetupPage /></MemoryRouter>);
    expect(screen.getByPlaceholderText('Enter password...')).toBeInTheDocument();
  });

  it('shows the Unlock Setup button', () => {
    render(<MemoryRouter><AdminSetupPage /></MemoryRouter>);
    expect(screen.getByText('Unlock Setup')).toBeInTheDocument();
  });

  it('shows error message when wrong password is entered', () => {
    render(<MemoryRouter><AdminSetupPage /></MemoryRouter>);
    fireEvent.change(screen.getByPlaceholderText('Enter password...'), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByText('Unlock Setup'));
    expect(screen.getByText(/incorrect password/i)).toBeInTheDocument();
  });

  it('does not show error initially', () => {
    render(<MemoryRouter><AdminSetupPage /></MemoryRouter>);
    expect(screen.queryByText(/incorrect password/i)).not.toBeInTheDocument();
  });

  it('transitions to setup UI when correct password is entered', async () => {
    render(<MemoryRouter><AdminSetupPage /></MemoryRouter>);
    fireEvent.change(screen.getByPlaceholderText('Enter password...'), {
      target: { value: 'SoftwareSlayers4Life' },
    });
    fireEvent.click(screen.getByText('Unlock Setup'));
    await waitFor(() =>
      expect(screen.getByText('Secret Admin Setup')).toBeInTheDocument()
    );
  });

  it('saves gate_passed to sessionStorage on correct password', () => {
    render(<MemoryRouter><AdminSetupPage /></MemoryRouter>);
    fireEvent.change(screen.getByPlaceholderText('Enter password...'), {
      target: { value: 'SoftwareSlayers4Life' },
    });
    fireEvent.click(screen.getByText('Unlock Setup'));
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith('admin_gate_passed', 'true');
  });

  it('skips the password gate if sessionStorage already has gate passed', () => {
    sessionStorageMock.getItem.mockReturnValue('true');
    render(<MemoryRouter><AdminSetupPage /></MemoryRouter>);
    expect(screen.queryByText('Restricted Access')).not.toBeInTheDocument();
    expect(screen.getByText('Secret Admin Setup')).toBeInTheDocument();
  });

  // ── Setup UI (gate passed) ─────────────────────────────────────────────────

  it('shows status message after gate is passed and user is authenticated', async () => {
    sessionStorageMock.getItem.mockReturnValue('true');
    render(<MemoryRouter><AdminSetupPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByText(/Preparing admin credentials/i)).toBeInTheDocument()
    );
  });

  it('calls the signup API after gate is passed', async () => {
    sessionStorageMock.getItem.mockReturnValue('true');
    render(<MemoryRouter><AdminSetupPage /></MemoryRouter>);
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/signup'),
      expect.objectContaining({ method: 'POST' })
    ));
  });

  it('sends correct admin role in signup payload', async () => {
    sessionStorageMock.getItem.mockReturnValue('true');
    render(<MemoryRouter><AdminSetupPage /></MemoryRouter>);
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.role).toBe('admin');
    expect(body.auth0Id).toBe('auth0|admin123');
  });

  it('shows success message when signup succeeds', async () => {
    sessionStorageMock.getItem.mockReturnValue('true');
    render(<MemoryRouter><AdminSetupPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByText(/successfully set up/i)).toBeInTheDocument()
    );
  });

  // FIX: Use shouldAdvanceTime so Promises can resolve while fake timers are active,
  // then use runAllTimersAsync() to flush the setTimeout that triggers navigation.
  it('navigates to admin-dashboard after successful setup', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    sessionStorageMock.getItem.mockReturnValue('true');
    render(<MemoryRouter><AdminSetupPage /></MemoryRouter>);
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    // Wait for the success message so the component has settled post-fetch
    await waitFor(() =>
      expect(screen.getByText(/successfully set up/i)).toBeInTheDocument()
    );
    await vi.runAllTimersAsync();
    expect(mockNavigate).toHaveBeenCalledWith('/admin-dashboard');
    vi.useRealTimers();
  });

  // FIX: Same shouldAdvanceTime pattern — no fake timers needed here since we
  // only assert on the message (no setTimeout involved).
  it('shows failure message when signup returns non-ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Already assigned' }),
    });
    sessionStorageMock.getItem.mockReturnValue('true');
    render(<MemoryRouter><AdminSetupPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByText(/Failed to register/i)).toBeInTheDocument()
    );
  });

  // FIX: Same shouldAdvanceTime + runAllTimersAsync pattern.
  it('navigates to home after failed signup', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Already assigned' }),
    });
    sessionStorageMock.getItem.mockReturnValue('true');
    render(<MemoryRouter><AdminSetupPage /></MemoryRouter>);
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    // Wait for the failure message so the component has settled post-fetch
    await waitFor(() =>
      expect(screen.getByText(/Failed to register/i)).toBeInTheDocument()
    );
    await vi.runAllTimersAsync();
    expect(mockNavigate).toHaveBeenCalledWith('/');
    vi.useRealTimers();
  });

  // ── Not authenticated (gate passed but no login) ───────────────────────────

  it('shows Log In button when gate is passed but user is not authenticated', () => {
    sessionStorageMock.getItem.mockReturnValue('true');
    mockAuthState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      loginWithRedirect: mockLoginWithRedirect,
    };
    render(<MemoryRouter><AdminSetupPage /></MemoryRouter>);
    expect(screen.getByText(/Log In via Google/i)).toBeInTheDocument();
  });

  it('calls loginWithRedirect when Log In button is clicked', () => {
    sessionStorageMock.getItem.mockReturnValue('true');
    mockAuthState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      loginWithRedirect: mockLoginWithRedirect,
    };
    render(<MemoryRouter><AdminSetupPage /></MemoryRouter>);
    fireEvent.click(screen.getByText(/Log In via Google/i));
    expect(mockLoginWithRedirect).toHaveBeenCalled();
  });

  // FIX: After the fetch resolves the component re-renders (state update).
  // We must wait for that re-render before asserting the button is gone.
  // Waiting for the success message is the natural stable point.
  it('does not show Log In button when user is already authenticated', async () => {
    sessionStorageMock.getItem.mockReturnValue('true');
    render(<MemoryRouter><AdminSetupPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByText(/successfully set up/i)).toBeInTheDocument()
    );
    expect(screen.queryByText(/Log In via Google/i)).not.toBeInTheDocument();
  });

  it('does not call fetch while still loading', () => {
    sessionStorageMock.getItem.mockReturnValue('true');
    mockAuthState = { ...mockAuthState, isLoading: true };
    render(<MemoryRouter><AdminSetupPage /></MemoryRouter>);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});