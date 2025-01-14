-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create the vectorized_messages table
create table public.vectorized_messages (
  id bigserial primary key,
  content text,
  embedding vector(1536),
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create an index on user_id in metadata
create index vectorized_messages_user_id_idx on public.vectorized_messages using btree ((metadata->>'user_id'));

-- Enable row level security
alter table public.vectorized_messages enable row level security;

-- Create policies
create policy "Users can view their own vectorized messages"
  on public.vectorized_messages for select
  using (metadata->>'user_id' = auth.uid()::text);

create policy "Service role can manage all vectorized messages"
  on public.vectorized_messages for all
  using (auth.jwt()->>'role' = 'service_role'); 