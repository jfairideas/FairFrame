import type { Json } from "../types/database";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export type AnalyticsEventName =
  | "analysis_started"
  | "ethics_screened"
  | "ethics_result_green"
  | "ethics_result_yellow"
  | "ethics_result_red"
  | "analysis_completed"
  | "progress_widget_viewed"
  | "journey_bar_viewed"
  | "level_progress_changed"
  | "fairlevel_changed"
  | "analysis_limit_viewed"
  | "card_created"
  | "card_exported"
  | "card_shared"
  | "milestone_achieved";

export async function trackEvent(
  eventName: AnalyticsEventName,
  properties: Record<string, unknown> = {}
): Promise<void> {
  if (!isSupabaseConfigured) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.is_anonymous) return;

  const { error } = await supabase.from("analytics_events").insert({
    user_id: user.id,
    event_name: eventName,
    properties: properties as Json,
  });

  if (error && __DEV__) {
    console.warn("trackEvent:", eventName, error.message);
  }
}
