import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  const { count, error: countError } = await supabaseClient
    .from('vectorized_messages')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    throw countError;
  }

  const { data, error } = await supabaseClient
    .from('vectorized_messages')
    .select('*')
    .limit(3);

  if (error) {
    throw error;
  }

  return {
    totalCount: count,
    samples: data
  };
}

main()
  .then(result => {
    console.log(JSON.stringify(result, null, 2));
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  }); 