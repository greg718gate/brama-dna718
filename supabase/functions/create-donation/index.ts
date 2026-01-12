import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, email } = await req.json();
    
    // Validate amount (minimum £1 = 100 pence)
    const amountInPence = Math.round(parseFloat(amount) * 100);
    if (isNaN(amountInPence) || amountInPence < 100) {
      throw new Error("Minimum donation is £1");
    }
    if (amountInPence > 100000) {
      throw new Error("Maximum donation is £1000");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Create a one-time payment session with custom amount
    const session = await stripe.checkout.sessions.create({
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product: "prod_Tm9xjszf5nYdQm", // DNA Gate 718 Hz Project donation product
            unit_amount: amountInPence,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/?donation=success`,
      cancel_url: `${req.headers.get("origin")}/?donation=cancelled`,
    });

    console.log("Donation session created:", session.id, "Amount:", amountInPence);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Donation error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
