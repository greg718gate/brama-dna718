import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Authentication required" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { auth: { persistSession: false } },
    );
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user?.email) return jsonResponse({ error: "Authentication required" }, 401);

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Stripe is not configured");
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: data.user.email, limit: 10 });

    for (const customer of customers.data) {
      const subscriptions = await stripe.subscriptions.list({ customer: customer.id, status: "all", limit: 100 });
      const active = subscriptions.data.find((subscription) =>
        subscription.status === "active" || subscription.status === "trialing",
      );
      if (active) {
        return jsonResponse({
          subscribed: true,
          subscription_end: new Date(active.current_period_end * 1000).toISOString(),
        });
      }
    }

    return jsonResponse({ subscribed: false, subscription_end: null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to check subscription";
    console.error("[CHECK-SENTINEL-SUBSCRIPTION]", message);
    return jsonResponse({ error: message }, 500);
  }
});