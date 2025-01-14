-- Create the match_documents function for vector similarity search
create or replace function match_documents(
  query_embedding vector(1536),
  match_count int default 5,
  filter jsonb default '{}'::jsonb
) returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
#variable_conflict use_column
begin
  raise notice 'Received filter: %', filter;
  return query
  select
    vectorized_messages.id,
    vectorized_messages.content,
    vectorized_messages.metadata,
    1 - (vectorized_messages.embedding <=> query_embedding) as similarity
  from vectorized_messages
  where case 
    when filter->>'user_id' is not null then 
      vectorized_messages.metadata->>'user_id' = filter->>'user_id'
    else true
  end
  order by similarity desc
  limit match_count;
end;
$$; 