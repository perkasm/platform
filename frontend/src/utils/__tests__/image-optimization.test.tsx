/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  OptimizedImage,
  preloadImage,
  preloadImages,
  generateSrcSet,
  useLazyImage
} from '../image-optimization';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
});
window.IntersectionObserver = mockIntersectionObserver;

describe('OptimizedImage Component', () => {
  let mockObserver: any;

  beforeEach(() => {
    mockObserver = {
      observe: vi.fn(),
      disconnect: vi.fn(),
      unobserve: vi.fn(),
    };
    mockIntersectionObserver.mockImplementation(() => mockObserver);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render with placeholder initially', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        placeholder="/placeholder.jpg"
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/placeholder.jpg');
    expect(img).toHaveClass('opacity-0');
  });

  it('should render without placeholder', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '');
    expect(img).toHaveClass('opacity-0');
  });

  it('should apply custom className', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        className="custom-class"
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toHaveClass('custom-class');
    expect(img).toHaveClass('opacity-0');
  });

  it('should set up intersection observer on mount', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
      />
    );

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      { rootMargin: '50px' }
    );
    expect(mockObserver.observe).toHaveBeenCalled();
  });

  it('should load image when intersecting', async () => {
    const mockCallback = vi.fn();
    mockIntersectionObserver.mockImplementation((callback) => {
      mockCallback.mockImplementation(callback);
      return mockObserver;
    });

    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
      />
    );

    // Simulate intersection
    const entries = [{ isIntersecting: true }];
    mockCallback(entries);

    await waitFor(() => {
      const img = screen.getByAltText('Test image');
      expect(img).toHaveAttribute('src', '/test-image.jpg');
    });

    expect(mockObserver.disconnect).toHaveBeenCalled();
  });

  it('should handle image load', async () => {
    const onLoad = vi.fn();

    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        onLoad={onLoad}
      />
    );

    const img = screen.getByAltText('Test image');
    img.dispatchEvent(new Event('load'));

    await waitFor(() => {
      expect(onLoad).toHaveBeenCalled();
      expect(img).toHaveClass('opacity-100');
    });
  });

  it('should handle image error', async () => {
    const onError = vi.fn();

    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        onError={onError}
      />
    );

    const img = screen.getByAltText('Test image');
    img.dispatchEvent(new Event('error'));

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
      expect(img).toHaveClass('opacity-0');
    });
  });

  it('should pass through additional props', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={100}
        height={100}
        data-testid="optimized-image"
      />
    );

    const img = screen.getByTestId('optimized-image');
    expect(img).toHaveAttribute('width', '100');
    expect(img).toHaveAttribute('height', '100');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
  });

  it('should cleanup observer on unmount', () => {
    const { unmount } = render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
      />
    );

    unmount();

    expect(mockObserver.disconnect).toHaveBeenCalled();
  });
});

describe('preloadImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should resolve when image loads successfully', async () => {
    const mockImage = {
      onload: null as any,
      onerror: null as any,
      src: '',
    };

    // Mock Image constructor
    global.Image = vi.fn().mockImplementation(() => mockImage) as any;

    const promise = preloadImage('/test-image.jpg');

    // Simulate successful load
    mockImage.onload();

    await expect(promise).resolves.toBeUndefined();
    expect(mockImage.src).toBe('/test-image.jpg');
  });

  it('should reject when image fails to load', async () => {
    const mockImage = {
      onload: null as any,
      onerror: null as any,
      src: '',
    };

    global.Image = vi.fn().mockImplementation(() => mockImage) as any;

    const promise = preloadImage('/test-image.jpg');

    // Simulate error
    mockImage.onerror(new Error('Failed to load'));

    await expect(promise).rejects.toThrow('Failed to load');
  });
});

describe('preloadImages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should preload multiple images successfully', async () => {
    const mockImages: any[] = [];

    // Create separate mock for each image
    global.Image = vi.fn().mockImplementation(() => {
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        src: '',
      };
      mockImages.push(mockImage);
      return mockImage;
    }) as any;

    const sources = ['/image1.jpg', '/image2.jpg', '/image3.jpg'];
    const promise = preloadImages(sources);

    // Simulate all images loading
    mockImages.forEach(mockImage => {
      mockImage.onload();
    });

    await expect(promise).resolves.toBeUndefined();
    expect(global.Image).toHaveBeenCalledTimes(3);
  });

  it('should reject if any image fails to load', async () => {
    const mockImages: any[] = [];

    global.Image = vi.fn().mockImplementation(() => {
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        src: '',
      };
      mockImages.push(mockImage);
      return mockImage;
    }) as any;

    const sources = ['/image1.jpg', '/image2.jpg'];
    const promise = preloadImages(sources);

    // Simulate first image loading, second failing
    mockImages[0].onload();
    mockImages[1].onerror(new Error('Failed to load'));

    await expect(promise).rejects.toThrow('Failed to load');
  });
});

