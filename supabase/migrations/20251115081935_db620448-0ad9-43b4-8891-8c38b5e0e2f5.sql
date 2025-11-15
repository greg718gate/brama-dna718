-- Create comments table
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read comments
CREATE POLICY "Anyone can view comments" 
ON public.comments 
FOR SELECT 
USING (true);

-- Create policy to allow anyone to insert comments
CREATE POLICY "Anyone can create comments" 
ON public.comments 
FOR INSERT 
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);