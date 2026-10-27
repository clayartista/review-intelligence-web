import { createClient } from "@supabase/supabase-js";
 
let adminClient;
 
function getAdminClient() {
  if (adminClient) return adminClient;
 
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;
 
  if (!url || !key) {
    throw new Error("Server-side Supabase credentials are not configured.");
  }
 
  adminClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return adminClient;
}
 
export function redactText(value) {
  return String(value ?? "")
    .slice(0, 12000)
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[EMAIL]")
    .replace(/(?:\+?62|0)8\d{7,12}\b/g, "[NOMOR TELEPON]")
    .replace(/\b\d{16}\b/g, "[NOMOR IDENTITAS]");
}
 
function sanitizeSources(sources) {
  if (!Array.isArray(sources)) return [];
  return sources.slice(0, 10).map((source) => ({
    title: redactText(source?.title ?? "").slice(0, 200),
    page: Number.isFinite(Number(source?.page)) ? Number(source.page) : null,
  }));
}
 
export async function saveChatInteraction({
  sessionId, question, answer, sources, consentNoticeVersion,
}) {
  const supabase = getAdminClient();
  const { error } = await supabase.from("chat_interactions").insert({
    session_id: sessionId,
    question_redacted: redactText(question),
    answer_redacted: redactText(answer),
    sources: sanitizeSources(sources),
    consent_notice_version: redactText(consentNoticeVersion || "v1").slice(0, 40),
  });
 
  if (error) throw new Error("Unable to save chat interaction.");
}
