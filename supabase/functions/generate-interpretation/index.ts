import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reference, text, lang, gematriaTotal, coherence, quantumState, gateName, gatePosition } = await req.json();

    const langLabel = lang === "pl" ? "Polish" : "English";
    const prompt = `You are a biblical scholar and theologian who explains Bible verses in clear, accessible language.

Given this biblical verse:
- Reference: ${reference}
- Full text: "${text}"

Additionally, this verse has been analyzed through the Ψ-718 framework:
- Gematria sum (Σ): ${gematriaTotal}
- Quantum coherence: ${coherence}%
- Quantum state: ${quantumState}
- DNA gate: ${gateName} at mtDNA position ${gatePosition}

Write ALL responses in ${langLabel}.

Return a JSON object with exactly these 6 fields:

{
  "plainMeaning": "3-5 sentences. A CLEAR, SIMPLE explanation of what this verse literally says and means. Like a normal Bible study explanation that anyone can understand. What is the context? What is the message? Why is this verse important? Write as if explaining to someone who has never read this verse before. THIS IS THE MOST IMPORTANT FIELD - it must be specific to the actual text '${text}' and reference '${reference}'.",
  "scienceSays": "2-3 sentences. What does modern science (physics, biology, neuroscience) say that connects to the SPECIFIC MESSAGE of this verse?",
  "faithSays": "2-3 sentences. What is the deeper theological/spiritual meaning of THIS SPECIFIC verse?",
  "bridge": "2-3 sentences. How do the scientific and spiritual perspectives on THIS verse converge?",
  "miracle": "2-3 sentences. How does this verse illuminate the nature of miracles through quantum mechanics?",
  "insight": "1-2 sentences. One powerful takeaway connecting this verse's gematria (${gematriaTotal}), its DNA gate (${gateName}), and its spiritual message."
}

CRITICAL RULES:
1. The "plainMeaning" field MUST explain what "${text}" actually says in simple words. It must be UNIQUE to this exact verse.
2. Every field must reference the actual content of the verse "${reference}" - do NOT use generic phrases.
3. Return ONLY the JSON object, no markdown, no code fences.`;

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
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway returned ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

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
