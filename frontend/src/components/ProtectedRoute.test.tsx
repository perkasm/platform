import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';

const TestComponent: React.FC = () => <div>Protected Content</div>;

const renderWithRouter = (
  ui: React.ReactElement,
  { route = '/', authState = { token: null, user: null, login: () => {}, logout: () => {} } } = {}
) => {
  return render(
    <AuthContext.Provider value={authState}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<TestComponent />} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('ProtectedRoute', () => {
  it('should redirect to /login if user is not authenticated', () => {
    const { getByText } = renderWithRouter(
        <TestComponent />
    );
    expect(getByText('Login Page')).toBeInTheDocument();
  });

  it('should render the component if user is authenticated', () => {
    const { getByText } = renderWithRouter(
      <TestComponent />,
      {
        route: '/',
        authState: { token: 'test-token', user: { name: 'Test User' }, login: () => {}, logout: () => {} },
      }
    );
    expect(getByText('Protected Content')).toBeInTheDocument();
  });
});