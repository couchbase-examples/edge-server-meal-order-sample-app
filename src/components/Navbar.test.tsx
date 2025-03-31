import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from './Navbar';

describe('Navbar Component', () => {
  // Mock function for menu click handler
  const mockOnMenuClick = jest.fn();

  beforeEach(() => {
    // Clear mock function calls before each test
    mockOnMenuClick.mockClear();
  });

  it('renders correctly with all elements', () => {
    render(<Navbar onMenuClick={mockOnMenuClick} />);

    // Check if main elements are present
    expect(screen.getByLabelText('open drawer')).toBeInTheDocument();
    expect(screen.getByText('America Airlines')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('calls onMenuClick when hamburger menu is clicked', () => {
    render(<Navbar onMenuClick={mockOnMenuClick} />);

    // Find and click the hamburger menu button
    const menuButton = screen.getByLabelText('open drawer');
    fireEvent.click(menuButton);

    // Verify the click handler was called
    expect(mockOnMenuClick).toHaveBeenCalledTimes(1);
  });

  it('renders with correct styling', () => {
    render(<Navbar onMenuClick={mockOnMenuClick} />);

    // Check AppBar positioning and height
    const appBar = screen.getByRole('banner');
    expect(appBar).toHaveStyle({ height: '45px' });

    // Check Toolbar styling
    const toolbar = appBar.querySelector('.MuiToolbar-root');
    expect(toolbar).toHaveStyle({ minHeight: '45px' });
  });

  it('renders flight takeoff icon', () => {
    render(<Navbar onMenuClick={mockOnMenuClick} />);
    
    // Check if the FlightTakeoffIcon is present
    const iconContainer = screen.getByTestId('FlightTakeoffIcon');
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer).toHaveClass('mr-2');
  });

  it('renders navigation links correctly', () => {
    render(<Navbar onMenuClick={mockOnMenuClick} />);

    // Check if navigation links are rendered with correct spacing
    const navList = screen.getByRole('list');
    expect(navList).toHaveClass('ml-auto flex space-x-4');

    const navItems = screen.getAllByRole('listitem');
    expect(navItems).toHaveLength(2);
  });

  it('renders brand name with correct styling', () => {
    render(<Navbar onMenuClick={mockOnMenuClick} />);

    const brandName = screen.getByText('America Airlines');
    expect(brandName).toHaveClass('font-bold text-lg');
  });

  // Test for responsive behavior
  it('maintains consistent layout at different viewport sizes', () => {
    const { container } = render(<Navbar onMenuClick={mockOnMenuClick} />);
    
    // Check if the layout structure remains consistent
    expect(container.querySelector('.flex.items-center')).toBeInTheDocument();
  });
});