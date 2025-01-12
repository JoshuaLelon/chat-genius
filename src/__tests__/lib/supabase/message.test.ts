import { vi, describe, it, expect, beforeEach } from 'vitest';
import { createMessage, getMessages, updateMessage, deleteMessage } from '../../../lib/supabase';
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

describe('Message Supabase Functions', () => {
  let mockChain: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockChain = (supabase.from as any)();
  });

  describe('createMessage', () => {
    it('should create a message successfully', async () => {
      const mockMessage = {
        id: '1',
        content: 'Test message',
        channel_id: 'channel-1',
        user_id: 'test-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockChain.then.mockImplementation((callback: SupabaseCallback<typeof mockMessage>) => 
        Promise.resolve(callback({ data: mockMessage, error: null }))
      );

      const result = await createMessage('channel-1', 'Test message');
      expect(result).toEqual(mockMessage);
      expect(supabase.from).toHaveBeenCalledWith('messages');
      expect(mockChain.insert).toHaveBeenCalledWith({
        content: 'Test message',
        channel_id: 'channel-1',
      });
    });

    it('should throw error when user is not authenticated', async () => {
      (supabase.auth.getUser as any).mockResolvedValueOnce({ data: { user: null }, error: null });
      await expect(createMessage('channel-1', 'Test message')).rejects.toThrow('User not authenticated');
    });

    it('should throw error when insert fails', async () => {
      mockChain.then.mockImplementation((callback: SupabaseCallback<null>) => 
        Promise.resolve(callback({ data: null, error: new Error('Database error') }))
      );

      await expect(createMessage('channel-1', 'Test message')).rejects.toThrow('Database error');
    });
  });

  describe('getMessages', () => {
    it('should get messages successfully', async () => {
      const mockMessages = [
        {
          id: '1',
          content: 'Test message 1',
          channel_id: 'channel-1',
          user_id: 'test-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          content: 'Test message 2',
          channel_id: 'channel-1',
          user_id: 'test-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockChain.then.mockImplementation((callback: SupabaseCallback<typeof mockMessages>) => 
        Promise.resolve(callback({ data: mockMessages, error: null }))
      );

      const result = await getMessages('channel-1');
      expect(result).toEqual(mockMessages);
      expect(supabase.from).toHaveBeenCalledWith('messages');
      expect(mockChain.select).toHaveBeenCalled();
    });

    it('should handle pagination with before parameter', async () => {
      const mockMessages = [
        {
          id: '1',
          content: 'Test message 1',
          channel_id: 'channel-1',
          user_id: 'test-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockChain.then.mockImplementation((callback: SupabaseCallback<typeof mockMessages>) => 
        Promise.resolve(callback({ data: mockMessages, error: null }))
      );

      const result = await getMessages('channel-1', 10, '2023-01-01');
      expect(result).toEqual(mockMessages);
      expect(supabase.from).toHaveBeenCalledWith('messages');
      expect(mockChain.select).toHaveBeenCalled();
    });

    it('should throw error when query fails', async () => {
      mockChain.then.mockImplementation((callback: SupabaseCallback<null>) => 
        Promise.resolve(callback({ data: null, error: new Error('Database error') }))
      );

      await expect(getMessages('channel-1')).rejects.toThrow('Database error');
    });
  });

  describe('updateMessage', () => {
    it('should update message successfully', async () => {
      const mockMessage = {
        id: '1',
        content: 'Updated message',
        channel_id: 'channel-1',
        user_id: 'test-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockChain.then.mockImplementation((callback: SupabaseCallback<typeof mockMessage>) => 
        Promise.resolve(callback({ data: mockMessage, error: null }))
      );

      const result = await updateMessage('1', 'Updated message');
      expect(result).toEqual(mockMessage);
      expect(supabase.from).toHaveBeenCalledWith('messages');
      expect(mockChain.update).toHaveBeenCalledWith({ content: 'Updated message' });
    });

    it('should throw error when user is not authenticated', async () => {
      (supabase.auth.getUser as any).mockResolvedValueOnce({ data: { user: null }, error: null });
      await expect(updateMessage('1', 'Updated message')).rejects.toThrow('User not authenticated');
    });

    it('should throw error when update fails', async () => {
      mockChain.then.mockImplementation((callback: SupabaseCallback<null>) => 
        Promise.resolve(callback({ data: null, error: new Error('Database error') }))
      );

      await expect(updateMessage('1', 'Updated message')).rejects.toThrow('Database error');
    });
  });

  describe('deleteMessage', () => {
    it('should delete message successfully', async () => {
      mockChain.then.mockImplementation((callback: SupabaseCallback<null>) => 
        Promise.resolve(callback({ data: null, error: null }))
      );

      await expect(deleteMessage('1')).resolves.not.toThrow();
      expect(supabase.from).toHaveBeenCalledWith('messages');
      expect(mockChain.delete).toHaveBeenCalled();
    });

    it('should throw error when user is not authenticated', async () => {
      (supabase.auth.getUser as any).mockResolvedValueOnce({ data: { user: null }, error: null });
      await expect(deleteMessage('1')).rejects.toThrow('User not authenticated');
    });

    it('should throw error when delete fails', async () => {
      mockChain.then.mockImplementation((callback: SupabaseCallback<null>) => 
        Promise.resolve(callback({ data: null, error: new Error('Database error') }))
      );

      await expect(deleteMessage('1')).rejects.toThrow('Database error');
    });
  });
}); 