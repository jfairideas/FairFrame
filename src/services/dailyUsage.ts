import { DAILY_ANALYSIS_DISPLAY_LIMIT } from "../config/build6c";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export interface DailyUsageState {
  used: number;
  limit: number;
  remaining: number;
  atLimit: boolean;
  nearLimit: boolean;
}

const EMPTY: DailyUsageState = {
  used: 0,
  limit: DAILY_ANALYSIS_DISPLAY_LIMIT,
  remaining: DAILY_ANALYSIS_DISPLAY_LIMIT,
  atLimit: false,
  nearLimit: false,
};

export async function fetchDailyUsage(): Promise<DailyUsageState> {
  if (!isSupabaseConfigured) return EMPTY;

  const { data, error } = await supabase.rpc("get_my_daily_analysis_usage", {
    p_display_limit: DAILY_ANALYSIS_DISPLAY_LIMIT,
  });

  if (error || !data || typeof data !== "object") {
    return EMPTY;
  }

  const payload = data as Record<string, unknown>;
  if (!payload.ok) return EMPTY;

  const used = typeof payload.used === "number" ? payload.used : 0;
  const limit = typeof payload.limit === "number" ? payload.limit : DAILY_ANALYSIS_DISPLAY_LIMIT;
  const remaining = typeof payload.remaining === "number" ? payload.remaining : Math.max(0, limit - used);

  return {
    used,
    limit,
    remaining,
    atLimit: remaining <= 0,
    nearLimit: remaining > 0 && remaining <= 2,
  };
}

export function dailyUsageCopy(state: DailyUsageState, founderUnlimited = false): string {
  if (founderUnlimited) return "Founder access active";
  if (state.atLimit) {
    return "You have used today's free analyses. Come back tomorrow or continue with Premium later.";
  }
  return `Today: ${state.used} / ${state.limit} analyses used`;
}
