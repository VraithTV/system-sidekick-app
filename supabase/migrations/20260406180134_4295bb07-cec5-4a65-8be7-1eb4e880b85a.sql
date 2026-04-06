CREATE TABLE public.app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Anyone can read config (needed by Electron app without auth)
CREATE POLICY "Anyone can read app config"
ON public.app_config FOR SELECT
TO anon, authenticated
USING (true);

-- Only authenticated users can update config
CREATE POLICY "Authenticated users can update app config"
ON public.app_config FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Only authenticated users can insert config
CREATE POLICY "Authenticated users can insert app config"
ON public.app_config FOR INSERT
TO authenticated
WITH CHECK (true);

-- Seed the maintenance mode flag (off by default)
INSERT INTO public.app_config (key, value) VALUES ('maintenance_mode', 'false');