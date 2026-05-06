CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a contact message"
ON public.contact_messages
FOR INSERT
TO public
WITH CHECK (
  length(trim(name)) > 0 AND length(name) <= 100
  AND length(trim(email)) > 0 AND length(email) <= 255
  AND length(trim(message)) > 0 AND length(message) <= 5000
);