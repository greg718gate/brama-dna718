import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { z } from "npm:zod@3.23.8";

const BodySchema = z.object({
  license_token: z.string().trim().min(8).max(64),
  action: z.enum(["authorize", "report"]).default("authorize"),
  session: z
    .object({
      coherence: z.number().min(0).max(1).optional(),
      phase_error: z.number().min(-100).max(100).optional(),
      jitter_ms: z.number().min(0).max(10000).optional(),
      hrv_rmssd: z.number().min(0).max(10000).optional(),
      mean_bpm: z.number().min(0).max(300).optional(),
      duration_seconds: z.number().int().min(0).max(200000).optional(),
      breath_mode: z.string().max(50).optional(),
      audio_mode: z.string().max(50).optional(),
    })
    .optional(),
});

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const parsed = BodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return jsonResponse({ authorized: false, error: parsed.error.flatten().fieldErrors }, 400);
    }
    const { license_token, action, session } = parsed.data;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { data: profile, error } = await admin
      .from("profiles")
      .select("id, subscription_status")
      .eq("license_token", license_token.toUpperCase())
      .maybeSingle();

    if (error) throw error;
    if (!profile) return jsonResponse({ authorized: false, reason: "invalid_token" }, 401);

    const allowedStatuses = ["test_phase", "active", "trialing"];
    if (!allowedStatuses.includes(profile.subscription_status)) {
      return jsonResponse(
        { authorized: false, reason: "inactive_subscription", subscription_status: profile.subscription_status },
        403,
      );
    }

    if (action === "report") {
      if (!session) return jsonResponse({ authorized: true, stored: false, reason: "missing_session" }, 400);
      const { error: insertError } = await admin.from("sentinel_sessions").insert({
        user_id: profile.id,
        source: "python_engine",
        ...session,
      });
      if (insertError) throw insertError;
      return jsonResponse({ authorized: true, stored: true, subscription_status: profile.subscription_status });
    }

    return jsonResponse({
      authorized: true,
      subscription_status: profile.subscription_status,
      engine_key: Deno.env.get("SENTINEL_ENGINE_KEY") ?? null,
      issued_at: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to verify license";
    console.error("[SENTINEL-LICENSE]", message);
    return jsonResponse({ authorized: false, error: message }, 500);
  }
});
