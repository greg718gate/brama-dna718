-- Usuń politykę wymagającą autentykacji dla INSERT
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;

-- Nowa polityka - każdy może dodawać komentarze, ale user_id jest opcjonalne
CREATE POLICY "Anyone can create comments"
ON public.comments
FOR INSERT
WITH CHECK (true);

-- Zaktualizuj kolumnę user_id żeby była nullable (opcjonalna)
ALTER TABLE public.comments 
ALTER COLUMN user_id DROP NOT NULL;