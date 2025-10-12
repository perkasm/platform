import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from './NotFound';

// Mock console.error to avoid test output pollution
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('NotFound', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Initial Render', () => {
    it('should render 404 error page with correct content', () => {
      render(
        <MemoryRouter initialEntries={['/non-existent-route']}>
          <NotFound />
        </MemoryRouter>
      );

      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText('Oops! Page not found')).toBeInTheDocument();
      expect(screen.getByText('Return to Home')).toBeInTheDocument();
    });

    it('should render with correct styling and layout', () => {
      render(
        <MemoryRouter initialEntries={['/invalid-path']}>
          <NotFound />
        </MemoryRouter>
      );

      // Check main container
      const container = screen.getByText('404').closest('.min-h-screen');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('flex', 'items-center', 'justify-center', 'bg-gray-100');

      // Check content wrapper
      const contentDiv = screen.getByText('404').parentElement;
      expect(contentDiv).toHaveClass('text-center');

      // Check heading
      const heading = screen.getByText('404');
      expect(heading).toHaveClass('text-4xl', 'font-bold', 'mb-4');

      // Check paragraph
      const paragraph = screen.getByText('Oops! Page not found');
      expect(paragraph).toHaveClass('text-xl', 'text-gray-600', 'mb-4');

      // Check link
      const link = screen.getByText('Return to Home');
      expect(link).toHaveClass('text-blue-500', 'hover:text-blue-700', 'underline');
    });

    it('should render link with correct href', () => {
      render(
        <MemoryRouter initialEntries={['/some-missing-page']}>
          <NotFound />
        </MemoryRouter>
      );

      const link = screen.getByText('Return to Home');
      expect(link).toHaveAttribute('href', '/');
    });
  });

  describe('Navigation', () => {
    it('should render as a link that can be clicked', () => {
      render(
        <MemoryRouter initialEntries={['/missing-page']}>
          <NotFound />
        </MemoryRouter>
      );

      const link = screen.getByText('Return to Home');
      expect(link.tagName).toBe('A');
      expect(link).toBeInTheDocument();
    });

    it('should maintain link functionality', () => {
      render(
        <MemoryRouter initialEntries={['/not-found']}>
          <NotFound />
        </MemoryRouter>
      );

      const link = screen.getByText('Return to Home');
      expect(link).toBeEnabled();
      expect(link).toHaveAttribute('href', '/');
    });
  });

  describe('Accessibility', () => {
    it('should have semantic heading structure', () => {
      render(
        <MemoryRouter initialEntries={['/404-test']}>
          <NotFound />
        </MemoryRouter>
      );

      const heading = screen.getByText('404');
      expect(heading.tagName).toBe('H1');
    });

    it('should have descriptive text for screen readers', () => {
      render(
        <MemoryRouter initialEntries={['/accessibility-test']}>
          <NotFound />
        </MemoryRouter>
      );

      expect(screen.getByText('Oops! Page not found')).toBeInTheDocument();
      expect(screen.getByText('Return to Home')).toBeInTheDocument();
    });

    it('should be keyboard accessible', () => {
      render(
        <MemoryRouter initialEntries={['/keyboard-test']}>
          <NotFound />
        </MemoryRouter>
      );

      const link = screen.getByText('Return to Home');
      expect(link).toBeVisible();
      expect(link).toHaveAttribute('href', '/');
    });
  });

  describe('Component Behavior', () => {
    it('should be a functional component', () => {
      expect(typeof NotFound).toBe('function');
    });

    it('should render without crashing', () => {
      expect(() => {
        render(
          <MemoryRouter initialEntries={['/crash-test']}>
            <NotFound />
          </MemoryRouter>
        );
      }).not.toThrow();
    });
  });

  describe('Styling and Layout', () => {
    it('should use responsive design classes', () => {
      render(
        <MemoryRouter initialEntries={['/responsive-test']}>
          <NotFound />
        </MemoryRouter>
      );

      const container = screen.getByText('404').closest('.min-h-screen');
      expect(container).toHaveClass('min-h-screen');
    });

    it('should have proper text hierarchy', () => {
      render(
        <MemoryRouter initialEntries={['/hierarchy-test']}>
          <NotFound />
        </MemoryRouter>
      );

      const heading = screen.getByText('404');
      const subheading = screen.getByText('Oops! Page not found');

      expect(heading).toHaveClass('text-4xl', 'font-bold');
      expect(subheading).toHaveClass('text-xl');
    });

    it('should have hover effects on interactive elements', () => {
      render(
        <MemoryRouter initialEntries={['/hover-test']}>
          <NotFound />
        </MemoryRouter>
      );

      const link = screen.getByText('Return to Home');
      expect(link).toHaveClass('hover:text-blue-700');
    });
  });
});