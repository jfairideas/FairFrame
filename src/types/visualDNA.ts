export interface VisualDNA {
  user_id: string;
  dominant_archetype: string;
  trait_badges: string[];
  subject_preferences: Record<string, number>;
  composition_preferences: Record<string, number>;
  light_preferences: Record<string, number>;
  attention_drivers: Record<string, number>;
  top_strengths: string[];
  growth_areas: string[];
  fair_score_trend?: string | null;
  last_recalculated_at?: string | null;
  created_at?: string;
  updated_at?: string;
}
