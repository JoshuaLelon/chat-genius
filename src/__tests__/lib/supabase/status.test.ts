import { vi, describe, it, expect, beforeEach } from 'vitest';
import { updateStatus, getUserStatus, getUserStatuses } from '../../../lib/supabase';
import { supabase } from '../../../lib/supabase';

type SupabaseCallback<T> = (response: { data: T | null; error: Error | null }) => any;

vi.mock('../../../lib/supabase', () => {
  const mockChain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation((callback: SupabaseCallback<any>) => Promise.resolve(callback({ data: null, error: null }))),
  };

  return {
    supabase: {
      from: vi.fn().mockReturnValue(mockChain),
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
      },
    },
  };
});

describe('Status Supabase Functions', () => {
  let mockChain: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockChain = (supabase.from as any)();
  });

  describe('updateStatus', () => {
    it('should update status successfully', async () => {
      const mockStatus = {
        id: '1',
        user_id: 'test-user',
        status: 'online',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockChain.then.mockImplementation((callback: SupabaseCallback<typeof mockStatus>) => 
        Promise.resolve(callback({ data: mockStatus, error: null }))
      );

      const result = await updateStatus('online');
      expect(result).toEqual(mockStatus);
      expect(supabase.from).toHaveBeenCalledWith('user_status');
      expect(mockChain.upsert).toHaveBeenCalledWith({
        status: 'online',
      });
    });

    it('should throw error when user is not authenticated', async () => {
      (supabase.auth.getUser as any).mockResolvedValueOnce({ data: { user: null }, error: null });
      await expect(updateStatus('online')).rejects.toThrow('User not authenticated');
    });

    it('should throw error when update fails', async () => {
      mockChain.then.mockImplementation((callback: SupabaseCallback<null>) => 
        Promise.resolve(callback({ data: null, error: new Error('Database error') }))
      );

      await expect(updateStatus('online')).rejects.toThrow('Database error');
    });
  });

  describe('getUserStatus', () => {
    it('should get user status successfully', async () => {
      const mockStatus = {
        id: '1',
        user_id: 'user-1',
        status: 'online',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockChain.then.mockImplementation((callback: SupabaseCallback<typeof mockStatus>) => 
        Promise.resolve(callback({ data: mockStatus, error: null }))
      );

      const result = await getUserStatus('user-1');
      expect(result).toEqual(mockStatus);
      expect(supabase.from).toHaveBeenCalledWith('user_status');
      expect(mockChain.select).toHaveBeenCalled();
    });

    it('should throw error when query fails', async () => {
      mockChain.then.mockImplementation((callback: SupabaseCallback<null>) => 
        Promise.resolve(callback({ data: null, error: new Error('Database error') }))
      );

      await expect(getUserStatus('user-1')).rejects.toThrow('Database error');
    });
  });

  describe('getUserStatuses', () => {
    it('should get user statuses successfully', async () => {
      const mockStatuses = [
        {
          id: '1',
          user_id: 'user-1',
          status: 'online',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          user_id: 'user-2',
          status: 'offline',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockChain.then.mockImplementation((callback: SupabaseCallback<typeof mockStatuses>) => 
        Promise.resolve(callback({ data: mockStatuses, error: null }))
      );

      const result = await getUserStatuses(['user-1', 'user-2']);
      expect(result).toEqual(mockStatuses);
      expect(supabase.from).toHaveBeenCalledWith('user_status');
      expect(mockChain.select).toHaveBeenCalled();
    });

    it('should throw error when query fails', async () => {
      mockChain.then.mockImplementation((callback: SupabaseCallback<null>) => 
        Promise.resolve(callback({ data: null, error: new Error('Database error') }))
      );

      await expect(getUserStatuses(['user-1', 'user-2'])).rejects.toThrow('Database error');
    });
  });
}); 