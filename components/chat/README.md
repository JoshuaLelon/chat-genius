# Chat Components

This directory contains components for the chat functionality.

## Components

### ChatArea
- Handles display of messages in channels and DMs
- Implements smart scroll behavior that only triggers on actual message changes
- For DMs, only shows messages from the actual participants in the conversation
- Uses message IDs to determine when to scroll to bottom

### MessageBubble
- Displays individual chat messages
- Shows user avatar and message content
- Handles different message types and states

### MessageInput
- Handles message composition and sending
- Supports both channel and DM contexts

## Behavior Notes

- Scroll to bottom only happens when new messages are added, not on status changes
- DM conversations are filtered to only show messages from the actual participants
- Channel selection is preserved when switching workspaces
- Status indicators are properly contained within their components

## Recent Updates

1. Fixed scroll behavior to only trigger on actual message changes
2. Improved DM message filtering to only show relevant participants
3. Fixed workspace/channel navigation to preserve user selections
4. Removed stray UI elements causing visual artifacts 