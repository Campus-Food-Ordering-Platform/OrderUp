import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import StudentDashboard from './StudentDashboard';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn().mockReturnValue(null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: { name: 'TestStudent' } })
  };
});

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          { id: 1, name: 'Pizza Palace', category: 'Pizza' },
          { id: 2, name: 'Chinese Lantern', category: 'Asian' },
          { id: 3, name: 'Xpresso Cafe', category: 'Cafe' },
        ]),
    })
  );
});

describe('StudentDashboard', () => {
  it('renders the dashboard header and brand name', async () => {
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
    expect(screen.getByText('OrderUp')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/Hey there TestStudent!/i)).toBeInTheDocument();
    });
  });

  it('loads and displays vendors from the API', async () => {
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText('Chinese Lantern')).toBeInTheDocument();
    });
    expect(screen.getByText('Pizza Palace')).toBeInTheDocument();
  });

  it('filters vendors by category after they load', async () => {
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText('Pizza Palace')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Pizza'));
    expect(screen.getByText('Pizza Palace')).toBeInTheDocument();
    expect(screen.queryByText('Chinese Lantern')).not.toBeInTheDocument();
  });

  it('renders the search input field', () => {
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
    expect(screen.getByPlaceholderText('Search vendors, cuisines, dishes...')).toBeInTheDocument();
  });
});
