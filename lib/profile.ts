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

  // Insert a default profile
  const defaultProfile = {
    id: userId,
    subscription_status: "free",
    docs_generated: 0,
    docs_limit: 1, // free users: 1 download allowed
    subscription_current_period_end: null,
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
 * Check if user can download + increment docs_generated if allowed.
 * Returns true if allowed, false if limit reached.
 */
export async function canDownloadAndIncrement(
  userId: string
): Promise<boolean> {
  if (!userId) return false;

  // Get the profile first
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("subscription_status, role, docs_generated, docs_limit")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    console.error("canDownloadAndIncrement error:", error?.message);
    return false;
  }

  // 🟢 Admins: unlimited, no increment needed
  if (profile.role === "admin") {
    return true;
  }

  // 🟢 For free & pro users → enforce their docs_limit
  if (profile.docs_generated >= profile.docs_limit) {
    return false; // ❌ limit reached
  }

  // Increment docs_generated
  const { error: updateError } = await supabase.rpc("increment_docs", {
    user_id: userId,
  });

  if (updateError) {
    console.error("Failed to increment docs:", updateError.message);
    return false;
  }

  return true; // ✅ success
}
