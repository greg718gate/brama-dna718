import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const inForm = await req.formData();
    const file = inForm.get('file');
    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: 'file field required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 25 MiB gateway limit
    if (file.size > 25 * 1024 * 1024) {
      return new Response(JSON.stringify({
        error: 'Plik jest większy niż 25 MB. Skróć nagranie lub wytnij sam dźwięk (mp3/m4a).',
      }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Choose extension based on mime so OpenAI accepts it
    const mime = (file.type || '').toLowerCase();
    const ext =
      mime.includes('mp4') || mime.includes('m4a') ? 'mp4' :
      mime.includes('webm') ? 'webm' :
      mime.includes('mpeg') || mime.includes('mp3') ? 'mp3' :
      mime.includes('wav') ? 'wav' :
      mime.includes('ogg') ? 'ogg' :
      mime.includes('quicktime') ? 'mov' :
      'mp4';

    const upstream = new FormData();
    upstream.append('model', 'openai/gpt-4o-mini-transcribe');
    upstream.append('file', file, `audio.${ext}`);

    const r = await fetch('https://ai.gateway.lovable.dev/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: upstream,
    });

    const text = await r.text();
    if (!r.ok) {
      return new Response(JSON.stringify({ error: text || `Gateway ${r.status}` }), {
        status: r.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(text, {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
