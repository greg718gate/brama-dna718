-- 1. Usuń starą politykę INSERT bez walidacji
DROP POLICY IF EXISTS "Anyone can create comments" ON public.comments;

-- 2. Utwórz nową politykę INSERT z walidacją user_id
CREATE POLICY "Users can create their own comments" 
ON public.comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. Dla comments_public (to jest VIEW, nie tabela) - sprawdź czy ma RLS
-- Views nie wymagają RLS bezpośrednio, dziedziczą z bazowej tabeli

-- 4. Zabezpiecz kolumnę user_email - ukryj ją w widoku publicznym
DROP VIEW IF EXISTS public.comments_public;

CREATE VIEW public.comments_public AS
SELECT 
    id,
    user_name,
    comment_text,
    created_at
FROM public.comments;

-- 5. Dodaj politykę dla SELECT - tylko właściciel widzi swoje komentarze w pełni
-- Ale widok publiczny pokazuje tylko bezpieczne dane