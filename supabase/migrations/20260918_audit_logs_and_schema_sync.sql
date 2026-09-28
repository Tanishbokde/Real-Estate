-- ============================================================================
-- NAGPUR REAL ESTATE & PROPERTY MANAGEMENT PLATFORM
-- MIGRATION: AUDIT LOGS TABLE & REALTIME HISTORY SYNC
-- ============================================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ============================================================================

-- 1. Create AUDIT_LOGS table if it doesn't already exist
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  user_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin', -- 'admin', 'agent', 'customer'
  action TEXT NOT NULL,                -- e.g. 'Updated Property', 'Requested Site Visit', 'Confirmed Visit'
  details TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast retrieval ordered by recent events
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_role ON public.audit_logs (role);

-- 2. Enable Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for audit_logs
-- Allow everyone (including anon client) to insert audit logs so actions from platform are recorded
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public and anon can insert audit logs" ON public.audit_logs;
  CREATE POLICY "Public and anon can insert audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Allow reading audit logs
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public read access for audit logs" ON public.audit_logs;
  CREATE POLICY "Public read access for audit logs"
    ON public.audit_logs FOR SELECT
    USING (true);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 4. Ensure visit_requests table supports both status updates and notes from anon/public
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can update visit requests" ON public.visit_requests;
  CREATE POLICY "Public can update visit requests"
    ON public.visit_requests FOR UPDATE
    USING (true)
    WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 5. Ensure inquiries table supports status updates from platform
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can update inquiries" ON public.inquiries;
  CREATE POLICY "Public can update inquiries"
    ON public.inquiries FOR UPDATE
    USING (true)
    WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 6. Ensure properties table supports updates from platform
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can update properties" ON public.properties;
  CREATE POLICY "Public can update properties"
    ON public.properties FOR UPDATE
    USING (true)
    WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 7. Seed initial audit log history if empty
INSERT INTO public.audit_logs (id, user_name, role, action, details, timestamp)
VALUES 
  ('log-seed-1', 'Rajesh Agrawal (Admin)', 'admin', 'Approved Listing', 'Approved Luxury 3 BHK Skyline Apartment in Dharampeth', NOW() - INTERVAL '2 days'),
  ('log-seed-2', 'Amit Sharma (Agent)', 'agent', 'Confirmed Visit', 'Confirmed site visit for Priya Deshmukh on Dharampeth flat', NOW() - INTERVAL '1 day'),
  ('log-seed-3', 'System Job', 'admin', 'Follow-Up Auto Trigger', 'Auto-generated 48h lead follow-up for Priya Deshmukh on Ramdaspeth 3 BHK', NOW() - INTERVAL '4 hours'),
  ('log-seed-4', 'Priya Deshmukh (Customer)', 'customer', 'Submitted Inquiry', 'Inquired about loan sanction and price on Dharampeth Skyline', NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;
