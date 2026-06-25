// Vision OCR + technical film script generator (Gemini Pro via Lovable AI Gateway)
// Public function — no auth required (page itself is password-gated client-side)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type SafeSlide = Record<string, unknown>;

function cleanText(value: unknown, max = 8000) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function extractJsonObject(rawInput: string) {
  const raw = rawInput.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(raw);
  } catch (_) {
    // Continue with a balanced-brace extractor. Regex {.*} breaks on truncated or explanatory model output.
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
        const candidate = raw.slice(start, i + 1);
        try {
          return JSON.parse(candidate);
        } catch (_) {
          return null;
        }
      }
    }
  }
  return null;
}

function inferVisualCue(text: string) {
  const t = text.toLowerCase();
  if (/drzew|las|liść|liście|gałą|korze|korzeń|roślin|natura|forest|tree/.test(t)) return "forest_trees";
  if (/wz[oó]r|równ|oblicz|sił|moment|napręż|prąd|napię|hz|mm|cm|kg|newton|schemat|inżyn|engineer/.test(t)) return "engineering_blueprint";
  if (/dna|gen|chromosom|mitochond|komór|biolog/.test(t)) return "dna_biology";
  if (/gwiazd|kosmos|planeta|orbita|światło|foton|kwant/.test(t)) return "cosmic_physics";
  if (/woda|rzeka|morze|ocean|fala/.test(t)) return "water_waves";
  if (/ogień|płomień|temperatur|ciepł/.test(t)) return "fire_energy";
  return "abstract_technical";
}

