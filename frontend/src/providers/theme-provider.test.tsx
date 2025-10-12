import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from './theme-provider';

// Mock next-themes
vi.mock('next-themes', () => ({
  ThemeProvider: vi.fn(({ children, ...props }) => (
    <div data-testid="next-themes-provider" data-props={JSON.stringify(props)}>
      {children}
    </div>
  )),
}));

describe('ThemeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should render children correctly', () => {
    const testContent = 'Test Content';

    render(
      <ThemeProvider>
        <div>{testContent}</div>
      </ThemeProvider>
    );

    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it('should forward props to next-themes ThemeProvider', () => {
    const props = {
      attribute: 'class' as const,
      defaultTheme: 'system',
      enableSystem: true,
    };

    render(
      <ThemeProvider {...props}>
        <div>Test</div>
      </ThemeProvider>
    );

    const provider = screen.getByTestId('next-themes-provider');
    const forwardedProps = JSON.parse(provider.getAttribute('data-props') || '{}');

    expect(forwardedProps).toEqual(props);
  });

  it('should handle different attribute values', () => {
    const attributes = ['class', 'data-theme', 'data-mode'] as const;

    attributes.forEach(attribute => {
      const { unmount } = render(
        <ThemeProvider attribute={attribute}>
          <div>Test</div>
        </ThemeProvider>
      );

      const provider = screen.getByTestId('next-themes-provider');
      const props = JSON.parse(provider.getAttribute('data-props') || '{}');

      expect(props.attribute).toBe(attribute);
      unmount();
    });
  });

  it('should handle different default themes', () => {
    const themes = ['light', 'dark', 'system'];

    themes.forEach(theme => {
      const { unmount } = render(
        <ThemeProvider defaultTheme={theme}>
          <div>Test</div>
        </ThemeProvider>
      );

      const provider = screen.getByTestId('next-themes-provider');
      const props = JSON.parse(provider.getAttribute('data-props') || '{}');

      expect(props.defaultTheme).toBe(theme);
      unmount();
    });
  });

  it('should handle enableSystem prop', () => {
    render(
      <ThemeProvider enableSystem={true}>
        <div>Test</div>
      </ThemeProvider>
    );

    const provider = screen.getByTestId('next-themes-provider');
    const props = JSON.parse(provider.getAttribute('data-props') || '{}');

    expect(props.enableSystem).toBe(true);
  });
});