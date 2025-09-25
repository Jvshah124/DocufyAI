// pages/api/razorpay-order.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Razorpay from "razorpay";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, userId } = req.body; // 🟢 frontend should send these

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });

    const options = {
      amount: 699 * 100, // ₹6.99 → amount is in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        plan: "Pro Plan",
        email: email || "unknown", // 🟢 attach email here
        userId: userId || "unknown", // 🟢 attach userId (optional)
      },
    };

    const order = await razorpay.orders.create(options);
    return res.status(200).json(order);
  } catch (err) {
    console.error("Razorpay Order Error:", err);
    return res.status(500).json({ error: "Failed to create order" });
  }
}