describe('generateSrcSet', () => {
  it('should generate srcset with default sizes', () => {
    const result = generateSrcSet('/image.jpg');
    expect(result).toBe(
      '/image.jpg?w=320 320w, /image.jpg?w=640 640w, /image.jpg?w=960 960w, /image.jpg?w=1280 1280w, /image.jpg?w=1920 1920w'
    );
  });

  it('should generate srcset with custom sizes', () => {
    const result = generateSrcSet('/image.jpg', [480, 768, 1024]);
    expect(result).toBe(
      '/image.jpg?w=480 480w, /image.jpg?w=768 768w, /image.jpg?w=1024 1024w'
    );
  });

  it('should handle empty sizes array', () => {
    const result = generateSrcSet('/image.jpg', []);
    expect(result).toBe('');
  });
});

describe('useLazyImage Hook', () => {
  let mockObserver: any;
  let mockImages: any[];

  beforeEach(() => {
    mockImages = [];
    mockObserver = {
      observe: vi.fn(),
      disconnect: vi.fn(),
      unobserve: vi.fn(),
    };
    mockIntersectionObserver.mockImplementation(() => mockObserver);

    // Mock Image constructor
    global.Image = vi.fn().mockImplementation(() => {
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        src: '',
      };
      mockImages.push(mockImage);
      return mockImage;
    }) as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockImages = [];
  });

  it('should initialize with placeholder or empty string', () => {
    const TestComponent = () => {
      const { imageSrc, isLoaded, isError } = useLazyImage('/test.jpg', '/placeholder.jpg');
      return (
        <div>
          <span data-testid="src">{imageSrc}</span>
          <span data-testid="loaded">{isLoaded.toString()}</span>
          <span data-testid="error">{isError.toString()}</span>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByTestId('src')).toHaveTextContent('/placeholder.jpg');
    expect(screen.getByTestId('loaded')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('false');
  });

  it('should load image when intersecting', async () => {
    const mockCallback = vi.fn();
    mockIntersectionObserver.mockImplementation((callback) => {
      mockCallback.mockImplementation(callback);
      return mockObserver;
    });

    const TestComponent = () => {
      const { imageSrc, isLoaded, isError, imgRef } = useLazyImage('/test.jpg');
      return (
        <div>
          <img ref={imgRef} data-testid="lazy-img" alt="test" />
          <span data-testid="src">{imageSrc}</span>
          <span data-testid="loaded">{isLoaded.toString()}</span>
          <span data-testid="error">{isError.toString()}</span>
        </div>
      );
    };

    render(<TestComponent />);

    // Simulate intersection
    const entries = [{ isIntersecting: true }];
    mockCallback(entries);

    // Trigger image load
    if (mockImages[0]) {
      mockImages[0].onload();
    }

    await waitFor(() => {
      expect(screen.getByTestId('src')).toHaveTextContent('/test.jpg');
      expect(screen.getByTestId('loaded')).toHaveTextContent('true');
      expect(screen.getByTestId('error')).toHaveTextContent('false');
    });
  });

  it('should handle image load error', async () => {
    const mockCallback = vi.fn();
    mockIntersectionObserver.mockImplementation((callback) => {
      mockCallback.mockImplementation(callback);
      return mockObserver;
    });

    const TestComponent = () => {
      const { imageSrc, isLoaded, isError, imgRef } = useLazyImage('/test.jpg');
      return (
        <div>
          <img ref={imgRef} data-testid="lazy-img" alt="test" />
          <span data-testid="src">{imageSrc}</span>
          <span data-testid="loaded">{isLoaded.toString()}</span>
          <span data-testid="error">{isError.toString()}</span>
        </div>
      );
    };

    render(<TestComponent />);

    // Simulate intersection
    const entries = [{ isIntersecting: true }];
    mockCallback(entries);

    // Trigger image error
    if (mockImages[0]) {
      mockImages[0].onerror(new Error('Failed to load'));
    }

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('true');
      expect(screen.getByTestId('loaded')).toHaveTextContent('false');
    });
  });

  it('should return imgRef', () => {
    const TestComponent = () => {
      const { imgRef } = useLazyImage('/test.jpg');
      return <img ref={imgRef} data-testid="test-img" alt="test" />;
    };

    render(<TestComponent />);

    const img = screen.getByTestId('test-img');
    expect(img).toBeInTheDocument();
  });

  it('should cleanup observer on unmount', () => {
    const TestComponent = () => {
      const { imgRef } = useLazyImage('/test.jpg');
      return <img ref={imgRef} data-testid="test-img" alt="test" />;
    };

    const { unmount } = render(<TestComponent />);

    unmount();

    expect(mockObserver.disconnect).toHaveBeenCalled();
  });
});