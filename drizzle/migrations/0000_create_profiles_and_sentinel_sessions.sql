CREATE OR REPLACE FUNCTION public.generate_license_token()
RETURNS text
LANGUAGE sql
VOLATILE
SET search_path = public
AS $$
  SELECT string_agg(substr(upper(md5(gen_random_uuid()::text || clock_timestamp()::text)), n * 4 + 1, 4), '-')
  FROM generate_series(0, 3) AS n;
$$;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  full_name text,
  license_token text NOT NULL UNIQUE DEFAULT public.generate_license_token(),
  subscription_status text NOT NULL DEFAULT 'test_phase',
  terms_accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TABLE public.sentinel_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  coherence numeric,
  phase_error numeric,
  jitter_ms numeric,
  hrv_rmssd numeric,
  mean_bpm numeric,
  duration_seconds integer,
  breath_mode text,
  audio_mode text,
  source text NOT NULL DEFAULT 'python_engine',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX sentinel_sessions_user_created_idx ON public.sentinel_sessions (user_id, created_at DESC);

GRANT SELECT, INSERT ON public.sentinel_sessions TO authenticated;
GRANT ALL ON public.sentinel_sessions TO service_role;

ALTER TABLE public.sentinel_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON public.sentinel_sessions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON public.sentinel_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);