import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { createWorkspace, deleteWorkspace, createChannel, getChannels, updateChannel, deleteChannel } from '@/lib/supabase';
import type { Channel } from '@/lib/supabase';

describe('Channels API Integration Tests', () => {
  let testWorkspaceId: string;
  let testChannelId: string;

  // Create a test workspace before running channel tests
  beforeAll(async () => {
    const workspace = await createWorkspace('Test Workspace for Channels');
    testWorkspaceId = workspace.id;
  });

  // Clean up the test workspace after all tests
  afterAll(async () => {
    await deleteWorkspace(testWorkspaceId);
  });

  // Test channel creation
  it('should create a new channel', async () => {
    const channel = await createChannel(testWorkspaceId, 'Test Channel');
    expect(channel).toBeDefined();
    expect(channel.name).toBe('Test Channel');
    expect(channel.workspace_id).toBe(testWorkspaceId);
    expect(channel.id).toBeDefined();
    testChannelId = channel.id;
  });

  // Test channel listing
  it('should list channels for the workspace', async () => {
    const channels = await getChannels(testWorkspaceId);
    expect(channels).toBeDefined();
    expect(Array.isArray(channels)).toBe(true);
    expect(channels.some((c: Channel) => c.id === testChannelId)).toBe(true);
  });

  // Test channel update
  it('should update channel name', async () => {
    const updatedChannel = await updateChannel(testChannelId, 'Updated Test Channel');
    expect(updatedChannel).toBeDefined();
    expect(updatedChannel.name).toBe('Updated Test Channel');
    expect(updatedChannel.id).toBe(testChannelId);
  });

  // Test channel deletion
  it('should delete the test channel', async () => {
    await deleteChannel(testChannelId);
    const channels = await getChannels(testWorkspaceId);
    expect(channels.some((c: Channel) => c.id === testChannelId)).toBe(false);
  });
}); 