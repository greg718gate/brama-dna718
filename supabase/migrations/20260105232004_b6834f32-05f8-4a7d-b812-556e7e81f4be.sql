-- Zmień widok na SECURITY INVOKER (bezpieczniejsze)
DROP VIEW IF EXISTS public.comments_public;

CREATE VIEW public.comments_public 
WITH (security_invoker = true) AS
SELECT 
    id,
    user_name,
    comment_text,
    created_at
FROM public.comments;