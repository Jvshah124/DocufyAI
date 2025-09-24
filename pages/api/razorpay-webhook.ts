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
    return res.status(400).json({ error: "Invalid signature" });
  }

  // ✅ Check event type
  const event = req.body.event;
  if (event === "payment.captured") {
    const payment = req.body.payload.payment.entity;
    const email = payment.email || payment.notes?.email;

    if (email) {
      // ✅ Update user in Supabase (set them to PRO)
      await supabase
        .from("profiles")
        .update({
          subscription_status: "pro",
          docs_limit: 50,
          docs_generated: 0,
        })
        .eq("email", email);
    }
  }

  res.json({ status: "ok" });
}
