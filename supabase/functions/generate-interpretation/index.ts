import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reference, text, lang, gematriaTotal, coherence, quantumState, gateName, gatePosition } = await req.json();

    const langLabel = lang === "pl" ? "Polish" : "English";
    const prompt = `You are a scholar bridging quantum physics, biblical theology, and the Ψ-718 unified theory (which maps biblical texts to DNA gates via gematria and wave functions).

Given this biblical verse:
- Reference: ${reference}
- Text: "${text}"
- Gematria sum (Σ): ${gematriaTotal}
- Quantum coherence: ${coherence}%
- Quantum state: ${quantumState}
- DNA gate: ${gateName} at mtDNA position ${gatePosition}

Write a UNIQUE, SPECIFIC interpretation of THIS verse in ${langLabel}. The interpretation MUST directly reference the actual content and meaning of the verse text. Do NOT write generic templates.

Return a JSON object with exactly these 5 fields (all in ${langLabel}):
{
  "scienceSays": "2-4 sentences. What does modern science (physics, biology, neuroscience) say that connects to the SPECIFIC MESSAGE of this verse? Reference actual scientific concepts relevant to this verse's content.",
  "faithSays": "2-4 sentences. What is the theological/spiritual meaning of THIS SPECIFIC verse? Reference the actual words and message.",
  "bridge": "2-4 sentences. How do the scientific and spiritual perspectives on THIS verse converge? Show they describe the same truth.",
  "miracle": "2-4 sentences. How does this verse illuminate the nature of miracles through the lens of quantum mechanics? Be specific to this verse.",
  "insight": "1-2 sentences. One powerful, memorable takeaway that connects this verse's gematria (${gematriaTotal}), its DNA gate (${gateName}), and its spiritual message."
}

CRITICAL: Every field must be UNIQUE to this specific verse "${reference}". Do not use generic phrases like "this text carries a gematria value" — instead interpret what that value MEANS for this specific verse.
Return ONLY the JSON object, no markdown.`;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", errorText);
      throw new Error(`AI Gateway returned ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON from response (handle possible markdown wrapping)
    let parsed;
    try {
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-interpretation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
