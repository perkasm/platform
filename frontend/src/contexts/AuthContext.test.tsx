import { render, act } from '@testing-library/react';
import { useAuth, AuthProvider } from './AuthContext';
import React from 'react';
import { vi } from 'vitest';

const TestComponent: React.FC = () => {
  const { token, user, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="token">{token}</div>
      <div data-testid="user">{JSON.stringify(user)}</div>
      <button onClick={() => login('test-token', { name: 'Test User' })}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  it('should provide auth context values', () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByTestId('token').textContent).toBe('');
    expect(getByTestId('user').textContent).toBe('null');
  });

  it('should update auth context on login', () => {
    const { getByTestId, getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    act(() => {
      getByText('Login').click();
    });

    expect(getByTestId('token').textContent).toBe('test-token');
    expect(getByTestId('user').textContent).toBe(JSON.stringify({ name: 'Test User' }));
  });

  it('should clear auth context on logout', () => {
    const { getByTestId, getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    act(() => {
      getByText('Login').click();
    });

    act(() => {
      getByText('Logout').click();
    });



    expect(getByTestId('token').textContent).toBe('');
    expect(getByTestId('user').textContent).toBe('null');
  });

  it('should throw an error if useAuth is used outside of AuthProvider', () => {
    // Prevent console.error from polluting the test output
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => render(<TestComponent />)).toThrow(
      'useAuth must be used within an AuthProvider'
    );

    console.error = originalError;
  });
});