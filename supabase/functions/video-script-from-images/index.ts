// Vision OCR + film script generator (Gemini 2.5 Flash via Lovable AI Gateway)
// Public function — no auth required (page itself is password-gated client-side)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { images, duration } = await req.json();
    if (!Array.isArray(images) || images.length === 0) {
      return new Response(JSON.stringify({ error: "Brak obrazów" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Brak LOVABLE_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const targetSec = Number(duration) || 60;
    // 1 slajd ~ 6-8s narracji
    const slideCount = Math.max(5, Math.min(28, Math.round(targetSec / 7)));

    const userParts: any[] = [
      {
        type: "text",
        text:
          `Otrzymujesz ${images.length} zrzut(ów) ekranu. Wykonaj DWA zadania:\n\n` +
          `1) OCR — odczytaj DOKŁADNIE cały tekst z obrazów po polsku (zachowaj polskie znaki: ą ć ę ł ń ó ś ź ż). Popraw oczywiste literówki OCR.\n\n` +
          `2) Na podstawie tego tekstu zbuduj ELEGANCKI SCENARIUSZ KINETYCZNEGO FILMU typograficznego o długości ${targetSec}s (~${slideCount} ujęć). Film ma wyglądać jak teaser/manifest — nie jak surowy zrzut.\n\n` +
          `Zwróć WYŁĄCZNIE poprawny JSON (bez markdown, bez komentarzy) w schemacie:\n` +
          `{\n` +
          `  "rawText": "pełny odczytany tekst",\n` +
          `  "narration": "płynny tekst dla lektora po polsku, ~${Math.round(targetSec * 2.5)} słów",\n` +
          `  "script": {\n` +
          `    "title": "krótki, mocny tytuł (max 5 słów)",\n` +
          `    "subtitle": "podtytuł (max 8 słów)",\n` +
          `    "slides": [\n` +
          `      { "kind": "title", "text": "...", "sub": "..." },\n` +
          `      { "kind": "point", "text": "jedno krótkie zdanie, max 12 słów", "accent": "1-2 słowa do podświetlenia" },\n` +
          `      { "kind": "quote", "text": "cytat lub kluczowa myśl" },\n` +
          `      { "kind": "stat", "value": "liczba/krótka fraza", "label": "co to znaczy" },\n` +
          `      { "kind": "outro", "text": "puenta / CTA" }\n` +
          `    ]\n` +
          `  }\n` +
          `}\n\n` +
          `Reguły:\n` +
          `- ${slideCount} slajdów łącznie, w tym 1 "title" na początku i 1 "outro" na końcu\n` +
          `- pomiędzy: mix "point", "quote", "stat"\n` +
          `- każdy "point.text" max 12 słów, jedno zdanie, bez nudy\n` +
          `- używaj polskich znaków poprawnie\n` +
          `- jeśli tekst jest osobisty/refleksyjny — zachowaj ton; jeśli informacyjny — zrób z tego klarowny manifest\n` +
          `- NIE wymyślaj faktów spoza zrzutów`,
      },
      ...images.map((b64: string) => ({
        type: "image_url",
        image_url: { url: b64.startsWith("data:") ? b64 : `data:image/png;base64,${b64}` },
      })),
    ];

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "Jesteś polskim reżyserem montażu i copywriterem. Odpowiadasz wyłącznie poprawnym JSON-em, bez bloków kodu.",
          },
          { role: "user", content: userParts },
        ],
      }),
    });

    if (!aiRes.ok) {
      const errTxt = await aiRes.text();
      console.error("AI gateway error", aiRes.status, errTxt);
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Limit zapytań AI — spróbuj za chwilę." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "Brak kredytów AI w workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI gateway: " + errTxt }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    let raw = data?.choices?.[0]?.message?.content ?? "";
    // strip code fences if model wrapped JSON
    raw = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // last-ditch: find first { ... last }
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("AI nie zwróciło poprawnego JSON");
      parsed = JSON.parse(m[0]);
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
