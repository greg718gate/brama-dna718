-- ============================================
-- FINALNA NAPRAWA BEZPIECZEŃSTWA KOMENTARZY
-- ============================================

-- 1. Usuń kolumnę user_email (dane wrażliwe) z tabeli comments
ALTER TABLE public.comments DROP COLUMN IF EXISTS user_email;

-- 2. Usuń stary widok comments_public
DROP VIEW IF EXISTS public.comments_public;

-- 3. Zmień politykę SELECT na tabeli comments - komentarze są PUBLICZNE do czytania
DROP POLICY IF EXISTS "Users can view only their own comments" ON public.comments;

CREATE POLICY "Anyone can view comments" 
ON public.comments 
FOR SELECT 
TO public
USING (true);

-- 4. Popraw politykę INSERT - tylko zalogowani użytkownicy mogą dodawać
DROP POLICY IF EXISTS "Users can create their own comments" ON public.comments;

CREATE POLICY "Authenticated users can create comments" 
ON public.comments 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 5. Upewnij się, że user_id NIE jest nullable (wymagane dla RLS)
ALTER TABLE public.comments ALTER COLUMN user_id SET NOT NULL;

-- 6. Dodaj foreign key do auth.users dla integralności
ALTER TABLE public.comments 
DROP CONSTRAINT IF EXISTS comments_user_id_fkey;

ALTER TABLE public.comments 
ADD CONSTRAINT comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 7. Polityki UPDATE i DELETE pozostają - tylko właściciel może modyfikować/usuwać
-- (już istnieją i są poprawne)