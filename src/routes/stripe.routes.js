import dotenv from "dotenv";
dotenv.config();

import express from "express";
import Stripe from "stripe";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", requireAuth, async (req, res) => {
  try {
    const { plan } = req.body;

    let priceId;

    if (plan === "premium") {
      priceId = process.env.STRIPE_PRICE_PREMIUM;
    } else if (plan === "pro") {
      priceId = process.env.STRIPE_PRICE_PRO;
    } else {
      return res.status(400).json({ error: "Plan invalide" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        userId: user.id,
        plan
      },
      success_url: "http://opportunity-finder-tau.vercel.app/success.html",
      cancel_url: "http://opportunity-finder-tau.vercel.app/cancel.html"
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur Stripe" });
  }
});


router.post("/webhook", async (req, res) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log("Webhook signature failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const userId = session.metadata.userId;
    const plan = session.metadata.plan;

    await prisma.user.update({
      where: { id: userId },
      data: {
        plan,
        analysesLimit: 999999
      }
    });

    console.log("✅ Plan activé :", plan);
  }

  res.json({ received: true });
});

export default router;