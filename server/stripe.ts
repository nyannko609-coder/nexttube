import Stripe from "stripe";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

/**
 * Create a checkout session for payment (default $1, customizable)
 */
export async function createCheckoutSession(
  userId: number,
  userEmail: string,
  userName: string,
  origin: string,
  amountInCents: number = 100 // Default to $1.00 (100 cents)
) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "link"] as Stripe.Checkout.SessionCreateParams.PaymentMethodType[],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "NextTube Access",
              description: "One-time payment for permanent access to NextTube",
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: userEmail,
      client_reference_id: userId.toString(),
      metadata: {
        user_id: userId.toString(),
        customer_email: userEmail,
        customer_name: userName,
        amount_cents: amountInCents.toString(),
      },
      allow_promotion_codes: true,
      success_url: `${origin}/?payment=success&amount=${amountInCents}`,
      cancel_url: `${origin}/?payment=cancelled`,
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error("[Stripe] Error creating checkout session:", error);
    throw error;
  }
}

/**
 * Handle successful payment
 */
export async function handlePaymentSuccess(
  paymentIntentId: string,
  clientReferenceId: string,
  amountInCents?: number
) {
  try {
    const userId = parseInt(clientReferenceId, 10);
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    // Update user record with payment info
    await db
      .update(users)
      .set({
        stripePaymentIntentId: paymentIntentId,
        hasPaid: 1,
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    console.log(`[Stripe] Payment successful for user ${userId}, amount: $${(amountInCents || 100) / 100}`);
    return { success: true };
  } catch (error) {
    console.error("[Stripe] Error handling payment success:", error);
    throw error;
  }
}

/**
 * Get user's payment status
 */
export async function getUserPaymentStatus(userId: number) {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }
    const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const user = result[0];

    if (!user) {
      return { hasPaid: false, paidAt: null };
    }

    return {
      hasPaid: user.hasPaid === 1,
      paidAt: user.paidAt,
      stripePaymentIntentId: user.stripePaymentIntentId,
    };
  } catch (error) {
    console.error("[Stripe] Error getting payment status:", error);
    throw error;
  }
}
