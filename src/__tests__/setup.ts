import { vi } from 'vitest';

// Mock Next.js features
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));

// Mock Supabase auth helpers
vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
          },
        },
      }),
    },
  }),
})); 