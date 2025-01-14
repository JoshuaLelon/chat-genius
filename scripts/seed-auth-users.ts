import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const seedUsers = [
  { email: 'alicejohnson@example.com', password: 'alice123' },
  { email: 'bobsmith@example.com', password: 'bob123' },
  { email: 'carolwilliams@example.com', password: 'carol123' },
  { email: 'davidbrown@example.com', password: 'david123' },
  { email: 'evadavis@example.com', password: 'eva123' },
  { email: 'frankthomas@example.com', password: 'frank123' },
  { email: 'gracemiller@example.com', password: 'grace123' },
  { email: 'henrywilson@example.com', password: 'henry123' },
  { email: 'isabeljones@example.com', password: 'isabel123' },
  { email: 'jackanderson@example.com', password: 'jack123' },
  { email: 'katemartin@example.com', password: 'kate123' },
  { email: 'liamtaylor@example.com', password: 'liam123' },
  { email: 'miagarcia@example.com', password: 'mia123' },
  { email: 'noahlee@example.com', password: 'noah123' },
  { email: 'oliviawhite@example.com', password: 'olivia123' },
];

export async function createSeedUsersWithAuth() {
  console.log('Creating auth users with passwords...');
  
  for (const { email, password } of seedUsers) {
    try {
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      console.log(`Created auth user: ${email}`);
    } catch (error: any) {
      // Skip if user already exists
      if (error.message?.includes('User already registered')) {
        console.log(`User already exists: ${email}`);
        continue;
      }
      throw error;
    }
  }
  
  console.log('Finished creating auth users');
}

// Allow running directly
if (require.main === module) {
  createSeedUsersWithAuth().catch(console.error);
} 