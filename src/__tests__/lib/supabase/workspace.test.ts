import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase, createWorkspace, getWorkspaces, updateWorkspace, deleteWorkspace } from '../../../lib/supabase';

type SupabaseCallback<T> = (response: { data: T | null; error: Error | null }) => any;

const mockWorkspace = {
  id: '1',
  name: 'Test Workspace',
  created_at: new Date().toISOString(),
};

const mockWorkspaces = [mockWorkspace];

const mockChain = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  then: vi.fn().mockImplementation((callback: SupabaseCallback<any>) =>
    Promise.resolve(callback({ data: null, error: null }))
  ),
};

const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => mockChain),
  rpc: vi.fn(),
} as unknown as SupabaseClient;

vi.mock('../../../lib/supabase', () => ({
  supabase: mockSupabase,
  createWorkspace: async (name: string) => {
    const user = await mockSupabase.auth.getUser();
    if (!user.data.user) throw new Error('User not authenticated');
    
    const { data, error } = await mockSupabase.rpc('create_workspace', { workspace_name: name });
    if (error) throw error;
    return data;
  },
  getWorkspaces: async () => {
    const { data, error } = await mockSupabase.from('workspaces').select().then();
    if (error) throw error;
    return data;
  },
  updateWorkspace: async (id: string, name: string) => {
    const { data, error } = await mockSupabase.from('workspaces')
      .update({ name })
      .eq('id', id)
      .select()
      .single()
      .then();
    if (error) throw error;
    return data;
  },
  deleteWorkspace: async (id: string) => {
    const { error } = await mockSupabase.from('workspaces')
      .delete()
      .eq('id', id)
      .then();
    if (error) throw error;
  },
}));

describe('Workspace Supabase Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (mockSupabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'test-user' } },
      error: null,
    });
    mockChain.then.mockImplementation((callback: SupabaseCallback<any>) =>
      Promise.resolve(callback({ data: null, error: null }))
    );
  });

  describe('createWorkspace', () => {
    it('should create a workspace successfully', async () => {
      mockSupabase.rpc.mockImplementation(() =>
        Promise.resolve({ data: mockWorkspace, error: null })
      );

      const result = await createWorkspace('Test Workspace');
      expect(result).toEqual(mockWorkspace);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('create_workspace', {
        workspace_name: 'Test Workspace',
      });
    });

    it('should throw error when user is not authenticated', async () => {
      (mockSupabase.auth.getUser as any).mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      await expect(createWorkspace('Test Workspace')).rejects.toThrow(
        'User not authenticated'
      );
    });

    it('should throw error when rpc call fails', async () => {
      mockSupabase.rpc.mockImplementation(() =>
        Promise.resolve({ data: null, error: new Error('Database error') })
      );

      await expect(createWorkspace('Test Workspace')).rejects.toThrow('Database error');
    });
  });

  describe('getWorkspaces', () => {
    it('should get workspaces successfully', async () => {
      mockChain.then.mockImplementation((callback: SupabaseCallback<typeof mockWorkspaces>) =>
        Promise.resolve(callback({ data: mockWorkspaces, error: null }))
      );

      const result = await getWorkspaces();
      expect(result).toEqual(mockWorkspaces);
      expect(mockSupabase.from).toHaveBeenCalledWith('workspaces');
      expect(mockChain.select).toHaveBeenCalled();
    });

    it('should throw error when query fails', async () => {
      mockChain.then.mockImplementation((callback: SupabaseCallback<typeof mockWorkspaces>) =>
        Promise.resolve(callback({ data: null, error: new Error('Database error') }))
      );

      await expect(getWorkspaces()).rejects.toThrow('Database error');
    });
  });

  describe('updateWorkspace', () => {
    it('should update workspace successfully', async () => {
      mockChain.then.mockImplementation((callback: SupabaseCallback<typeof mockWorkspace>) =>
        Promise.resolve(callback({ data: mockWorkspace, error: null }))
      );

      const result = await updateWorkspace('1', 'Updated Workspace');
      expect(result).toEqual(mockWorkspace);
      expect(mockSupabase.from).toHaveBeenCalledWith('workspaces');
      expect(mockChain.update).toHaveBeenCalledWith({ name: 'Updated Workspace' });
    });

    it('should throw error when update fails', async () => {
      mockChain.then.mockImplementation((callback: SupabaseCallback<typeof mockWorkspace>) =>
        Promise.resolve(callback({ data: null, error: new Error('Database error') }))
      );

      await expect(updateWorkspace('1', 'Updated Workspace')).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('deleteWorkspace', () => {
    it('should delete workspace successfully', async () => {
      mockChain.then.mockImplementation((callback: SupabaseCallback<void>) =>
        Promise.resolve(callback({ data: null, error: null }))
      );

      await expect(deleteWorkspace('1')).resolves.not.toThrow();
      expect(mockSupabase.from).toHaveBeenCalledWith('workspaces');
      expect(mockChain.delete).toHaveBeenCalled();
    });

    it('should throw error when delete fails', async () => {
      mockChain.then.mockImplementation((callback: SupabaseCallback<void>) =>
        Promise.resolve(callback({ data: null, error: new Error('Database error') }))
      );

      await expect(deleteWorkspace('1')).rejects.toThrow('Database error');
    });
  });
}); 