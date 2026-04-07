
-- Drop the overly permissive anonymous SELECT policy
DROP POLICY IF EXISTS "Anyone can read app config" ON public.app_config;

-- Create a restricted SELECT policy: anonymous users can only read safe keys
CREATE POLICY "Public can read non-sensitive app config"
ON public.app_config
FOR SELECT TO anon
USING (key IN ('maintenance_mode', 'maintenance_enabled'));

-- Authenticated users can read all config
CREATE POLICY "Authenticated users can read app config"
ON public.app_config
FOR SELECT TO authenticated
USING (true);
