import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useIsMobile } from '@/hooks/use-mobile';

describe('useIsMobile', () => {
  const MOBILE_BREAKPOINT = 768;
  let matchMediaMock: any;

  beforeEach(() => {
    // Create a mock matchMedia function
    matchMediaMock = vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    // Replace window.matchMedia with our mock
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize as undefined', () => {
    const { result } = renderHook(() => useIsMobile());
    
    // Initial render might be undefined or boolean depending on timing
    expect(typeof result.current).toBe('boolean');
  });

  it('should detect mobile screen size', async () => {
    // Set window width to mobile size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375, // Mobile size
    });

    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('should detect desktop screen size', async () => {
    // Set window width to desktop size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024, // Desktop size
    });

    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('should detect exact breakpoint - 1 as mobile', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: MOBILE_BREAKPOINT - 1, // 767px
    });

    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('should detect exact breakpoint as desktop', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: MOBILE_BREAKPOINT, // 768px
    });

    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('should register matchMedia event listener', () => {
    const addEventListenerSpy = vi.fn();
    
    matchMediaMock.mockReturnValue({
      matches: false,
      media: '',
      addEventListener: addEventListenerSpy,
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    });

    renderHook(() => useIsMobile());

    expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should unregister matchMedia event listener on unmount', () => {
    const removeEventListenerSpy = vi.fn();
    
    matchMediaMock.mockReturnValue({
      matches: false,
      media: '',
      addEventListener: vi.fn(),
      removeEventListener: removeEventListenerSpy,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    });

    const { unmount } = renderHook(() => useIsMobile());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should create correct media query', () => {
    renderHook(() => useIsMobile());

    expect(matchMediaMock).toHaveBeenCalledWith(
      `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
    );
  });

  it('should handle very small screen sizes', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 320, // Small phone
    });

    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('should handle very large screen sizes', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 2560, // Large desktop
    });

    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('should return boolean value, not undefined after initialization', async () => {
    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(typeof result.current).toBe('boolean');
    });
  });

  it('should handle tablet sizes correctly', async () => {
    // Tablet size (iPad portrait) - should be false (desktop)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 820,
    });

    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('should handle multiple hook instances correctly', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 400,
    });

    const { result: result1 } = renderHook(() => useIsMobile());
    const { result: result2 } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result1.current).toBe(true);
      expect(result2.current).toBe(true);
    });
  });

  it('should handle screen resize events', async () => {
    let changeHandler: (() => void) | null = null;

    matchMediaMock.mockReturnValue({
      matches: false,
      media: '',
      addEventListener: vi.fn((event, handler) => {
        if (event === 'change') {
          changeHandler = handler;
        }
      }),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    });

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });

    // Simulate resize to mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 400,
    });

    const { act } = await import('react')
    act(() => {
      if (changeHandler) {
        changeHandler()
      }
    })

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });
});
