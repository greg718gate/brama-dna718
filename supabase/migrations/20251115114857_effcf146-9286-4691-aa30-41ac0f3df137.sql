-- Usuń obecną politykę SELECT która pokazuje wszystko
DROP POLICY IF EXISTS "Public can view comments without emails" ON public.comments;

-- Nowa polityka SELECT - NIE POZWALA na bezpośrednie czytanie tabeli comments
-- Użytkownicy muszą używać widoku comments_public
CREATE POLICY "Only authenticated users can view full comments"
ON public.comments
FOR SELECT
TO authenticated
USING (true);

-- Dla niezalogowanych - żaden dostęp do tabeli comments
-- Muszą używać widoku comments_public

-- Dodaj komentarz do widoku wyjaśniający jego cel
COMMENT ON VIEW public.comments_public IS 'Public view of comments without email addresses. Use this view for displaying comments to unauthenticated users.';