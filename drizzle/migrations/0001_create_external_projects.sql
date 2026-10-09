CREATE TABLE public.external_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.external_projects TO authenticated;
GRANT ALL ON public.external_projects TO service_role;
ALTER TABLE public.external_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own external projects" ON public.external_projects FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);