// Vision OCR + technical film script generator (Gemini Pro via Lovable AI Gateway)
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
    if (images.length > 40) {
      return new Response(JSON.stringify({ error: "Maksymalnie 40 zrzutów w jednej analizie." }), {
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
    // Film techniczny potrzebuje więcej krótkich ujęć, żeby pokazać wzory i źródła.
    const slideCount = Math.max(10, Math.min(60, Math.round(targetSec / 5)));

    const userParts: any[] = [
      {
        type: "text",
        text:
          `Otrzymujesz ${images.length} zrzut(ów) ekranu z materiałem technicznym: obliczenia, wzory, notatki, szkice inżynierskie lub schematy. Wykonaj DWA zadania:\n\n` +
          `1) OCR I ANALIZA ŹRÓDŁOWA — odczytaj możliwie DOKŁADNIE każdy ekran. Zachowaj polskie znaki: ą ć ę ł ń ó ś ź ż. Zachowaj wzory, znaki matematyczne, jednostki, liczby, współczynniki, wyniki pośrednie i końcowe. Jeżeli fragment jest nieczytelny, wpisz [nieczytelne] zamiast zgadywać.\n\n` +
          `2) SCENARIUSZ FILMU TECHNICZNEGO o długości ${targetSec}s (~${slideCount} ujęć). To ma być dynamiczna prezentacja materiału źródłowego: zrzuty jako obrazy, wzory jako plansze, obliczenia jako kroki, szkice jako ujęcia inżynierskie. NIE rób bajki, manifestu ani ogólnego opowiadania.\n\n` +
          `Zwróć WYŁĄCZNIE poprawny JSON (bez markdown, bez komentarzy) w schemacie:\n` +
          `{\n` +
          `  "rawText": "pełny odczytany tekst, najlepiej z podziałem: [Ekran 1], [Ekran 2]...",\n` +
          `  "narration": "rzeczowy lektor po polsku, wyłącznie na podstawie zrzutów, ~${Math.round(targetSec * 2.1)} słów",\n` +
          `  "script": {\n` +
          `    "title": "krótki tytuł techniczny (max 6 słów)",\n` +
          `    "subtitle": "co pokazuje materiał (max 10 słów)",\n` +
          `    "slides": [\n` +
          `      { "kind": "title", "text": "...", "sub": "...", "imageIndex": 1 },\n` +
          `      { "kind": "formula", "formula": "dokładny wzór / równanie", "explanation": "krótko co oznacza", "imageIndex": 3, "source": "Ekran 3" },\n` +
          `      { "kind": "calculation", "title": "nazwa obliczenia", "lines": ["krok 1", "krok 2", "wynik"], "result": "wynik końcowy", "imageIndex": 5, "source": "Ekran 5" },\n` +
          `      { "kind": "sketch", "title": "co widać na szkicu", "caption": "krótki podpis", "imageIndex": 7, "source": "Ekran 7" },\n` +
          `      { "kind": "point", "text": "fakt z materiału, max 14 słów", "accent": "liczba/wzór/słowo", "imageIndex": 9, "source": "Ekran 9" },\n` +
          `      { "kind": "stat", "value": "liczba/jednostka/wynik", "label": "co oznacza", "imageIndex": 11, "source": "Ekran 11" },\n` +
          `      { "kind": "evidence", "text": "dosłowny istotny fragment z OCR", "source": "Ekran 12", "imageIndex": 12 },\n` +
          `      { "kind": "outro", "text": "rzeczowe domknięcie bez dopowiadania faktów", "imageIndex": 1 }\n` +
          `    ]\n` +
          `  }\n` +
          `}\n\n` +
          `Reguły:\n` +
          `- ${slideCount} slajdów łącznie, w tym 1 "title" na początku i 1 "outro" na końcu\n` +
          `- jeśli na zrzutach są wzory/obliczenia: użyj wielu slajdów "formula" i "calculation"; nie pomijaj liczb ani jednostek\n` +
          `- jeśli są szkice/schematy: użyj slajdów "sketch" z właściwym imageIndex\n` +
          `- każdy slajd poza outro musi mieć imageIndex (numer ekranu od 1) i source, żeby film pokazywał materiał źródłowy\n` +
          `- narration ma wyjaśniać konkrety: wzory, wyniki, założenia, szkice; bez patosu i bez bajkowego tonu\n` +
          `- NIE wymyślaj faktów spoza zrzutów. NIE dodawaj własnej teorii. NIE zastępuj obliczeń ogólną narracją\n` +
          `- jeśli nie jesteś pewien znaku/liczby, oznacz to w rawText jako [nieczytelne]`,
      },
      ...images.map((b64: string) => ({
        type: "image_url",
        image_url: { url: b64.startsWith("data:") ? b64 : `data:image/png;base64,${b64}` },
      })),
    ];

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Lovable-API-Key": LOVABLE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        temperature: 0.15,
        max_tokens: 12000,
        messages: [
          {
            role: "system",
            content:
              "Jesteś precyzyjnym polskim analitykiem OCR i reżyserem technicznego filmu edukacyjnego. Twoim obowiązkiem jest zachować fakty, wzory, liczby, jednostki i szkice ze źródła. Nie tworzysz bajkowej narracji, nie dopowiadasz faktów, nie ukrywasz obliczeń. Odpowiadasz wyłącznie poprawnym JSON-em, bez bloków kodu.",
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
