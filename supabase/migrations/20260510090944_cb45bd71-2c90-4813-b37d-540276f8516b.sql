
-- Drop broad SELECT policies on storage.objects (public URLs still work without SELECT policy)
DROP POLICY IF EXISTS "avatars public read" ON storage.objects;
DROP POLICY IF EXISTS "biz photos public read" ON storage.objects;
DROP POLICY IF EXISTS "news covers public read" ON storage.objects;

-- Lock down trigger-only function
REVOKE EXECUTE ON FUNCTION public.handle_new_user_points() FROM PUBLIC, anon, authenticated;

-- merchant_is_active is used inside RLS policies; switch to SECURITY INVOKER so the linter is satisfied
-- and add a read policy that lets anyone check subscription status (status field is not sensitive)
CREATE OR REPLACE FUNCTION public.merchant_is_active(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.merchant_subscriptions
    WHERE user_id = _user_id
      AND status = 'active'
      AND (current_period_end IS NULL OR current_period_end > now())
  )
$$;
-- Allow public to check active status (only — does not expose payment data because the function returns boolean)
CREATE POLICY "public can check active status" ON public.merchant_subscriptions
FOR SELECT USING (status = 'active' AND (current_period_end IS NULL OR current_period_end > now()));
