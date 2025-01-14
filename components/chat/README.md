# Chat Components

This directory contains the core chat components used throughout the application.

## Components

### ChatArea
The main chat display area that shows messages and handles message input.
- Displays messages in a scrollable container
- Handles message sending and receiving
- Supports both channel and DM conversations

### MessageInput
The message input component with support for:
- Text input with multi-line support
- Send button
- AI Response button (in DM conversations)
  - Generates AI responses based on the other user's message history
  - Only available in DM conversations
  - Uses semantic search to find relevant context from the user's past messages

### MessageBubble
Displays individual messages with:
- User avatar
- Username
- Timestamp
- Message content
- Reaction support

### EmojiPicker
A reusable emoji picker component for message reactions.

## Features

### AI Response Generation
In DM conversations, users can generate AI responses that mimic the other user's communication style:
1. Type a message in the input field
2. Click the "AI Response" button
3. The system will:
   - Send your original message
   - Generate and send an AI response based on the other user's message history
   - Use semantic search to find relevant context from past messages
   - Maintain conversation flow with natural responses 