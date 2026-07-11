import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_MODEL = "google/gemini-3-flash-preview";

function extractJsonObject(rawInput: string) {
  const raw = rawInput.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(raw);
  } catch (_) {
    // Continue with a balanced-brace extractor. This protects against short prefaces/code fences.
  }

  const start = raw.indexOf("{");
  if (start < 0) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < raw.length; i++) {
    const ch = raw[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(raw.slice(start, i + 1));
        } catch (_) {
          return null;
        }
      }
    }
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reference, text, lang, gematriaTotal, coherence, quantumState, gateName, gatePosition, mode } = await req.json();

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const langLabel = lang === "pl" ? "Polish" : "English";

    // MODE 1: Only reference given — fetch verse text AND original Hebrew/Greek
    if (mode === "lookup") {
      const lookupPrompt = `You are a biblical and religious text scholar with expertise in original languages (Hebrew, Aramaic, Greek).

The user provided this reference: "${reference}".

Your task:
1. Identify what sacred text this reference comes from (Bible, Quran, Torah, etc.)
2. Provide the FULL TEXT of this verse/passage in ${langLabel}
3. Provide the ORIGINAL LANGUAGE text:
   - For Old Testament / Torah / Psalms / Tanakh: provide the HEBREW text (without vowel marks/nikkud for cleaner gematria calculation)
   - For New Testament: provide the ORIGINAL GREEK text
   - For Quran: provide the ORIGINAL ARABIC text
   - For other texts: provide the original language text
4. Explain what it means in simple, everyday language

Write the "plainMeaning" field in ${langLabel}.

Return a JSON object with these fields:
{
  "verseText": "The full text of the verse in ${langLabel}",
  "hebrewText": "The ORIGINAL LANGUAGE text (Hebrew for OT, Greek for NT, Arabic for Quran). This MUST be in the original script (Hebrew letters, Greek letters, etc). For Hebrew, use consonantal text without vowel marks when possible. NEVER leave this empty - always provide the original language text.",
  "originalLanguage": "hebrew" or "greek" or "arabic" or other,
  "plainMeaning": "3-5 sentences explaining what this verse means in simple, clear language in ${langLabel}.",
  "source": "The name of the sacred text (e.g. 'Bible, Old Testament', 'Bible, New Testament', 'Quran', 'Torah')"
}

CRITICAL RULES:
1. The "hebrewText" field MUST contain the text in the ORIGINAL ancient language script. This is essential for gematria calculation.
2. For Old Testament books (Genesis, Exodus, Leviticus, Numbers, Deuteronomy, Joshua, Judges, Ruth, 1-2 Samuel, 1-2 Kings, 1-2 Chronicles, Ezra, Nehemiah, Esther, Job, Psalms, Proverbs, Ecclesiastes, Song of Solomon, Isaiah, Jeremiah, Lamentations, Ezekiel, Daniel, Hosea, Joel, Amos, Obadiah, Jonah, Micah, Nahum, Habakkuk, Zephaniah, Haggai, Zechariah, Malachi) — ALWAYS provide Hebrew.
3. For New Testament books (Matthew, Mark, Luke, John, Acts, Romans, 1-2 Corinthians, Galatians, Ephesians, Philippians, Colossians, 1-2 Thessalonians, 1-2 Timothy, Titus, Philemon, Hebrews, James, 1-2 Peter, 1-3 John, Jude, Revelation) — provide Greek.
4. Return ONLY the JSON object, no markdown, no code fences.
5. If you don't recognize the reference, still try your best.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Lovable-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: [{ role: "user", content: lookupPrompt }],
          temperature: 0.3,
          max_tokens: 6000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI Gateway error:", response.status, errorText);
        throw new Error(`AI Gateway returned ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("No content in AI response");

      const parsed = extractJsonObject(content);
      if (!parsed) {
        console.error("Failed to parse lookup response:", content, "finish_reason:", data.choices?.[0]?.finish_reason);
        throw new Error("Failed to parse AI response");
      }

      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // MODE 2: Fetch ONLY the original Hebrew/Greek text for a reference+text pair
    if (mode === "fetch_original") {
      const fetchOriginalPrompt = `You are a biblical scholar with expertise in original languages.

Reference: "${reference}"
Translation text: "${text}"

Your task: Provide the ORIGINAL LANGUAGE text for this verse.
- Old Testament → Hebrew (consonantal, no vowel marks/nikkud)
- New Testament → Greek
- Quran → Arabic

Return a JSON object:
{
  "hebrewText": "The original language text in its native script",
  "originalLanguage": "hebrew" or "greek" or "arabic"
}

CRITICAL: The "hebrewText" field MUST contain actual Hebrew/Greek/Arabic characters. NEVER return transliteration or English. Return ONLY the JSON object.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Lovable-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: [{ role: "user", content: fetchOriginalPrompt }],
          temperature: 0.2,
          max_tokens: 2500,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI Gateway error:", response.status, errorText);
        throw new Error(`AI Gateway returned ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("No content in AI response");

      const parsed = extractJsonObject(content);
      if (!parsed) {
        console.error("Failed to parse fetch_original response:", content, "finish_reason:", data.choices?.[0]?.finish_reason);
        throw new Error("Failed to parse AI response");
      }

      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // MODE 3: Full interpretation (text already provided)
    const prompt = `You are a biblical scholar and theologian who explains Bible verses in clear, accessible language.

Given this verse:
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
  "plainMeaning": "3-5 sentences. A CLEAR, SIMPLE explanation of what this verse literally says and means. Like a normal Bible study explanation that anyone can understand. What is the context? What is the message? Why is this verse important? Write as if explaining to someone who has never read this verse before. THIS IS THE MOST IMPORTANT FIELD.",
  "scienceSays": "2-3 sentences. What does modern science say that connects to the SPECIFIC MESSAGE of this verse?",
  "faithSays": "2-3 sentences. What is the deeper theological/spiritual meaning of THIS SPECIFIC verse?",
  "bridge": "2-3 sentences. How do the scientific and spiritual perspectives on THIS verse converge?",
  "miracle": "2-3 sentences. How does this verse illuminate the nature of miracles through quantum mechanics?",
  "insight": "1-2 sentences. One powerful takeaway connecting this verse's gematria (${gematriaTotal}), its DNA gate (${gateName}), and its spiritual message."
}

CRITICAL RULES:
1. The "plainMeaning" field MUST explain what "${text}" actually says in simple words. Unique to this exact verse.
2. Every field must reference the actual content of the verse "${reference}".
3. Do not stop after the first fields. Complete ALL 6 fields fully in ${langLabel}.
4. Return ONLY the JSON object, no markdown, no code fences.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Lovable-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 7000,
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

    const parsed = extractJsonObject(content);
    if (!parsed) {
      console.error("Failed to parse AI response:", content, "finish_reason:", data.choices?.[0]?.finish_reason);
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
