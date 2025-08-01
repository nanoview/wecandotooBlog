-- Give full control to nanopro user over user_roles table
-- This migration creates specific policies for nanopro user to have complete access

-- First, let's create a function to check if the current user is nanopro
CREATE OR REPLACE FUNCTION public.is_nanopro()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid()
    AND username = 'nanopro'
  )
$$;

-- Drop existing policies on user_roles table
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;

-- Create new policies that give nanopro full control
CREATE POLICY "Nanopro can view all user roles"
ON public.user_roles
FOR SELECT
USING (public.is_nanopro() OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Nanopro can insert any user role"
ON public.user_roles
FOR INSERT
WITH CHECK (public.is_nanopro() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Nanopro can update any user role"
ON public.user_roles
FOR UPDATE
USING (public.is_nanopro() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Nanopro can delete any user role"
ON public.user_roles
FOR DELETE
USING (public.is_nanopro() OR public.has_role(auth.uid(), 'admin'));

-- Also ensure nanopro is set as admin if not already
DO $$
DECLARE
  nanopro_user_id UUID;
BEGIN
  -- Find the user_id for username 'nanopro'
  SELECT user_id INTO nanopro_user_id
  FROM public.profiles
  WHERE username = 'nanopro';
  
  -- If user exists, ensure they have admin role
  IF nanopro_user_id IS NOT NULL THEN
    -- Remove existing roles for nanopro
    DELETE FROM public.user_roles WHERE user_id = nanopro_user_id;
    
    -- Insert admin role for nanopro
    INSERT INTO public.user_roles (user_id, role)
    VALUES (nanopro_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'User nanopro has been given full control over user_roles table and set as admin';
  ELSE
    RAISE NOTICE 'User nanopro not found. They will get full control once they register with username "nanopro"';
  END IF;
END;
$$;

-- Grant specific permissions to nanopro user for direct table access
-- Note: This is handled by RLS policies above, but we ensure the function works correctly

-- Create a helper function for nanopro to manage roles easily
CREATE OR REPLACE FUNCTION public.nanopro_set_user_role(target_user_id UUID, new_role app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow nanopro to use this function
  IF NOT public.is_nanopro() THEN
    RAISE EXCEPTION 'Access denied: Only nanopro can use this function';
  END IF;
  
  -- Delete existing role for the user
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  
  -- Insert new role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role);
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Create a function for nanopro to get all user roles
CREATE OR REPLACE FUNCTION public.nanopro_get_all_user_roles()
RETURNS TABLE(user_id UUID, username TEXT, role app_role, created_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow nanopro to use this function
  IF NOT public.is_nanopro() THEN
    RAISE EXCEPTION 'Access denied: Only nanopro can use this function';
  END IF;
  
  RETURN QUERY
  SELECT 
    ur.user_id,
    p.username,
    ur.role,
    ur.created_at
  FROM public.user_roles ur
  LEFT JOIN public.profiles p ON ur.user_id = p.user_id
  ORDER BY ur.created_at DESC;
END;
$$;
