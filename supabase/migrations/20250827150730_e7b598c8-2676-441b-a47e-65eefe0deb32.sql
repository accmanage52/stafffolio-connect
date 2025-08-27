-- Create edge function to handle staff creation
CREATE OR REPLACE FUNCTION public.create_staff_user(
  email text,
  password text,
  full_name text
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  result json;
BEGIN
  -- Only admins can create staff
  IF get_user_role(auth.uid()) != 'admin' THEN
    RAISE EXCEPTION 'Only admins can create staff members';
  END IF;

  -- Return success message (actual user creation will be handled by edge function)
  result := json_build_object(
    'success', true,
    'message', 'Staff creation request processed'
  );

  RETURN result;
END;
$$;