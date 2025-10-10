-- Update the handle_new_user function to include country and region from signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone_number, country, region, user_type, language)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.raw_user_meta_data ->> 'phone_number',
    NEW.raw_user_meta_data ->> 'country',
    NEW.raw_user_meta_data ->> 'region',
    COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'farmer'),
    COALESCE((NEW.raw_user_meta_data ->> 'language')::public.user_language, 'sw-KE'::public.user_language)
  );
  RETURN NEW;
END;
$function$;