import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import StudentHistoryPage from './StudentHistoryPage';

// Mock the React Router's useNavigate hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('StudentHistoryPage', () => {
  it('renders the page title and description correctly', () => {
    render(
      <MemoryRouter>
        <StudentHistoryPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Order History')).toBeInTheDocument();
  });

  it('filters orders exactly when the search bar is typed into', () => {
    render(
      <MemoryRouter>
        <StudentHistoryPage />
      </MemoryRouter>
    );
    
    const searchInput = screen.getByPlaceholderText('Search by vendor or food item...');
    fireEvent.change(searchInput, { target: { value: 'Pizza' } });
    
    // Should see Pizza Palace but not Chinese Lantern
    expect(screen.getByText('Pizza Palace')).toBeInTheDocument();
    expect(screen.queryByText('Chinese Lantern')).not.toBeInTheDocument();
  });

  it('filters orders by Completed status when the tab is clicked', () => {
    render(
      <MemoryRouter>
        <StudentHistoryPage />
      </MemoryRouter>
    );

    const completedTab = screen.getByRole('button', { name: 'Completed' });
    fireEvent.click(completedTab);
    
    // Chinese Lantern is completed, Pizza is refunded
    expect(screen.getByText('Chinese Lantern')).toBeInTheDocument();
    expect(screen.queryByText('Pizza Palace')).not.toBeInTheDocument();
  });

  it('triggers a navigation to the checkout page when the Reorder button is clicked', () => {
    render(
      <MemoryRouter>
        <StudentHistoryPage />
      </MemoryRouter>
    );

    // Get all the Reorder buttons and click the first one (Chinese Lantern)
    const reorderButtons = screen.getAllByText('Reorder');
    fireEvent.click(reorderButtons[0]);

    // Expect mockNavigate to have been fully triggered
    expect(mockNavigate).toHaveBeenCalled();
  });
});
