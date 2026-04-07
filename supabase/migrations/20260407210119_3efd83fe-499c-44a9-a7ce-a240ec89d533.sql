-- 1. Create user_roles table and enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Only users can see their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- 2. Create security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 3. Drop the overly permissive policies on app_config
DROP POLICY IF EXISTS "Authenticated users can insert app config" ON public.app_config;
DROP POLICY IF EXISTS "Authenticated users can update app config" ON public.app_config;

-- 4. Create admin-only INSERT and UPDATE policies
CREATE POLICY "Admins can insert app config"
ON public.app_config
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update app config"
ON public.app_config
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));