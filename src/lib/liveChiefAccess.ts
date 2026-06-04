import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

/**
 * Client-side gate: skips edge/OpenAI invoke for non-founders during founder beta.
 * Server enforces the same rules in analyze-frame.
 */
export async function canInvokeLiveChief(): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return {
      allowed: false,
      reason: "Sign in with your founder account for Live Chief (beta uses offline preview for others)",
    };
  }

  if (session.user.is_anonymous) {
    return {
      allowed: false,
      reason: "Guest mode uses offline preview during founder beta",
    };
  }

  const founderEmail = process.env.EXPO_PUBLIC_FOUNDER_EMAIL?.trim().toLowerCase();
  const userEmail = session.user.email?.trim().toLowerCase();

  if (founderEmail) {
    if (!userEmail || userEmail !== founderEmail) {
      return {
        allowed: false,
        reason: "Live Chief is founder-only during beta testing",
      };
    }
  }

  return { allowed: true };
}

export function getFounderSessionUser(session: Session | null) {
  return session?.user && !session.user.is_anonymous ? session.user : null;
}
