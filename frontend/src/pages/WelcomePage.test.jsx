import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import WelcomePage from './WelcomePage';

// Mock GoogleSignInButton since it depends on Auth0 externally
vi.mock('../components/auth/GoogleSignInButton.jsx', () => ({
  default: () => <button>Sign in with Google</button>
}));

describe('WelcomePage', () => {
  it('renders the OrderUp brand name', () => {
    render(<MemoryRouter><WelcomePage /></MemoryRouter>);
    expect(screen.getByText('OrderUp')).toBeInTheDocument();
  });

  it('renders the University Food Ordering Platform subtitle', () => {
    render(<MemoryRouter><WelcomePage /></MemoryRouter>);
    expect(screen.getByText(/University Food Ordering Platform/i)).toBeInTheDocument();
  });

  it('renders the Skip the Queue hero text', () => {
    render(<MemoryRouter><WelcomePage /></MemoryRouter>);
    expect(screen.getByText(/Skip the Queue/i)).toBeInTheDocument();
  });

  it('renders the sign in button', () => {
    render(<MemoryRouter><WelcomePage /></MemoryRouter>);
    expect(screen.getByText(/Sign in with Google/i)).toBeInTheDocument();
  });
});
