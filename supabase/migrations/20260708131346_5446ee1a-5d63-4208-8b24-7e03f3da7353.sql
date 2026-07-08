CREATE TABLE public.newsletter_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT newsletter_signups_email_length CHECK (length(email) BETWEEN 3 AND 255),
  CONSTRAINT newsletter_signups_email_format CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

GRANT INSERT ON public.newsletter_signups TO anon, authenticated;
GRANT ALL ON public.newsletter_signups TO service_role;

ALTER TABLE public.newsletter_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to the newsletter"
  ON public.newsletter_signups
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (length(trim(email)) BETWEEN 3 AND 255);