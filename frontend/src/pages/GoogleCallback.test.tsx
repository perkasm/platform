import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import GoogleCallback from './GoogleCallback';
import { vi, describe, it, expect } from 'vitest';

const mockFetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ token: 'fake-token' }),
  })
);

global.fetch = mockFetch as unknown as typeof fetch;

describe('GoogleCallback', () => {
  it('should extract code and call the backend', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:8001/api/v1');
    const route = '/auth/google/callback?code=test-code';

    render(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
        </Routes>
      </MemoryRouter>
    );

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8001/api/v1/auth/google/callback?code=test-code',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    vi.unstubAllEnvs();
  });
});
