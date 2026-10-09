ALTER TABLE public.daily_activities
  ADD COLUMN IF NOT EXISTS is_planned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS duration_minutes integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS observations text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS idea_id uuid;