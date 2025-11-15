-- Usuń widok z SECURITY DEFINER i stwórz zwykły widok
DROP VIEW IF EXISTS public.comments_public;

-- Stwórz zwykły widok bez SECURITY DEFINER
-- Użytkownicy będą widzieć dane zgodnie ze swoimi uprawnieniami RLS
CREATE VIEW public.comments_public 
WITH (security_invoker = true)
AS
SELECT 
  id,
  created_at,
  user_name,
  comment_text
FROM public.comments;

-- Dodaj politykę RLS dla widoku
ALTER VIEW public.comments_public SET (security_invoker = true);