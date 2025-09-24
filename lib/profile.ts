// lib/profile.ts
import { supabase } from "./supabaseClient";

export type Profile = {
  id: string;
  subscription_status?: "free" | "pro" | string | null;
  docs_generated?: number | null;
  docs_limit?: number | null;
  subscription_current_period_end?: string | null;
  // add any other profile fields you keep in your DB
};

/**
 * Get a profile by user id. Returns null if not found.
 */
export async function getUserProfile(userId: string): Promise<Profile | null> {
  if (!userId) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    // If no row found supabase returns an error — swallow and return null.
    // You can refine this logic if you want to throw for other error types.
    console.warn("getUserProfile warning:", error.message || error);
    return null;
  }
  return data as Profile;
}

/**
 * Ensure the user has a profile row.
 * If profile exists returns it, otherwise inserts a default free profile and returns it.
 */
export async function ensureUserProfile(
  userId: string,
  opts?: { email?: string }
): Promise<Profile | null> {
  if (!userId) return null;

  // Try to fetch existing first
  const existing = await getUserProfile(userId);
  if (existing) return existing;

  // Insert a default profile (adjust fields to match your DB)
  const defaultProfile = {
    id: userId,
    subscription_status: "free",
    docs_generated: 0,
    docs_limit: 1, // free users: 1 preview/generation allowed initially (we'll adjust later)
    subscription_current_period_end: null,
    // you can add email or other defaults if your table requires them
    ...(opts?.email ? { email: opts.email } : {}),
  };

  const { data, error } = await supabase
    .from("profiles")
    .insert(defaultProfile)
    .select()
    .single();

  if (error) {
    console.error("ensureUserProfile failed:", error.message || error);
    return null;
  }

  return data as Profile;
}

/**
 * Increment docs_generated for the user if under the limit.
 * Returns true if incremented, false if limit reached.
 */
export async function incrementDocs(userId: string): Promise<boolean> {
  const { error } = await supabase.rpc("increment_docs", { user_id: userId });

  if (error) {
    console.error("incrementDocs error:", error.message || error);
    return false;
  }

  // Re-fetch profile to get updated docs_generated
  const updated = await getUserProfile(userId);
  if (updated) {
    if (
      updated.docs_limit !== null &&
      updated.docs_generated! >= updated.docs_limit!
    ) {
      return false; // limit hit
    }
  }
  return true;
}