function buildFallback(rawInput: string, duration: number, imageCount: number) {
  const rawText = cleanText(rawInput, 12000) || "[AI nie zwróciło poprawnego JSON-a. Zachowano surową odpowiedź do ręcznej kontroli.]";
  const targetSlides = Math.max(8, Math.min(42, Math.round((Number(duration) || 60) / 5)));
  const chunks = rawText
    .split(/(?<=[.!?。])\s+|\n+/)
    .map((s) => cleanText(s, 220))
    .filter((s) => s.length > 8);
  const formulaLike = rawText.match(/[^.!?\n]*(?:=|≈|≤|≥|√|∑|∆|Δ|Ω|µ|φ|π|\bHz\b|\bmm\b|\bcm\b|\bkg\b|\bN\b|\bV\b|\bA\b|\bm\/s\b)[^.!?\n]*/g) || [];
  const cue = inferVisualCue(rawText);
  const slides: SafeSlide[] = [
    {
      kind: "title",
      text: "Analiza materiału",
      sub: "fakty · źródła · wizualizacja tematu",
      imageIndex: imageCount ? 1 : undefined,
      visualMode: "thematic",
      visualCue: cue,
    },
  ];

  for (const formula of formulaLike.slice(0, Math.min(10, targetSlides - 2))) {
    const idx = slides.length;
    slides.push({
      kind: formula.includes("=") ? "formula" : "evidence",
      formula: cleanText(formula, 180),
      text: cleanText(formula, 180),
      explanation: "Fragment techniczny wykryty w materiale źródłowym.",
      imageIndex: imageCount ? ((idx - 1) % imageCount) + 1 : undefined,
      source: imageCount ? `Ekran ${((idx - 1) % imageCount) + 1}` : undefined,
      visualMode: "hybrid",
      visualCue: inferVisualCue(formula),
    });
  }

  for (const chunk of chunks) {
    if (slides.length >= targetSlides - 1) break;
    const idx = slides.length;
    slides.push({
      kind: "point",
      text: chunk,
      accent: chunk.match(/\b\d+(?:[,.]\d+)?\s*(?:Hz|mm|cm|kg|N|V|A|%)?\b/i)?.[0],
      imageIndex: imageCount ? ((idx - 1) % imageCount) + 1 : undefined,
      source: imageCount ? `Ekran ${((idx - 1) % imageCount) + 1}` : undefined,
      visualMode: "hybrid",
      visualCue: inferVisualCue(chunk),
    });
  }

  slides.push({
    kind: "outro",
    text: "Koniec analizy źródłowej",
    imageIndex: imageCount ? 1 : undefined,
    visualMode: "thematic",
    visualCue: cue,
  });

  return {
    rawText,
    narration: chunks.slice(0, Math.max(5, targetSlides)).join(" ") || rawText.slice(0, 1800),
    script: {
      title: "Analiza materiału",
      subtitle: "źródła i wizualizacja tematu",
      slides,
    },
    warning: "Użyto trybu awaryjnego, ponieważ AI nie zwróciło poprawnego JSON-a.",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { images, duration, instruction } = await req.json();
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
          `2) SCENARIUSZ FILMU TECHNICZNEGO o długości ${targetSec}s (~${slideCount} ujęć). To ma być dynamiczna prezentacja materiału źródłowego oraz MYŚLĄCA wizualizacja tematu. Jeżeli zrzut zawiera poboczne elementy z filmu/aplikacji, NIE rób z niego ślepego slajdu. Wyłuskaj temat, fakty, wzory i obliczenia, a dla obrazu wybierz visualMode: "thematic" albo "hybrid". Przykład: jeśli materiał jest o drzewach, visualCue ma prowadzić do lasu/drzew, a nie do przypadkowego screena. NIE rób bajki, manifestu ani ogólnego opowiadania.\n\n` +
          (instruction ? `Dodatkowe polecenie użytkownika: ${cleanText(instruction, 1000)}\n\n` : "") +
          `Zwróć WYŁĄCZNIE poprawny JSON (bez markdown, bez komentarzy) w schemacie:\n` +
          `{\n` +
          `  "rawText": "pełny odczytany tekst, najlepiej z podziałem: [Ekran 1], [Ekran 2]...",\n` +
          `  "narration": "rzeczowy lektor po polsku, wyłącznie na podstawie zrzutów, ~${Math.round(targetSec * 2.1)} słów",\n` +
          `  "script": {\n` +
          `    "title": "krótki tytuł techniczny (max 6 słów)",\n` +
          `    "subtitle": "co pokazuje materiał (max 10 słów)",\n` +
          `    "slides": [\n` +
          `      { "kind": "title", "text": "...", "sub": "...", "imageIndex": 1, "visualMode": "thematic", "visualCue": "forest_trees / engineering_blueprint / dna_biology / cosmic_physics / water_waves / fire_energy / abstract_technical" },\n` +
          `      { "kind": "formula", "formula": "dokładny wzór / równanie", "explanation": "krótko co oznacza", "imageIndex": 3, "source": "Ekran 3", "visualMode": "hybrid", "visualCue": "engineering_blueprint" },\n` +
          `      { "kind": "calculation", "title": "nazwa obliczenia", "lines": ["krok 1", "krok 2", "wynik"], "result": "wynik końcowy", "imageIndex": 5, "source": "Ekran 5", "visualMode": "hybrid", "visualCue": "engineering_blueprint" },\n` +
          `      { "kind": "sketch", "title": "co widać na szkicu", "caption": "krótki podpis", "imageIndex": 7, "source": "Ekran 7", "visualMode": "hybrid", "visualCue": "engineering_blueprint" },\n` +
          `      { "kind": "point", "text": "fakt z materiału, max 14 słów", "accent": "liczba/wzór/słowo", "imageIndex": 9, "source": "Ekran 9", "visualMode": "thematic", "visualCue": "forest_trees" },\n` +
          `      { "kind": "stat", "value": "liczba/jednostka/wynik", "label": "co oznacza", "imageIndex": 11, "source": "Ekran 11", "visualMode": "hybrid", "visualCue": "engineering_blueprint" },\n` +
          `      { "kind": "evidence", "text": "dosłowny istotny fragment z OCR", "source": "Ekran 12", "imageIndex": 12, "visualMode": "source", "visualCue": "abstract_technical" },\n` +
          `      { "kind": "outro", "text": "rzeczowe domknięcie bez dopowiadania faktów", "imageIndex": 1, "visualMode": "thematic", "visualCue": "abstract_technical" }\n` +
          `    ]\n` +
          `  }\n` +
          `}\n\n` +
          `Reguły:\n` +
          `- ${slideCount} slajdów łącznie, w tym 1 "title" na początku i 1 "outro" na końcu\n` +
          `- jeśli na zrzutach są wzory/obliczenia: użyj wielu slajdów "formula" i "calculation"; nie pomijaj liczb ani jednostek\n` +
          `- jeśli są szkice/schematy: użyj slajdów "sketch" z właściwym imageIndex\n` +
          `- każdy slajd poza outro musi mieć imageIndex (numer ekranu od 1) i source, ale visualMode decyduje czy ekran jest dowodem, tłem, czy tylko miniaturą\n` +
          `- visualMode: "source" = pokaż zrzut jako główny dowód; "hybrid" = tematyczna grafika + mała ramka źródła; "thematic" = własna wizualizacja tematu na podstawie treści\n` +
          `- visualCue ma być konkretną wskazówką obrazu; dla drzew użyj forest_trees, dla obliczeń engineering_blueprint itd.\n` +
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
              "Jesteś precyzyjnym polskim analitykiem OCR i reżyserem technicznego filmu edukacyjnego. Twoim obowiązkiem jest zachować fakty, wzory, liczby, jednostki i szkice ze źródła, ale obraz filmu ma być świadomie dobrany do tematu. Nie tworzysz bajkowej narracji, nie dopowiadasz faktów, nie ukrywasz obliczeń. Odpowiadasz wyłącznie poprawnym JSON-em, bez bloków kodu.",
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

    let parsed: any = extractJsonObject(raw);
    if (!parsed || typeof parsed !== "object") {
      console.error("AI returned non-JSON; using fallback", raw.slice(0, 1200));
      parsed = buildFallback(raw, targetSec, images.length);
    }

    if (!parsed.script?.slides?.length) {
      parsed = buildFallback(parsed.rawText || parsed.narration || raw, targetSec, images.length);
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
