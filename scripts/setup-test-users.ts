const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const users = [
  { username: 'alicejohnson', password: 'alice123' },
  { username: 'bobsmith', password: 'bob123' },
  { username: 'charliebrown', password: 'charlie123' },
  { username: 'dianaprince', password: 'diana123' },
  { username: 'ethanhunt', password: 'ethan123' },
  { username: 'fionaapple', password: 'fiona123' },
  { username: 'georgeclooney', password: 'george123' },
  { username: 'hannahmontana', password: 'hannah123' },
  { username: 'ianmckellen', password: 'ian123' },
  { username: 'juliaroberts', password: 'julia123' },
  { username: 'kevinbacon', password: 'kevin123' },
  { username: 'laracroft', password: 'lara123' },
  { username: 'michaelscott', password: 'michael123' },
  { username: 'natalieportman', password: 'natalie123' },
  { username: 'oscarwilde', password: 'oscar123' },
];

async function setupTestUsers() {
  for (const user of users) {
    const email = `${user.username}@example.com`;
    
    try {
      // Create or update the user
      const { data, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: user.password,
        email_confirm: true
      });

      if (createError) {
        console.error(`Error creating user ${user.username}:`, createError);
        continue;
      }

      console.log(`Successfully set up user: ${user.username}`);
    } catch (error) {
      console.error(`Error setting up user ${user.username}:`, error);
    }
  }
}

setupTestUsers(); 