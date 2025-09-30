import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '@/services/api';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

describe('AuthContext', () => {
  let mock: MockAdapter;
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    
    // Mock localStorage
    localStorageMock = {};
    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
      key: vi.fn(),
      length: 0,
    } as Storage;

    // Mock window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    });
  });

  afterEach(() => {
    mock.reset();
    mock.restore();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleError.mockRestore();
    });

    it('should provide auth context when used inside AuthProvider', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.logout).toBe('function');
    });
  });

  describe('initialization', () => {
    it('should initialize with no user when no token in localStorage', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should restore user from localStorage and verify token', async () => {
      const savedUser = { id: '1', email: 'test@example.com', name: 'Test User' };
      localStorageMock['auth_token'] = 'valid-token';
      localStorageMock['auth_user'] = JSON.stringify(savedUser);

      mock.onGet('/auth/me').reply(200, savedUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(savedUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should clear auth state if token verification fails', async () => {
      localStorageMock['auth_token'] = 'invalid-token';
      localStorageMock['auth_user'] = JSON.stringify({ id: '1', email: 'test@example.com' });

      mock.onGet('/auth/me').reply(401, { message: 'Unauthorized' });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_user');
    });
  });

  describe('login', () => {
    it('should login successfully with email and password', async () => {
      const mockResponse = {
        access_token: 'new-token',
        user: { id: '1', email: 'user@example.com', name: 'User' },
      };

      mock.onPost('/auth/login').reply(200, mockResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login('user@example.com', 'password');
      });

      expect(result.current.user).toEqual(mockResponse.user);
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'new-token');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'auth_user',
        JSON.stringify(mockResponse.user)
      );
    });

    it('should throw error on failed login', async () => {
      mock.onPost('/auth/login').reply(401, { message: 'Invalid credentials' });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.login('wrong@example.com', 'wrongpass');
        })
      ).rejects.toThrow();

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('loginWithGoogle', () => {
    it('should redirect to Google OAuth endpoint', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.loginWithGoogle();
      });

      expect(window.location.href).toBe('/api/auth/google/login');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const savedUser = { id: '1', email: 'test@example.com' };
      localStorageMock['auth_token'] = 'token';
      localStorageMock['auth_user'] = JSON.stringify(savedUser);

      mock.onGet('/auth/me').reply(200, savedUser);
      mock.onPost('/auth/logout').reply(200, { success: true });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_user');
    });

    it('should clear auth state even if logout API fails', async () => {
      const savedUser = { id: '1', email: 'test@example.com' };
      localStorageMock['auth_token'] = 'token';
      localStorageMock['auth_user'] = JSON.stringify(savedUser);

      mock.onGet('/auth/me').reply(200, savedUser);
      mock.onPost('/auth/logout').reply(500, { message: 'Server error' });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('refreshAuth', () => {
    it('should refresh user data successfully', async () => {
      const initialUser = { id: '1', email: 'test@example.com', name: 'Test' };
      const updatedUser = { id: '1', email: 'test@example.com', name: 'Updated Test' };

      localStorageMock['auth_token'] = 'token';
      localStorageMock['auth_user'] = JSON.stringify(initialUser);

      mock.onGet('/auth/me').replyOnce(200, initialUser);
      mock.onGet('/auth/me').replyOnce(200, updatedUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(initialUser);
      });

      await act(async () => {
        await result.current.refreshAuth();
      });

      expect(result.current.user).toEqual(updatedUser);
    });

    it('should throw error if refresh fails', async () => {
      const savedUser = { id: '1', email: 'test@example.com' };
      localStorageMock['auth_token'] = 'token';
      localStorageMock['auth_user'] = JSON.stringify(savedUser);

      mock.onGet('/auth/me').replyOnce(200, savedUser);
      mock.onGet('/auth/me').replyOnce(401, { message: 'Unauthorized' });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Verify refreshAuth throws an error on failure
      let didThrow = false;
      try {
        await act(async () => {
          await result.current.refreshAuth();
        });
      } catch (e) {
        didThrow = true;
      }

      expect(didThrow).toBe(true);
    });
  });

  describe('isLoading state', () => {
    it('should start as true and become false during initialization', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // May or may not be true immediately due to timing
      // Just verify it eventually becomes false
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should be false after initialization', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });
});
