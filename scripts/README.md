# Scripts Directory

This directory contains various utility scripts for managing the application.

## Database Scripts

### Resetting and Seeding the Database

To reset and seed the database, you can use either command:
```bash
npm run seed
# or
npm run reset-db
```

Both commands do the same thing:
1. Clear all existing data
2. Run all migrations in order
3. Run the seed SQL file to populate the database with test data including:
   - Test users (15 users from alicejohnson to oscarwilde)
   - User profiles with status and avatars
   - Workspaces (Design Workspace, Engineering Workspace)
   - Workspace members
   - Channels (cool designers, uncool designers, hardcore engineers, softy engineers)
   - Initial messages in channels
   - Direct messages between workspace members
   - Message reactions

### Other Database Scripts

- `update-rls-policies.ts`: Updates Row Level Security policies
- `update-db-functions.ts`: Updates database functions
- `disable-rls.ts`: Disables Row Level Security (for development only)
- `create-test-user.ts`: Creates a single test user

## Test Scripts

- `test-api.ts`: Tests the API endpoints 