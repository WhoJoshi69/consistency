-- Drop the auth trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Now drop and recreate the function with proper security
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate user creation handler with proper security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Anonymous User'));
  
  -- Create default "Uncategorized" category for new user
  INSERT INTO public.categories (name, created_by)
  VALUES ('Uncategorized', NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the auth trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();