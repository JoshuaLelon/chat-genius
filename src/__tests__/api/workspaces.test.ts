import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import * as workspaceRoutes from '../../app/api/workspaces/route';

// Mock the Supabase functions
vi.mock('../../../src/lib/supabase', () => ({
  getWorkspaces: vi.fn(),
  createWorkspace: vi.fn(),
  updateWorkspace: vi.fn(),
  deleteWorkspace: vi.fn(),
}));

// Import the mocked functions
import { getWorkspaces, createWorkspace, updateWorkspace, deleteWorkspace } from '../../../src/lib/supabase';

describe('Workspaces API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/workspaces', () => {
    it('should return workspaces successfully', async () => {
      const mockWorkspaces = [
        { id: '1', name: 'Workspace 1' },
        { id: '2', name: 'Workspace 2' },
      ];
      
      (getWorkspaces as any).mockResolvedValue(mockWorkspaces);
      
      const response = await workspaceRoutes.GET();
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(mockWorkspaces);
      expect(getWorkspaces).toHaveBeenCalledTimes(1);
    });

    it('should handle errors', async () => {
      (getWorkspaces as any).mockRejectedValue(new Error('Database error'));
      
      const response = await workspaceRoutes.GET();
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch workspaces' });
    });
  });

  describe('POST /api/workspaces', () => {
    it('should create a workspace successfully', async () => {
      const mockWorkspace = { id: '1', name: 'New Workspace' };
      (createWorkspace as any).mockResolvedValue(mockWorkspace);
      
      const request = new Request('http://localhost:3000/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Workspace' }),
      });
      
      const response = await workspaceRoutes.POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(mockWorkspace);
      expect(createWorkspace).toHaveBeenCalledWith('New Workspace');
    });

    it('should handle missing name', async () => {
      const request = new Request('http://localhost:3000/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      
      const response = await workspaceRoutes.POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Name is required' });
    });
  });

  describe('PUT /api/workspaces', () => {
    it('should update a workspace successfully', async () => {
      const mockWorkspace = { id: '1', name: 'Updated Workspace' };
      (updateWorkspace as any).mockResolvedValue(mockWorkspace);
      
      const request = new Request('http://localhost:3000/api/workspaces', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: '1', name: 'Updated Workspace' }),
      });
      
      const response = await workspaceRoutes.PUT(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(mockWorkspace);
      expect(updateWorkspace).toHaveBeenCalledWith('1', 'Updated Workspace');
    });

    it('should handle missing id or name', async () => {
      const request = new Request('http://localhost:3000/api/workspaces', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated Workspace' }),
      });
      
      const response = await workspaceRoutes.PUT(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'ID and name are required' });
    });
  });

  describe('DELETE /api/workspaces', () => {
    it('should delete a workspace successfully', async () => {
      (deleteWorkspace as any).mockResolvedValue(undefined);
      
      const request = new Request('http://localhost:3000/api/workspaces', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: '1' }),
      });
      
      const response = await workspaceRoutes.DELETE(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
      expect(deleteWorkspace).toHaveBeenCalledWith('1');
    });

    it('should handle missing id', async () => {
      const request = new Request('http://localhost:3000/api/workspaces', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      
      const response = await workspaceRoutes.DELETE(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'ID is required' });
    });
  });
}); 