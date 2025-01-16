import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log("Checking vector stores...\n");

  // Check vectorized messages
  const { data: messageCount, error: messageError } = await supabase
    .from("vectorized_messages")
    .select("*", { count: "exact", head: true });

  if (messageError) {
    console.error("Error checking vectorized messages:", messageError);
  } else {
    console.log(`Vectorized messages count: ${messageCount?.length ?? 0}`);
  }

  // Check vectorized workspace summaries
  const { data: summaryCount, error: summaryError } = await supabase
    .from("vectorized_workspace_summaries")
    .select("*", { count: "exact", head: true });

  if (summaryError) {
    console.error("Error checking workspace summaries:", summaryError);
  } else {
    console.log(`Vectorized workspace summaries count: ${summaryCount?.length ?? 0}`);
  }

  // Get a sample of each to verify embeddings exist
  const { data: messageSample } = await supabase
    .from("vectorized_messages")
    .select("*")
    .limit(1);

  const { data: summarySample } = await supabase
    .from("vectorized_workspace_summaries")
    .select("*")
    .limit(1);

  console.log("\nSample checks:");
  console.log("Message embedding exists:", messageSample?.[0]?.embedding ? "Yes" : "No");
  console.log("Summary embedding exists:", summarySample?.[0]?.embedding ? "Yes" : "No");
}

main()
  .catch(console.error)
  .finally(() => process.exit()); 