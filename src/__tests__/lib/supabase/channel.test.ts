import { vi, describe, it, expect, beforeEach } from 'vitest';
import { createChannel, getChannels, updateChannel, deleteChannel } from '../../../lib/supabase';
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

describe('Channel Supabase Functions', () => {
  let mockChain: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockChain = (supabase.from as any)();
  });

  describe('createChannel', () => {
    it('should create a channel successfully', async () => {
      const mockChannel = {
        id: '1',
        name: 'Test Channel',
        workspace_id: 'workspace-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockChain.then.mockImplementation((callback: SupabaseCallback<typeof mockChannel>) => 
        Promise.resolve(callback({ data: mockChannel, error: null }))
      );

      const result = await createChannel('workspace-1', 'Test Channel');
      expect(result).toEqual(mockChannel);
      expect(supabase.from).toHaveBeenCalledWith('channels');
      expect(mockChain.insert).toHaveBeenCalledWith({
        name: 'Test Channel',
        workspace_id: 'workspace-1',
      });
    });

    it('should throw error when insert fails', async () => {
      mockChain.then.mockImplementation((callback: SupabaseCallback<null>) => 
        Promise.resolve(callback({ data: null, error: new Error('Database error') }))
      );

      await expect(createChannel('workspace-1', 'Test Channel')).rejects.toThrow('Database error');
    });
  });

  describe('getChannels', () => {
    it('should get channels successfully', async () => {
      const mockChannels = [
        {
          id: '1',
          name: 'Test Channel 1',
          workspace_id: 'workspace-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Test Channel 2',
          workspace_id: 'workspace-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockChain.then.mockImplementation((callback: SupabaseCallback<typeof mockChannels>) => 
        Promise.resolve(callback({ data: mockChannels, error: null }))
      );

      const result = await getChannels('workspace-1');
      expect(result).toEqual(mockChannels);
      expect(supabase.from).toHaveBeenCalledWith('channels');
      expect(mockChain.select).toHaveBeenCalled();
    });

    it('should throw error when query fails', async () => {
      mockChain.then.mockImplementation((callback: SupabaseCallback<null>) => 
        Promise.resolve(callback({ data: null, error: new Error('Database error') }))
      );

      await expect(getChannels('workspace-1')).rejects.toThrow('Database error');
    });
  });

  describe('updateChannel', () => {
    it('should update channel successfully', async () => {
      const mockChannel = {
        id: '1',
        name: 'Updated Channel',
        workspace_id: 'workspace-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockChain.then.mockImplementation((callback: SupabaseCallback<typeof mockChannel>) => 
        Promise.resolve(callback({ data: mockChannel, error: null }))
      );

      const result = await updateChannel('1', 'Updated Channel');
      expect(result).toEqual(mockChannel);
      expect(supabase.from).toHaveBeenCalledWith('channels');
      expect(mockChain.update).toHaveBeenCalledWith({ name: 'Updated Channel' });
    });

    it('should throw error when update fails', async () => {
      mockChain.then.mockImplementation((callback: SupabaseCallback<null>) => 
        Promise.resolve(callback({ data: null, error: new Error('Database error') }))
      );

      await expect(updateChannel('1', 'Updated Channel')).rejects.toThrow('Database error');
    });
  });

  describe('deleteChannel', () => {
    it('should delete channel successfully', async () => {
      mockChain.then.mockImplementation((callback: SupabaseCallback<null>) => 
        Promise.resolve(callback({ data: null, error: null }))
      );

      await expect(deleteChannel('1')).resolves.not.toThrow();
      expect(supabase.from).toHaveBeenCalledWith('channels');
      expect(mockChain.delete).toHaveBeenCalled();
    });

    it('should throw error when delete fails', async () => {
      mockChain.then.mockImplementation((callback: SupabaseCallback<null>) => 
        Promise.resolve(callback({ data: null, error: new Error('Database error') }))
      );

      await expect(deleteChannel('1')).rejects.toThrow('Database error');
    });
  });
}); 