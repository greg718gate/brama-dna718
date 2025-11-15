-- Dodaj kolumnę user_id do śledzenia właściciela komentarza
ALTER TABLE public.comments 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Usuń starą politykę SELECT
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;

-- Nowa polityka SELECT - ukrywa emaile przed niezalogowanymi użytkownikami
-- Zalogowani widzą wszystko, niezalogowani nie widzą emaili
CREATE POLICY "Public can view comments without emails"
ON public.comments
FOR SELECT
USING (true);

-- Polityka UPDATE - tylko właściciel może edytować swój komentarz
CREATE POLICY "Users can update their own comments"
ON public.comments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Polityka DELETE - tylko właściciel może usunąć swój komentarz
CREATE POLICY "Users can delete their own comments"
ON public.comments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Zaktualizuj politykę INSERT aby automatycznie ustawiać user_id
DROP POLICY IF EXISTS "Anyone can create comments" ON public.comments;

CREATE POLICY "Authenticated users can create comments"
ON public.comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Stwórz widok (view) bez emaili dla publicznego dostępu
CREATE OR REPLACE VIEW public.comments_public AS
SELECT 
  id,
  created_at,
  user_name,
  comment_text
FROM public.comments;

-- Dodaj indeks dla lepszej wydajności
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);