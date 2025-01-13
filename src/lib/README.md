# Real-time Subscriptions

The application uses Supabase real-time subscriptions to keep the UI in sync with the database. Key features:

- Workspace-level subscriptions for messages and reactions
- Optimistic updates for better UX
- Efficient state management to avoid full refetches
- Temporary message handling:
  - Messages are marked with temp- prefix during sending
  - Reactions are blocked on temporary messages
  - Messages are replaced with permanent versions on successful send 