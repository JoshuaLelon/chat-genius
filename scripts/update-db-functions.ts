import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateDbFunctions() {
  try {
    // Drop existing function if it exists
    await supabase.rpc('drop_function_if_exists', {
      function_name: 'create_workspace_with_member',
      parameter_types: ['text', 'uuid']
    });

    // Create the function
    const functionDefinition = `
      create or replace function create_workspace_with_member(
        workspace_name text,
        creator_id uuid
      )
      returns json
      language plpgsql
      security definer
      as $$
      declare
        new_workspace record;
      begin
        -- Create the workspace
        insert into public.workspaces (name)
        values (workspace_name)
        returning * into new_workspace;

        -- Add the creator as a member
        insert into public.workspace_members (workspace_id, user_id)
        values (new_workspace.id, creator_id);

        return json_build_object(
          'id', new_workspace.id,
          'name', new_workspace.name,
          'created_at', new_workspace.created_at,
          'updated_at', new_workspace.updated_at
        );
      end;
      $$;
    `;

    await supabase.rpc('run_sql', { sql: functionDefinition });
    console.log('Database functions updated successfully');
  } catch (error) {
    console.error('Error updating database functions:', error);
  }
}

updateDbFunctions(); 