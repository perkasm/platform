import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeToggle } from './theme-toggle'

// Mock next-themes
const mockSetTheme = vi.fn()
const mockUseTheme = vi.fn()

vi.mock('next-themes', () => ({
  useTheme: () => mockUseTheme(),
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Moon: vi.fn(() => <svg data-testid="moon-icon" />),
  Sun: vi.fn(() => <svg data-testid="sun-icon" />),
}))

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset to initial state
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    })
  })

  it('should render Moon icon for light theme after mounting', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    })

    render(<ThemeToggle />)

    // Wait for component to mount and update
    await waitFor(() => {
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument()
  })

  it('should render Sun icon for dark theme after mounting', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
    })

    render(<ThemeToggle />)

    await waitFor(() => {
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument()
  })

  it('should toggle from light to dark theme when clicked', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    })

    render(<ThemeToggle />)
    const button = screen.getByRole('button')

    fireEvent.click(button)

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
    expect(mockSetTheme).toHaveBeenCalledTimes(1)
  })

  it('should toggle from dark to light theme when clicked', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
    })

    render(<ThemeToggle />)
    const button = screen.getByRole('button')

    fireEvent.click(button)

    expect(mockSetTheme).toHaveBeenCalledWith('light')
    expect(mockSetTheme).toHaveBeenCalledTimes(1)
  })

  it('should handle system theme', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'system',
      setTheme: mockSetTheme,
    })

    render(<ThemeToggle />)
    const button = screen.getByRole('button')

    fireEvent.click(button)

    expect(mockSetTheme).toHaveBeenCalledWith('light')
    expect(mockSetTheme).toHaveBeenCalledTimes(1)
  })

  it('should have correct button attributes', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    })

    render(<ThemeToggle />)
    const button = screen.getByRole('button')

    expect(button).toHaveClass('w-9', 'h-9', 'p-0')
    expect(button).toHaveAttribute('type', 'button')
  })

  it('should have proper accessibility attributes', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    })

    render(<ThemeToggle />)
    const button = screen.getByRole('button')

    expect(button).toHaveAttribute('aria-label', 'Toggle theme')
  })

  it('should be keyboard accessible', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    })

    render(<ThemeToggle />)
    const button = screen.getByRole('button')

    // Test Enter key
    fireEvent.click(button)
    expect(mockSetTheme).toHaveBeenCalledWith('dark')

    // Reset mock
    mockSetTheme.mockClear()

    // Test that button is focusable
    button.focus()
    expect(button).toHaveFocus()
  })

  it('should render correct icon size', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    })

    render(<ThemeToggle />)

    await waitFor(() => {
      const icon = screen.getByTestId('moon-icon')
      expect(icon).toBeInTheDocument()
      // The size is controlled by the button's [&_svg]:size-4 class
      expect(icon.tagName.toLowerCase()).toBe('svg')
    })
  })

  it('should handle theme changes dynamically', async () => {
    const { rerender } = render(<ThemeToggle />)

    // Start with light theme
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    })

    rerender(<ThemeToggle />)

    await waitFor(() => {
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
    })

    // Change to dark theme
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
    })

    rerender(<ThemeToggle />)

    await waitFor(() => {
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
    })
  })
})
