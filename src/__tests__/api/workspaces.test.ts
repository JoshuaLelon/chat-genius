import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { createWorkspace, deleteWorkspace, getWorkspaces, updateWorkspace } from '@/lib/supabase';
import type { Workspace } from '@/lib/supabase';

describe('Workspaces API Integration Tests', () => {
  let testWorkspaceId: string;

  // Test workspace creation
  it('should create a new workspace', async () => {
    const workspace = await createWorkspace('Test Workspace');
    expect(workspace).toBeDefined();
    expect(workspace.name).toBe('Test Workspace');
    expect(workspace.id).toBeDefined();
    testWorkspaceId = workspace.id;
  });

  // Test workspace listing
  it('should list workspaces including the test workspace', async () => {
    const workspaces = await getWorkspaces();
    expect(workspaces).toBeDefined();
    expect(Array.isArray(workspaces)).toBe(true);
    expect(workspaces.some((w: Workspace) => w.id === testWorkspaceId)).toBe(true);
  });

  // Test workspace update
  it('should update workspace name', async () => {
    const updatedWorkspace = await updateWorkspace(testWorkspaceId, 'Updated Test Workspace');
    expect(updatedWorkspace).toBeDefined();
    expect(updatedWorkspace.name).toBe('Updated Test Workspace');
    expect(updatedWorkspace.id).toBe(testWorkspaceId);
  });

  // Test workspace deletion
  it('should delete the test workspace', async () => {
    await deleteWorkspace(testWorkspaceId);
    const workspaces = await getWorkspaces();
    expect(workspaces.some((w: Workspace) => w.id === testWorkspaceId)).toBe(false);
  });
}); 