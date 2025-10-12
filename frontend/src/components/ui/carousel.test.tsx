import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import useEmblaCarousel from 'embla-carousel-react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
} from './carousel'

// Mock Embla Carousel
const mockEmblaApi = {
  canScrollPrev: vi.fn(() => false),
  canScrollNext: vi.fn(() => true),
  scrollPrev: vi.fn(),
  scrollNext: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  destroy: vi.fn(),
}

vi.mock('embla-carousel-react', () => ({
  default: vi.fn(() => [
    { current: null },
    mockEmblaApi,
  ]),
}))

// Test component for useCarousel hook
function TestUseCarouselComponent() {
  const carousel = useCarousel()
  return <div data-testid="carousel-context">{JSON.stringify(carousel)}</div>
}

describe('Carousel Components', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useCarousel hook', () => {
    it('should throw error when used outside Carousel', () => {
      expect(() => render(<TestUseCarouselComponent />)).toThrow(
        'useCarousel must be used within a <Carousel />'
      )
    })

    it('should return carousel context when used inside Carousel', () => {
      render(
        <Carousel>
          <TestUseCarouselComponent />
        </Carousel>
      )
      expect(screen.getByTestId('carousel-context')).toBeInTheDocument()
    })
  })

  describe('Carousel', () => {
    it('should render without crashing', () => {
      render(<Carousel>Content</Carousel>)
      expect(screen.getByRole('region')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(<Carousel className="custom-carousel">Content</Carousel>)
      expect(screen.getByRole('region')).toHaveClass('custom-carousel')
    })

    it('should have correct ARIA attributes', () => {
      render(<Carousel>Content</Carousel>)
      const carousel = screen.getByRole('region')
      expect(carousel).toHaveAttribute('aria-roledescription', 'carousel')
    })

    it('should initialize Embla with default options', () => {
      render(<Carousel>Content</Carousel>)
      expect(useEmblaCarousel).toHaveBeenCalledWith(
        { axis: 'x' },
        undefined
      )
    })

    it('should pass custom options to Embla', () => {
      const opts = { loop: true, skipSnaps: false }
      render(<Carousel opts={opts}>Content</Carousel>)
      expect(useEmblaCarousel).toHaveBeenCalledWith(
        { ...opts, axis: 'x' },
        undefined
      )
    })

    it('should support vertical orientation', () => {
      render(<Carousel orientation="vertical">Content</Carousel>)
      expect(useEmblaCarousel).toHaveBeenCalledWith(
        { axis: 'y' },
        undefined
      )
    })

    it('should call setApi when provided', () => {
      const setApi = vi.fn()
      render(<Carousel setApi={setApi}>Content</Carousel>)
      expect(setApi).toHaveBeenCalledWith(mockEmblaApi)
    })

    it('should handle keyboard navigation', () => {
      render(<Carousel>Content</Carousel>)

      const carousel = screen.getByRole('region')
      fireEvent.keyDown(carousel, { key: 'ArrowLeft' })
      expect(mockEmblaApi.scrollPrev).toHaveBeenCalled()

      fireEvent.keyDown(carousel, { key: 'ArrowRight' })
      expect(mockEmblaApi.scrollNext).toHaveBeenCalled()
    })

    it('should prevent default on arrow key events', () => {
      render(<Carousel>Content</Carousel>)

      const carousel = screen.getByRole('region')
      const arrowLeftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      const preventDefaultSpy = vi.spyOn(arrowLeftEvent, 'preventDefault')

      fireEvent(carousel, arrowLeftEvent)
      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('CarouselContent', () => {
    it('should render with overflow hidden', () => {
      render(
        <Carousel>
          <CarouselContent>Content</CarouselContent>
        </Carousel>
      )
      const content = screen.getByText('Content').parentElement
      expect(content).toHaveClass('overflow-hidden')
    })

    it('should apply custom className', () => {
      render(
        <Carousel>
          <CarouselContent className="custom-content" data-testid="content">Content</CarouselContent>
        </Carousel>
      )
      const content = screen.getByTestId('content')
      expect(content).toHaveClass('custom-content')
    })

    it('should have correct flex layout for horizontal orientation', () => {
      render(
        <Carousel>
          <CarouselContent data-testid="content">Content</CarouselContent>
        </Carousel>
      )
      const content = screen.getByTestId('content')
      expect(content).toHaveClass('flex', '-ml-4')
    })

    it('should have correct flex layout for vertical orientation', () => {
      render(
        <Carousel orientation="vertical">
          <CarouselContent data-testid="content">Content</CarouselContent>
        </Carousel>
      )
      const content = screen.getByTestId('content')
      expect(content).toHaveClass('flex', 'flex-col', '-mt-4')
    })
  })

  describe('CarouselItem', () => {
    it('should render with correct ARIA attributes', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
          </CarouselContent>
        </Carousel>
      )
      const item = screen.getByRole('group')
      expect(item).toHaveAttribute('aria-roledescription', 'slide')
    })

    it('should apply custom className', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem className="custom-item">Item 1</CarouselItem>
          </CarouselContent>
        </Carousel>
      )
      const item = screen.getByRole('group')
      expect(item).toHaveClass('custom-item')
    })

    it('should have correct sizing classes for horizontal orientation', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
          </CarouselContent>
        </Carousel>
      )
      const item = screen.getByRole('group')
      expect(item).toHaveClass('min-w-0', 'shrink-0', 'grow-0', 'basis-full', 'pl-4')
    })

    it('should have correct sizing classes for vertical orientation', () => {
      render(
        <Carousel orientation="vertical">
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
          </CarouselContent>
        </Carousel>
      )
      const item = screen.getByRole('group')
      expect(item).toHaveClass('min-w-0', 'shrink-0', 'grow-0', 'basis-full', 'pt-4')
    })
  })

  describe('CarouselPrevious', () => {
    it('should render previous button', () => {
      render(
        <Carousel>
          <CarouselPrevious />
        </Carousel>
      )
      const button = screen.getByRole('button', { name: /previous slide/i })
      expect(button).toBeInTheDocument()
    })

    it('should have correct positioning for horizontal orientation', () => {
      render(
        <Carousel>
          <CarouselPrevious />
        </Carousel>
      )
      const button = screen.getByRole('button', { name: /previous slide/i })
      expect(button).toHaveClass('-left-12', 'top-1/2', '-translate-y-1/2')
    })

    it('should have correct positioning for vertical orientation', () => {
      render(
        <Carousel orientation="vertical">
          <CarouselPrevious />
        </Carousel>
      )
      const button = screen.getByRole('button', { name: /previous slide/i })
      expect(button).toHaveClass('-top-12', 'left-1/2', '-translate-x-1/2', 'rotate-90')
    })

    it('should be disabled when cannot scroll prev', () => {
      mockEmblaApi.canScrollPrev.mockReturnValue(false)
      render(
        <Carousel>
          <CarouselPrevious />
        </Carousel>
      )
      const button = screen.getByRole('button', { name: /previous slide/i })
      expect(button).toBeDisabled()
    })

    it('should be enabled when can scroll prev', () => {
      mockEmblaApi.canScrollPrev.mockReturnValue(true)
      render(
        <Carousel>
          <CarouselPrevious />
        </Carousel>
      )
      const button = screen.getByRole('button', { name: /previous slide/i })
      expect(button).not.toBeDisabled()
    })

    it('should call scrollPrev when clicked', () => {
      render(
        <Carousel>
          <CarouselPrevious />
        </Carousel>
      )
      const button = screen.getByRole('button', { name: /previous slide/i })
      fireEvent.click(button)
      expect(mockEmblaApi.scrollPrev).toHaveBeenCalled()
    })

    it('should apply custom props', () => {
      render(
        <Carousel>
          <CarouselPrevious variant="outline" size="default" />
        </Carousel>
      )
      const button = screen.getByRole('button', { name: /previous slide/i })
      // The button should have the carousel positioning classes plus the default button size
      expect(button).toHaveClass('h-8', 'w-8') // carousel specific sizing
      expect(button).toHaveClass('px-4', 'py-2') // default button padding
    })
  })

  describe('CarouselNext', () => {
    it('should render next button', () => {
      render(
        <Carousel>
          <CarouselNext />
        </Carousel>
      )
      const button = screen.getByRole('button', { name: /next slide/i })
      expect(button).toBeInTheDocument()
    })

    it('should have correct positioning for horizontal orientation', () => {
      render(
        <Carousel>
          <CarouselNext />
        </Carousel>
      )
      const button = screen.getByRole('button', { name: /next slide/i })
      expect(button).toHaveClass('-right-12', 'top-1/2', '-translate-y-1/2')
    })

    it('should have correct positioning for vertical orientation', () => {
      render(
        <Carousel orientation="vertical">
          <CarouselNext />
        </Carousel>
      )
      const button = screen.getByRole('button', { name: /next slide/i })
      expect(button).toHaveClass('-bottom-12', 'left-1/2', '-translate-x-1/2', 'rotate-90')
    })

    it('should be disabled when cannot scroll next', () => {
      mockEmblaApi.canScrollNext.mockReturnValue(false)
      render(
        <Carousel>
          <CarouselNext />
        </Carousel>
      )
      const button = screen.getByRole('button', { name: /next slide/i })
      expect(button).toBeDisabled()
    })

    it('should be enabled when can scroll next', () => {
      mockEmblaApi.canScrollNext.mockReturnValue(true)
      render(
        <Carousel>
          <CarouselNext />
        </Carousel>
      )
      const button = screen.getByRole('button', { name: /next slide/i })
      expect(button).not.toBeDisabled()
    })

    it('should call scrollNext when clicked', () => {
      render(
        <Carousel>
          <CarouselNext />
        </Carousel>
      )
      const button = screen.getByRole('button', { name: /next slide/i })
      fireEvent.click(button)
      expect(mockEmblaApi.scrollNext).toHaveBeenCalled()
    })

    it('should apply custom props', () => {
      render(
        <Carousel>
          <CarouselNext variant="outline" size="default" />
        </Carousel>
      )
      const button = screen.getByRole('button', { name: /next slide/i })
      // The button should have the carousel positioning classes plus the default button size
      expect(button).toHaveClass('h-8', 'w-8') // carousel specific sizing
      expect(button).toHaveClass('px-4', 'py-2') // default button padding
    })
  })

  describe('Integration', () => {
    it('should render complete carousel with all components', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Slide 1</CarouselItem>
            <CarouselItem>Slide 2</CarouselItem>
            <CarouselItem>Slide 3</CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      )

      expect(screen.getByRole('region')).toBeInTheDocument()
      expect(screen.getAllByRole('group')).toHaveLength(3)
      expect(screen.getByRole('button', { name: /previous slide/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /next slide/i })).toBeInTheDocument()
    })

    it('should handle API events correctly', () => {
      render(<Carousel>Content</Carousel>)

      // Check that event listeners are set up
      expect(mockEmblaApi.on).toHaveBeenCalledWith('reInit', expect.any(Function))
      expect(mockEmblaApi.on).toHaveBeenCalledWith('select', expect.any(Function))
    })
  })
})
