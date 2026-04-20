import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import RoleSelectionPage from './RoleSelectionPage';

// Mock Auth0
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    user: { given_name: 'Naomi' },
    getAccessTokenSilently: vi.fn().mockResolvedValue('mock-token')
  })
}));

// Mock useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

describe('RoleSelectionPage', () => {
  it('renders the Student role card', () => {
    render(<MemoryRouter><RoleSelectionPage /></MemoryRouter>);
    expect(screen.getByText('Student')).toBeInTheDocument();
  });

  it('renders the Vendor role card', () => {
    render(<MemoryRouter><RoleSelectionPage /></MemoryRouter>);
    expect(screen.getByText('Vendor')).toBeInTheDocument();
  });

  it('shows the name input field when Student role is selected', () => {
    render(<MemoryRouter><RoleSelectionPage /></MemoryRouter>);
    fireEvent.click(screen.getByText('Student'));
    expect(screen.getByText(/Your display name/i)).toBeInTheDocument();
  });

  it('shows the stall name input when Vendor role is selected', () => {
    render(<MemoryRouter><RoleSelectionPage /></MemoryRouter>);
    fireEvent.click(screen.getByText('Vendor'));
    expect(screen.getByText(/Your stall name/i)).toBeInTheDocument();
  });
});
