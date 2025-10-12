import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from './card';

describe('Card Component', () => {
  describe('Card', () => {
    it('should render card with children', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should apply base styles', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('rounded-lg', 'border', 'bg-card', 'text-card-foreground', 'shadow-sm');
    });

    it('should apply custom className', () => {
      render(<Card className="custom-class" data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-class');
    });

    it('should forward ref', () => {
      const ref = vi.fn();
      render(<Card ref={ref}>Content</Card>);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
    });

    it('should support HTML attributes', () => {
      render(<Card data-testid="card" id="my-card" role="article">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('id', 'my-card');
      expect(card).toHaveAttribute('role', 'article');
    });

    it('should render without children', () => {
      const { container } = render(<Card />);
      expect(container.querySelector('div')).toBeInTheDocument();
    });
  });

  describe('CardHeader', () => {
    it('should render header with children', () => {
      render(<CardHeader>Header content</CardHeader>);
      expect(screen.getByText('Header content')).toBeInTheDocument();
    });

    it('should apply base styles', () => {
      render(<CardHeader data-testid="header">Content</CardHeader>);
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
    });

    it('should apply custom className', () => {
      render(<CardHeader className="custom-header" data-testid="header">Content</CardHeader>);
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('custom-header');
    });

    it('should forward ref', () => {
      const ref = vi.fn();
      render(<CardHeader ref={ref}>Content</CardHeader>);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
    });

    it('should support HTML attributes', () => {
      render(<CardHeader data-testid="header" id="card-header">Content</CardHeader>);
      const header = screen.getByTestId('header');
      expect(header).toHaveAttribute('id', 'card-header');
    });
  });

  describe('CardTitle', () => {
    it('should render title with children', () => {
      render(<CardTitle>My Title</CardTitle>);
      expect(screen.getByText('My Title')).toBeInTheDocument();
    });

    it('should render as h3 element', () => {
      render(<CardTitle>Title</CardTitle>);
      const title = screen.getByText('Title');
      expect(title.tagName).toBe('H3');
    });

    it('should apply base styles', () => {
      render(<CardTitle>Title</CardTitle>);
      const title = screen.getByText('Title');
      expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight');
    });

    it('should apply custom className', () => {
      render(<CardTitle className="custom-title">Title</CardTitle>);
      const title = screen.getByText('Title');
      expect(title).toHaveClass('custom-title');
    });

    it('should forward ref', () => {
      const ref = vi.fn();
      render(<CardTitle ref={ref}>Title</CardTitle>);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLHeadingElement);
    });

    it('should support HTML attributes', () => {
      render(<CardTitle data-testid="title" id="my-title">Title</CardTitle>);
      const title = screen.getByTestId('title');
      expect(title).toHaveAttribute('id', 'my-title');
    });
  });

  describe('CardDescription', () => {
    it('should render description with children', () => {
      render(<CardDescription>Card description text</CardDescription>);
      expect(screen.getByText('Card description text')).toBeInTheDocument();
    });

    it('should render as p element', () => {
      render(<CardDescription>Description</CardDescription>);
      const description = screen.getByText('Description');
      expect(description.tagName).toBe('P');
    });

    it('should apply base styles', () => {
      render(<CardDescription>Description</CardDescription>);
      const description = screen.getByText('Description');
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });

    it('should apply custom className', () => {
      render(<CardDescription className="custom-desc">Description</CardDescription>);
      const description = screen.getByText('Description');
      expect(description).toHaveClass('custom-desc');
    });

    it('should forward ref', () => {
      const ref = vi.fn();
      render(<CardDescription ref={ref}>Description</CardDescription>);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLParagraphElement);
    });

    it('should support HTML attributes', () => {
      render(<CardDescription data-testid="desc" id="my-desc">Description</CardDescription>);
      const description = screen.getByTestId('desc');
      expect(description).toHaveAttribute('id', 'my-desc');
    });
  });

  describe('CardContent', () => {
    it('should render content with children', () => {
      render(<CardContent>Main content here</CardContent>);
      expect(screen.getByText('Main content here')).toBeInTheDocument();
    });

    it('should apply base styles', () => {
      render(<CardContent data-testid="content">Content</CardContent>);
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('p-6', 'pt-0');
    });

    it('should apply custom className', () => {
      render(<CardContent className="custom-content" data-testid="content">Content</CardContent>);
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('custom-content');
    });

    it('should forward ref', () => {
      const ref = vi.fn();
      render(<CardContent ref={ref}>Content</CardContent>);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
    });

    it('should support HTML attributes', () => {
      render(<CardContent data-testid="content" id="card-content">Content</CardContent>);
      const content = screen.getByTestId('content');
      expect(content).toHaveAttribute('id', 'card-content');
    });
  });

  describe('CardFooter', () => {
    it('should render footer with children', () => {
      render(<CardFooter>Footer content</CardFooter>);
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('should apply base styles', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>);
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
    });

    it('should apply custom className', () => {
      render(<CardFooter className="custom-footer" data-testid="footer">Footer</CardFooter>);
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('custom-footer');
    });

    it('should forward ref', () => {
      const ref = vi.fn();
      render(<CardFooter ref={ref}>Footer</CardFooter>);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
    });

    it('should support HTML attributes', () => {
      render(<CardFooter data-testid="footer" id="card-footer">Footer</CardFooter>);
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveAttribute('id', 'card-footer');
    });
  });

  describe('Composition', () => {
    it('should render complete card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Complete Card</CardTitle>
            <CardDescription>This is a complete card example</CardDescription>
          </CardHeader>
          <CardContent>
            Main content area
          </CardContent>
          <CardFooter>
            Footer actions
          </CardFooter>
        </Card>
      );

      expect(screen.getByText('Complete Card')).toBeInTheDocument();
      expect(screen.getByText('This is a complete card example')).toBeInTheDocument();
      expect(screen.getByText('Main content area')).toBeInTheDocument();
      expect(screen.getByText('Footer actions')).toBeInTheDocument();
    });

    it('should render card with only header and content', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title Only</CardTitle>
          </CardHeader>
          <CardContent>Content only</CardContent>
        </Card>
      );

      expect(screen.getByText('Title Only')).toBeInTheDocument();
      expect(screen.getByText('Content only')).toBeInTheDocument();
    });

    it('should render card with only content', () => {
      render(
        <Card>
          <CardContent>Minimal card</CardContent>
        </Card>
      );

      expect(screen.getByText('Minimal card')).toBeInTheDocument();
    });

    it('should render multiple cards', () => {
      render(
        <>
          <Card>
            <CardTitle>Card 1</CardTitle>
          </Card>
          <Card>
            <CardTitle>Card 2</CardTitle>
          </Card>
        </>
      );

      expect(screen.getByText('Card 1')).toBeInTheDocument();
      expect(screen.getByText('Card 2')).toBeInTheDocument();
    });

    it('should handle nested content in CardContent', () => {
      render(
        <Card>
          <CardContent>
            <div data-testid="nested">
              <p>Paragraph 1</p>
              <p>Paragraph 2</p>
            </div>
          </CardContent>
        </Card>
      );

      expect(screen.getByTestId('nested')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
    });

    it('should handle multiple elements in footer', () => {
      render(
        <Card>
          <CardFooter>
            <button>Cancel</button>
            <button>Submit</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });
  });

  describe('Style Customization', () => {
    it('should merge custom classes with base classes', () => {
      render(<Card className="bg-blue-500" data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('bg-blue-500', 'rounded-lg', 'border');
    });

    it('should allow header customization', () => {
      render(<CardHeader className="bg-gray-100 p-4" data-testid="header">Header</CardHeader>);
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('bg-gray-100', 'p-4', 'flex', 'flex-col');
    });

    it('should allow title customization', () => {
      render(<CardTitle className="text-red-500">Title</CardTitle>);
      const title = screen.getByText('Title');
      expect(title).toHaveClass('text-red-500', 'font-semibold');
    });

    it('should allow description customization', () => {
      render(<CardDescription className="text-lg">Description</CardDescription>);
      const description = screen.getByText('Description');
      expect(description).toHaveClass('text-lg', 'text-muted-foreground');
    });

    it('should allow content customization', () => {
      render(<CardContent className="p-8" data-testid="content">Content</CardContent>);
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('p-8');
    });

    it('should allow footer customization', () => {
      render(<CardFooter className="justify-end" data-testid="footer">Footer</CardFooter>);
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('justify-end', 'flex', 'items-center');
    });
  });

  describe('Accessibility', () => {
    it('should support ARIA attributes on Card', () => {
      render(
        <Card role="article" aria-labelledby="card-title">
          <CardTitle id="card-title">Accessible Card</CardTitle>
        </Card>
      );
      
      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-labelledby', 'card-title');
    });

    it('should support ARIA attributes on CardTitle', () => {
      render(<CardTitle aria-level={2}>Title</CardTitle>);
      const title = screen.getByText('Title');
      expect(title).toHaveAttribute('aria-level', '2');
    });

    it('should support ARIA attributes on CardDescription', () => {
      render(<CardDescription aria-live="polite">Description</CardDescription>);
      const description = screen.getByText('Description');
      expect(description).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty card', () => {
      const { container } = render(<Card />);
      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should handle empty header', () => {
      const { container } = render(<CardHeader />);
      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should handle empty title', () => {
      const { container } = render(<CardTitle />);
      expect(container.querySelector('h3')).toBeInTheDocument();
    });

    it('should handle empty description', () => {
      const { container } = render(<CardDescription />);
      expect(container.querySelector('p')).toBeInTheDocument();
    });

    it('should handle empty content', () => {
      const { container } = render(<CardContent />);
      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should handle empty footer', () => {
      const { container } = render(<CardFooter />);
      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should handle null className', () => {
      // @ts-expect-error: Testing null className
      render(<Card className={null}>Content</Card>);
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should handle undefined className', () => {
      render(<Card className={undefined}>Content</Card>);
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });
});
