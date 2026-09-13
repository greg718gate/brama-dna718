import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const SENTINEL_PRICE_ID = "price_1UF1LxAiapGR4E3EBCWyeRGe";

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
    const customers = await stripe.customers.list({ email: data.user.email, limit: 1 });
    const customerId = customers.data[0]?.id;
    const origin = req.headers.get("origin") ?? "https://brama-dna718.com";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : data.user.email,
      client_reference_id: data.user.id,
      line_items: [{ price: SENTINEL_PRICE_ID, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/?sentinel_checkout=success#biometric`,
      cancel_url: `${origin}/?sentinel_checkout=cancelled#biometric`,
      subscription_data: { metadata: { user_id: data.user.id, access: "sentinel_718_pro" } },
      allow_promotion_codes: true,
    });

    return jsonResponse({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create checkout";
    console.error("[CREATE-SENTINEL-CHECKOUT]", message);
    return jsonResponse({ error: message }, 500);
  }
});