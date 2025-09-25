// pages/api/razorpay-webhook.ts
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { supabase } from "../../lib/supabaseClient";

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET as string;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ✅ Verify Razorpay signature
  const signature = req.headers["x-razorpay-signature"] as string;
  const expected = crypto
    .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (signature !== expected) {
    console.error("❌ Invalid signature");
    return res.status(400).json({ error: "Invalid signature" });
  }

  const event = req.body.event;

  try {
    if (event === "payment.captured") {
      const payment = req.body.payload.payment.entity;

      // ✅ Prefer userId from notes, fallback to email
      const userId = payment.notes?.userId;
      const email = payment.notes?.email || payment.email;

      if (userId) {
        await supabase
          .from("profiles")
          .update({
            subscription_status: "pro",
            docs_limit: 50,
            docs_generated: 0,
            subscription_current_period_end: new Date(
              new Date().setMonth(new Date().getMonth() + 1)
            ).toISOString(),
          })
          .eq("id", userId);

        console.log("✅ Upgraded to Pro via userId:", userId);
      } else if (email) {
        await supabase
          .from("profiles")
          .update({
            subscription_status: "pro",
            docs_limit: 50,
            docs_generated: 0,
            subscription_current_period_end: new Date(
              new Date().setMonth(new Date().getMonth() + 1)
            ).toISOString(),
          })
          .eq("email", email);

        console.log("✅ Upgraded to Pro via email:", email);
      }
    }

    if (event === "subscription.activated") {
      const sub = req.body.payload.subscription.entity;
      const userId = sub.notes?.userId;
      const email = sub.notes?.email;

      if (userId) {
        await supabase
          .from("profiles")
          .update({
            subscription_status: "pro",
            docs_limit: 50,
            docs_generated: 0,
            subscription_current_period_end: new Date(
              sub.current_end * 1000
            ).toISOString(),
          })
          .eq("id", userId);

        console.log("✅ Subscription activated (userId):", userId);
      } else if (email) {
        await supabase
          .from("profiles")
          .update({
            subscription_status: "pro",
            docs_limit: 50,
            docs_generated: 0,
            subscription_current_period_end: new Date(
              sub.current_end * 1000
            ).toISOString(),
          })
          .eq("email", email);

        console.log("✅ Subscription activated (email):", email);
      }
    }

    if (event === "subscription.cancelled") {
      const sub = req.body.payload.subscription.entity;
      const userId = sub.notes?.userId;
      const email = sub.notes?.email;

      if (userId) {
        await supabase
          .from("profiles")
          .update({
            subscription_status: "free",
            docs_limit: 1,
            docs_generated: 0,
          })
          .eq("id", userId);

        console.log("❌ Subscription cancelled (userId):", userId);
      } else if (email) {
        await supabase
          .from("profiles")
          .update({
            subscription_status: "free",
            docs_limit: 1,
            docs_generated: 0,
          })
          .eq("email", email);

        console.log("❌ Subscription cancelled (email):", email);
      }
    }

    return res.json({ status: "ok" });
  } catch (err) {
    console.error("❌ Webhook handler error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
