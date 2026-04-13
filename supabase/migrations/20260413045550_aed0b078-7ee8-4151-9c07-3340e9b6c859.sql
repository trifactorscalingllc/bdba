CREATE TABLE public.barber_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  has_time TEXT,
  revenue_goal TEXT,
  cuts_range TEXT,
  situation_text TEXT,
  capital_available TEXT,
  qualified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.barber_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert leads"
ON public.barber_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "No public read access"
ON public.barber_leads
FOR SELECT
TO anon, authenticated
USING (false);