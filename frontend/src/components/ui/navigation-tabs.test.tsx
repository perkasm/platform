import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NavigationTabs } from './navigation-tabs'

// Mock the Button component
vi.mock('./button', () => ({
  Button: vi.fn(({ children, onClick, variant, className, ...props }) => (
    <button
      data-testid={`tab-button-${props['data-tab-id'] || 'unknown'}`}
      data-variant={variant}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )),
}))

// Mock the cn utility
vi.mock('@/lib/utils', () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
}))

describe('NavigationTabs Component', () => {
  const mockTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <span data-testid="dashboard-icon">📊</span> },
    { id: 'cards', label: 'My Cards', icon: <span data-testid="cards-icon">💳</span> },
    { id: 'ai', label: 'AI Chat', icon: <span data-testid="ai-icon">🤖</span> },
  ]

  const mockOnTabChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render without crashing', () => {
    render(
      <NavigationTabs
        tabs={mockTabs}
        activeTab="dashboard"
        onTabChange={mockOnTabChange}
      />
    )
    expect(screen.getByTestId('tab-button-dashboard')).toBeInTheDocument()
  })

  it('should render all tabs', () => {
    render(
      <NavigationTabs
        tabs={mockTabs}
        activeTab="dashboard"
        onTabChange={mockOnTabChange}
      />
    )

    expect(screen.getByTestId('tab-button-dashboard')).toBeInTheDocument()
    expect(screen.getByTestId('tab-button-cards')).toBeInTheDocument()
    expect(screen.getByTestId('tab-button-ai')).toBeInTheDocument()
  })

  it('should render tab icons', () => {
    render(
      <NavigationTabs
        tabs={mockTabs}
        activeTab="dashboard"
        onTabChange={mockOnTabChange}
      />
    )

    expect(screen.getByTestId('dashboard-icon')).toBeInTheDocument()
    expect(screen.getByTestId('cards-icon')).toBeInTheDocument()
    expect(screen.getByTestId('ai-icon')).toBeInTheDocument()
  })

  it('should render tab labels', () => {
    render(
      <NavigationTabs
        tabs={mockTabs}
        activeTab="dashboard"
        onTabChange={mockOnTabChange}
      />
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('My Cards')).toBeInTheDocument()
    expect(screen.getByText('AI Chat')).toBeInTheDocument()
  })

  it('should apply correct variant to active tab', () => {
    render(
      <NavigationTabs
        tabs={mockTabs}
        activeTab="dashboard"
        onTabChange={mockOnTabChange}
      />
    )

    const activeButton = screen.getByTestId('tab-button-dashboard')
    expect(activeButton).toHaveAttribute('data-variant', 'default')
  })

  it('should apply correct variant to inactive tabs', () => {
    render(
      <NavigationTabs
        tabs={mockTabs}
        activeTab="dashboard"
        onTabChange={mockOnTabChange}
      />
    )

    const cardsButton = screen.getByTestId('tab-button-cards')
    const aiButton = screen.getByTestId('tab-button-ai')

    expect(cardsButton).toHaveAttribute('data-variant', 'ghost')
    expect(aiButton).toHaveAttribute('data-variant', 'ghost')
  })

  it('should apply correct CSS classes to active tab', () => {
    render(
      <NavigationTabs
        tabs={mockTabs}
        activeTab="dashboard"
        onTabChange={mockOnTabChange}
      />
    )

    const activeButton = screen.getByTestId('tab-button-dashboard')
    expect(activeButton.className).toContain('bg-background')
    expect(activeButton.className).toContain('shadow-card')
    expect(activeButton.className).toContain('text-primary')
    expect(activeButton.className).toContain('font-medium')
  })

  it('should apply correct CSS classes to inactive tabs', () => {
    render(
      <NavigationTabs
        tabs={mockTabs}
        activeTab="dashboard"
        onTabChange={mockOnTabChange}
      />
    )

    const cardsButton = screen.getByTestId('tab-button-cards')
    expect(cardsButton.className).toContain('hover:bg-background/50')
    expect(cardsButton.className).toContain('text-muted-foreground')
  })

  it('should call onTabChange when tab is clicked', () => {
    render(
      <NavigationTabs
        tabs={mockTabs}
        activeTab="dashboard"
        onTabChange={mockOnTabChange}
      />
    )

    const cardsButton = screen.getByTestId('tab-button-cards')
    fireEvent.click(cardsButton)

    expect(mockOnTabChange).toHaveBeenCalledWith('cards')
    expect(mockOnTabChange).toHaveBeenCalledTimes(1)
  })

  it('should call onTabChange with correct tab id for each tab', () => {
    render(
      <NavigationTabs
        tabs={mockTabs}
        activeTab="dashboard"
        onTabChange={mockOnTabChange}
      />
    )

    const aiButton = screen.getByTestId('tab-button-ai')
    fireEvent.click(aiButton)

    expect(mockOnTabChange).toHaveBeenCalledWith('ai')
  })

  it('should handle empty tabs array', () => {
    render(
      <NavigationTabs
        tabs={[]}
        activeTab=""
        onTabChange={mockOnTabChange}
      />
    )

    // Should render the container but no buttons
    const container = screen.getByTestId('navigation-tabs-container')
    expect(container).toBeInTheDocument()
    expect(container.children).toHaveLength(0)
  })

  it('should handle single tab', () => {
    const singleTab = [{ id: 'single', label: 'Single', icon: <span>🔸</span> }]

    render(
      <NavigationTabs
        tabs={singleTab}
        activeTab="single"
        onTabChange={mockOnTabChange}
      />
    )

    expect(screen.getByTestId('tab-button-single')).toBeInTheDocument()
    expect(screen.getByText('Single')).toBeInTheDocument()
  })

  it('should handle tab with empty label', () => {
    const tabsWithEmptyLabel = [
      { id: 'empty', label: '', icon: <span>⚪</span> },
    ]

    render(
      <NavigationTabs
        tabs={tabsWithEmptyLabel}
        activeTab="empty"
        onTabChange={mockOnTabChange}
      />
    )

    // Should still render the button and icon
    expect(screen.getByTestId('tab-button-empty')).toBeInTheDocument()
    // Check that the span exists but is empty
    const labelSpan = screen.getByTestId('tab-button-empty').querySelector('span.hidden')
    expect(labelSpan).toBeInTheDocument()
    expect(labelSpan?.textContent).toBe('')
  })

  it('should handle tab with null icon', () => {
    const tabsWithNullIcon = [
      { id: 'null-icon', label: 'Null Icon', icon: null },
    ]

    render(
      <NavigationTabs
        tabs={tabsWithNullIcon}
        activeTab="null-icon"
        onTabChange={mockOnTabChange}
      />
    )

    expect(screen.getByTestId('tab-button-null-icon')).toBeInTheDocument()
    expect(screen.getByText('Null Icon')).toBeInTheDocument()
  })

  it('should handle activeTab not matching any tab id', () => {
    render(
      <NavigationTabs
        tabs={mockTabs}
        activeTab="nonexistent"
        onTabChange={mockOnTabChange}
      />
    )

    // All tabs should be inactive (ghost variant)
    mockTabs.forEach(tab => {
      const button = screen.getByTestId(`tab-button-${tab.id}`)
      expect(button).toHaveAttribute('data-variant', 'ghost')
    })
  })

  it('should handle multiple clicks on same tab', () => {
    render(
      <NavigationTabs
        tabs={mockTabs}
        activeTab="dashboard"
        onTabChange={mockOnTabChange}
      />
    )

    const dashboardButton = screen.getByTestId('tab-button-dashboard')
    fireEvent.click(dashboardButton)
    fireEvent.click(dashboardButton)

    expect(mockOnTabChange).toHaveBeenCalledWith('dashboard')
    expect(mockOnTabChange).toHaveBeenCalledTimes(2)
  })

  it('should render with correct container classes', () => {
    render(
      <NavigationTabs
        tabs={mockTabs}
        activeTab="dashboard"
        onTabChange={mockOnTabChange}
      />
    )

    const container = screen.getByTestId('navigation-tabs-container')
    expect(container.className).toContain('flex')
    expect(container.className).toContain('space-x-1')
    expect(container.className).toContain('rounded-lg')
    expect(container.className).toContain('bg-muted')
    expect(container.className).toContain('p-1')
  })

  it('should render tab labels with responsive classes', () => {
    render(
      <NavigationTabs
        tabs={mockTabs}
        activeTab="dashboard"
        onTabChange={mockOnTabChange}
      />
    )

    const labels = screen.getAllByText(/Dashboard|My Cards|AI Chat/)
    labels.forEach(label => {
      expect(label.className).toContain('hidden')
      expect(label.className).toContain('sm:inline')
    })
  })

  it('should render buttons with transition classes', () => {
    render(
      <NavigationTabs
        tabs={mockTabs}
        activeTab="dashboard"
        onTabChange={mockOnTabChange}
      />
    )

    const buttons = screen.getAllByTestId(/^tab-button-/)
    buttons.forEach(button => {
      expect(button.className).toContain('transition-all')
      expect(button.className).toContain('duration-200')
    })
  })

  it('should render buttons with flex and items-center classes', () => {
    render(
      <NavigationTabs
        tabs={mockTabs}
        activeTab="dashboard"
        onTabChange={mockOnTabChange}
      />
    )

    const buttons = screen.getAllByTestId(/^tab-button-/)
    buttons.forEach(button => {
      expect(button.className).toContain('flex')
      expect(button.className).toContain('items-center')
      expect(button.className).toContain('space-x-2')
    })
  })
})
