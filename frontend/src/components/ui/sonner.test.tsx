import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Toaster } from './sonner'

// Mock next-themes
const mockUseTheme = vi.fn(() => ({ theme: 'light' }))
vi.mock('next-themes', () => ({
  useTheme: () => mockUseTheme(),
}))

// Mock Sonner
vi.mock('sonner', () => ({
  Toaster: vi.fn((props) => <div data-testid="sonner-toaster" data-props={JSON.stringify(props)} />),
}))

describe('Toaster Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseTheme.mockReturnValue({ theme: 'light' })
  })

  it('should render without crashing', () => {
    render(<Toaster />)
    expect(screen.getByTestId('sonner-toaster')).toBeInTheDocument()
  })

  it('should pass theme from useTheme to Sonner', () => {
    mockUseTheme.mockReturnValue({ theme: 'dark' })
    render(<Toaster />)

    const sonnerProps = JSON.parse(screen.getByTestId('sonner-toaster').getAttribute('data-props') || '{}')
    expect(sonnerProps.theme).toBe('dark')
  })

  it('should default to system theme when theme is undefined', () => {
    mockUseTheme.mockReturnValue({ theme: undefined })
    render(<Toaster />)

    const sonnerProps = JSON.parse(screen.getByTestId('sonner-toaster').getAttribute('data-props') || '{}')
    expect(sonnerProps.theme).toBe('system')
  })

  it('should handle null theme value', () => {
    mockUseTheme.mockReturnValue({ theme: null })
    render(<Toaster />)

    const sonnerProps = JSON.parse(screen.getByTestId('sonner-toaster').getAttribute('data-props') || '{}')
    expect(sonnerProps.theme).toBe('system')
  })

  it('should apply correct className', () => {
    render(<Toaster />)

    const sonnerProps = JSON.parse(screen.getByTestId('sonner-toaster').getAttribute('data-props') || '{}')
    expect(sonnerProps.className).toBe('toaster group')
  })

  it('should pass correct toastOptions', () => {
    render(<Toaster />)

    const sonnerProps = JSON.parse(screen.getByTestId('sonner-toaster').getAttribute('data-props') || '{}')
    expect(sonnerProps.toastOptions).toEqual({
      classNames: {
        toast:
          "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
        description: "group-[.toast]:text-muted-foreground",
        actionButton:
          "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
        cancelButton:
          "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
      },
    })
  })

  it('should forward additional props to Sonner', () => {
    render(<Toaster position="top-right" richColors={true} />)

    const sonnerProps = JSON.parse(screen.getByTestId('sonner-toaster').getAttribute('data-props') || '{}')
    expect(sonnerProps.position).toBe('top-right')
    expect(sonnerProps.richColors).toBe(true)
  })

  it('should override theme prop when passed explicitly', () => {
    mockUseTheme.mockReturnValue({ theme: 'light' })
    render(<Toaster theme="dark" />)

    const sonnerProps = JSON.parse(screen.getByTestId('sonner-toaster').getAttribute('data-props') || '{}')
    expect(sonnerProps.theme).toBe('dark')
  })

  it('should handle different theme values', () => {
    const themes = ['light', 'dark', 'system'] as const

    themes.forEach((theme) => {
      mockUseTheme.mockReturnValue({ theme })
      const { rerender } = render(<Toaster />)

      const sonnerProps = JSON.parse(screen.getByTestId('sonner-toaster').getAttribute('data-props') || '{}')
      expect(sonnerProps.theme).toBe(theme)

      rerender(<div />) // Clean up for next iteration
    })
  })

  it('should maintain consistent toastOptions structure', () => {
    render(<Toaster />)

    const sonnerProps = JSON.parse(screen.getByTestId('sonner-toaster').getAttribute('data-props') || '{}')

    // Check that all expected className keys are present
    const expectedKeys = ['toast', 'description', 'actionButton', 'cancelButton']
    expectedKeys.forEach((key) => {
      expect(sonnerProps.toastOptions.classNames).toHaveProperty(key)
      expect(typeof sonnerProps.toastOptions.classNames[key]).toBe('string')
    })
  })

  it('should render with default props when no theme context', () => {
    mockUseTheme.mockReturnValue({ theme: 'system' })
    render(<Toaster />)

    const sonnerProps = JSON.parse(screen.getByTestId('sonner-toaster').getAttribute('data-props') || '{}')
    expect(sonnerProps.theme).toBe('system')
  })

  it('should handle empty props object', () => {
    render(<Toaster {...{}} />)

    const sonnerProps = JSON.parse(screen.getByTestId('sonner-toaster').getAttribute('data-props') || '{}')
    expect(sonnerProps.theme).toBe('light')
    expect(sonnerProps.className).toBe('toaster group')
    expect(sonnerProps.toastOptions).toBeDefined()
  })

  it('should handle multiple prop overrides', () => {
    render(<Toaster
      theme="dark"
      position="bottom-left"
      richColors={false}
      closeButton={true}
    />)

    const sonnerProps = JSON.parse(screen.getByTestId('sonner-toaster').getAttribute('data-props') || '{}')
    expect(sonnerProps.theme).toBe('dark')
    expect(sonnerProps.position).toBe('bottom-left')
    expect(sonnerProps.richColors).toBe(false)
    expect(sonnerProps.closeButton).toBe(true)
  })

  it('should preserve toastOptions when additional props are passed', () => {
    render(<Toaster position="top-center" />)

    const sonnerProps = JSON.parse(screen.getByTestId('sonner-toaster').getAttribute('data-props') || '{}')
    expect(sonnerProps.position).toBe('top-center')
    expect(sonnerProps.toastOptions).toBeDefined()
    expect(sonnerProps.toastOptions.classNames).toBeDefined()
  })

  it('should handle theme destructuring edge case', () => {
    // Test when useTheme returns an object without theme property
    mockUseTheme.mockReturnValue({})
    render(<Toaster />)

    const sonnerProps = JSON.parse(screen.getByTestId('sonner-toaster').getAttribute('data-props') || '{}')
    expect(sonnerProps.theme).toBe('system') // Should default to 'system'
  })
})
