import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
config({
  path: resolve(__dirname, '../../.env'),
}); 

// Mock environment variables needed for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'; 