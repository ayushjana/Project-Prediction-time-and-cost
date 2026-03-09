-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  project_type TEXT NOT NULL,
  complexity TEXT NOT NULL,
  team_size INTEGER NOT NULL,
  tech_stack TEXT,
  experience_level TEXT NOT NULL,
  estimated_requirements INTEGER NOT NULL,
  location TEXT,
  predicted_cost NUMERIC,
  predicted_duration NUMERIC,
  risk_score INTEGER,
  risk_level TEXT,
  risk_factors JSONB DEFAULT '[]'::jsonb,
  timeline_phases JSONB DEFAULT '[]'::jsonb,
  monte_carlo_best NUMERIC,
  monte_carlo_worst NUMERIC,
  monte_carlo_avg NUMERIC,
  team_productivity INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Users can only access their own projects
CREATE POLICY "Users can view their own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster user queries
CREATE INDEX idx_projects_user_id ON public.projects(user_id);