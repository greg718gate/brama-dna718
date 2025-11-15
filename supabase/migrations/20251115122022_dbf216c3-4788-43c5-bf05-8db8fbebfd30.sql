-- Fix email exposure: Remove the public SELECT policy on comments table
-- Now ONLY users can see their own comments via user_id check
DROP POLICY IF EXISTS "Only authenticated users can view full comments" ON public.comments;

-- Add restricted policy: users can only see their own comments
CREATE POLICY "Users can view only their own comments"
ON public.comments
FOR SELECT
USING (auth.uid() = user_id);