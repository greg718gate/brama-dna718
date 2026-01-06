-- Drop the existing public SELECT policy
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;

-- Create new policy allowing only authenticated users to view comments
CREATE POLICY "Authenticated users can view comments" 
ON public.comments 
FOR SELECT 
TO authenticated
USING (true);