# Chat Genius

A modern chat application with AI-powered features.

## Features

- Real-time messaging in channels and direct messages
- Emoji reactions
- User presence indicators
- Workspace support
- AI-powered features:
  - AI Response Generation in DMs
  - Message context awareness
  - Natural conversation flow

## Components

See individual component directories for detailed documentation:
- [Chat Components](./components/chat/README.md)

## Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key

### Environment Variables
Create a `.env` file with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

### Installation
```bash
npm install
# or
yarn install
```

### Running the Development Server
```bash
npm run dev
# or
yarn dev
```

### Database Setup
1. Set up your Supabase project
2. Run the migrations in `supabase/migrations`
3. Run the seed script: `npm run seed`

## AI Features

### AI Response Generation
In direct message conversations, users can generate AI responses that mimic the other user's communication style:

1. Start a DM conversation with another user
2. Type your message
3. Click the "AI Response" button
4. The system will:
   - Send your original message
   - Generate a response that mimics the other user's style
   - Use semantic search to find relevant context
   - Maintain natural conversation flow

The AI responses are powered by:
- OpenAI's language models
- Semantic search for context awareness
- Vector embeddings for message similarity

## License

MIT 