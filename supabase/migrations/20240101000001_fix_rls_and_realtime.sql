-- ============================================================================
-- NAGPUR REAL ESTATE PLATFORM - RLS FIXES & REALTIME ENABLING
-- Allows public prospective buyers to submit inquiries, schedule visits,
-- and log property views without hitting RLS denial. Enables Supabase Realtime.
-- ============================================================================

-- 1. Permissive INSERT for Inquiries (Allows public website visitors to inquire)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can submit inquiries" ON public.inquiries;
  CREATE POLICY "Public can submit inquiries"
    ON public.inquiries FOR INSERT
    WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 2. Permissive INSERT for Visit Requests (Allows public visitors to book site visits)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can schedule visits" ON public.visit_requests;
  CREATE POLICY "Public can schedule visits"
    ON public.visit_requests FOR INSERT
    WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 3. Permissive INSERT for Property Views (Allows view count tracking)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can log property views" ON public.property_views;
  CREATE POLICY "Public can log property views"
    ON public.property_views FOR INSERT
    WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 4. Enable Supabase Realtime for automatic live updates across the website
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.properties;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.inquiries;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.visit_requests;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.follow_ups;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN OTHERS THEN NULL;
END $$;
