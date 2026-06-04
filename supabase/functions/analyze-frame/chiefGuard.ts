import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const MAX_DAILY_ANALYSES = 20;
const MIN_INTERVAL_SECONDS = 15;
/** ~6 MB base64 — caps vision payload size */
export const MAX_IMAGE_BASE64_LENGTH = 8_000_000;

export function parseFounderEmails(): Set<string> {
  const raw = Deno.env.get("FOUNDER_EMAILS") ?? "";
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function getServiceClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) {
    throw new Error("Supabase service configuration missing on edge function");
  }
  return createClient(url, serviceKey);
}

export async function getAuthenticatedUser(
  req: Request
): Promise<{ id: string; email: string } | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const client = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user?.id || !user.email) return null;
  if (user.is_anonymous) return null;

  return { id: user.id, email: user.email.toLowerCase() };
}

export function isFounderEmail(email: string, founders: Set<string>): boolean {
  if (founders.size === 0) return false;
  return founders.has(email.toLowerCase());
}

export async function registerRequestId(
  admin: SupabaseClient,
  userId: string,
  requestId: string | undefined
): Promise<{ ok: true } | { ok: false; code: string; message: string }> {
  if (!requestId || requestId.length > 128) {
    return { ok: true };
  }

  const { error } = await admin.from("chief_request_dedup").insert({
    request_id: requestId,
    user_id: userId,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        code: "duplicate_request",
        message: "This analysis request was already submitted",
      };
    }
    throw error;
  }

  // Best-effort cleanup of dedup rows older than 24h
  await admin
    .from("chief_request_dedup")
    .delete()
    .lt("created_at", new Date(Date.now() - 86_400_000).toISOString());

  return { ok: true };
}

export async function reserveDailySlot(
  admin: SupabaseClient,
  userId: string
): Promise<{ ok: true; remaining?: number } | { ok: false; code: string; message: string }> {
  const { data, error } = await admin.rpc("reserve_chief_analysis", {
    p_user_id: userId,
    p_max_daily: MAX_DAILY_ANALYSES,
    p_min_interval_seconds: MIN_INTERVAL_SECONDS,
  });

  if (error) throw error;

  const result = data as { ok?: boolean; code?: string; message?: string; remaining?: number };
  if (!result?.ok) {
    return {
      ok: false,
      code: result.code ?? "limit_exceeded",
      message: result.message ?? "Live Chief limit exceeded",
    };
  }

  return { ok: true, remaining: result.remaining };
}
