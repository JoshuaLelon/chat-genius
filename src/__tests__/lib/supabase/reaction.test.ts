import { vi, describe, it, expect, beforeEach } from 'vitest';
import { addReaction, removeReaction, getReactions } from '../../../lib/supabase';
import { supabase } from '../../../lib/supabase';

type SupabaseCallback<T> = (response: { data: T | null; error: Error | null }) => any;

vi.mock('../../../lib/supabase', () => {
  const mockChain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
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

describe('Reaction Supabase Functions', () => {
  let mockChain: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockChain = (supabase.from as any)();
  });

  describe('addReaction', () => {
    it('should add a reaction successfully', async () => {
      const mockReaction = {
        id: '1',
        message_id: 'message-1',
        user_id: 'test-user',
        emoji: '👍',
        created_at: new Date().toISOString(),
      };

      mockChain.then.mockImplementation((callback: SupabaseCallback<typeof mockReaction>) => 
        Promise.resolve(callback({ data: mockReaction, error: null }))
      );

      const result = await addReaction('message-1', '👍');
      expect(result).toEqual(mockReaction);
      expect(supabase.from).toHaveBeenCalledWith('reactions');
      expect(mockChain.insert).toHaveBeenCalledWith({
        message_id: 'message-1',
        emoji: '👍',
      });
    });

    it('should throw error when user is not authenticated', async () => {
      (supabase.auth.getUser as any).mockResolvedValueOnce({ data: { user: null }, error: null });
      await expect(addReaction('message-1', '👍')).rejects.toThrow('User not authenticated');
    });

    it('should throw error when insert fails', async () => {
      mockChain.then.mockImplementation((callback: SupabaseCallback<null>) => 
        Promise.resolve(callback({ data: null, error: new Error('Database error') }))
      );

      await expect(addReaction('message-1', '👍')).rejects.toThrow('Database error');
    });
  });

  describe('removeReaction', () => {
    it('should remove a reaction successfully', async () => {
      mockChain.then.mockImplementation((callback: SupabaseCallback<null>) => 
        Promise.resolve(callback({ data: null, error: null }))
      );

      await expect(removeReaction('message-1', '👍')).resolves.not.toThrow();
      expect(supabase.from).toHaveBeenCalledWith('reactions');
      expect(mockChain.delete).toHaveBeenCalled();
    });

    it('should throw error when user is not authenticated', async () => {
      (supabase.auth.getUser as any).mockResolvedValueOnce({ data: { user: null }, error: null });
      await expect(removeReaction('message-1', '👍')).rejects.toThrow('User not authenticated');
    });

    it('should throw error when delete fails', async () => {
      mockChain.then.mockImplementation((callback: SupabaseCallback<null>) => 
        Promise.resolve(callback({ data: null, error: new Error('Database error') }))
      );

      await expect(removeReaction('message-1', '👍')).rejects.toThrow('Database error');
    });
  });

  describe('getReactions', () => {
    it('should get reactions successfully', async () => {
      const mockReactions = [
        {
          id: '1',
          message_id: 'message-1',
          user_id: 'test-user',
          emoji: '👍',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          message_id: 'message-1',
          user_id: 'test-user-2',
          emoji: '❤️',
          created_at: new Date().toISOString(),
        },
      ];

      mockChain.then.mockImplementation((callback: SupabaseCallback<typeof mockReactions>) => 
        Promise.resolve(callback({ data: mockReactions, error: null }))
      );

      const result = await getReactions('message-1');
      expect(result).toEqual(mockReactions);
      expect(supabase.from).toHaveBeenCalledWith('reactions');
      expect(mockChain.select).toHaveBeenCalled();
    });

    it('should throw error when query fails', async () => {
      mockChain.then.mockImplementation((callback: SupabaseCallback<null>) => 
        Promise.resolve(callback({ data: null, error: new Error('Database error') }))
      );

      await expect(getReactions('message-1')).rejects.toThrow('Database error');
    });
  });
}); 