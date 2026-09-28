-- ============================================================================
-- NAGPUR REAL ESTATE & PROPERTY MANAGEMENT PLATFORM - SUPABASE SCHEMA
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom Types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'agent', 'customer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE property_type AS ENUM ('residential', 'commercial');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE property_category AS ENUM ('apartment', 'villa', 'plot', 'land');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE listing_type AS ENUM ('buy', 'rent');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE property_status AS ENUM ('available', 'sold', 'pending', 'rented');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE inquiry_status AS ENUM ('new', 'in_progress', 'contacted', 'resolved', 'closed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE visit_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE follow_up_status AS ENUM ('pending', 'contacted', 'dismissed', 'converted');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 1. USERS TABLE (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. AGENTS & BROKERS TABLE
CREATE TABLE IF NOT EXISTS public.agents_brokers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  agency TEXT NOT NULL DEFAULT 'Nagpur Premier Realty',
  rating NUMERIC(2,1) NOT NULL DEFAULT 4.8,
  area_specialization TEXT NOT NULL, -- e.g. "Dharampeth & West Nagpur", "Wardha Road & Besa"
  license_no TEXT, -- RERA Maharashtra Registration No e.g. A50500012345
  bio TEXT,
  total_deals INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PROPERTY LOCATIONS (Nagpur Localities Lookup Table)
CREATE TABLE IF NOT EXISTS public.property_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL, -- Dharampeth, Civil Lines, Sadar, Besa, etc.
  zone TEXT NOT NULL, -- West Nagpur, South Nagpur, Central Nagpur, East Nagpur, North Nagpur
  pincode TEXT NOT NULL,
  popular_landmarks TEXT[], -- e.g. ["Futala Lake", "Nagpur Metro Station", "Gokulpeth Market"]
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  preferences JSONB DEFAULT '{"budget_min": 0, "budget_max": 20000000, "preferred_localities": [], "bhk": []}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active', -- active, inactive, archived
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type property_type NOT NULL DEFAULT 'residential',
  category property_category NOT NULL DEFAULT 'apartment',
  listing_type listing_type NOT NULL DEFAULT 'buy',
  bhk INT, -- 1, 2, 3, 4, 5+ (null for commercial land/plot)
  price NUMERIC(14, 2) NOT NULL, -- in INR (e.g. 6500000 = 65 Lakhs)
  price_range TEXT NOT NULL, -- e.g. "₹50L - ₹75L", "₹1Cr - ₹1.5Cr", "₹15K - ₹25K/mo"
  area_sqft NUMERIC(10, 2) NOT NULL,
  status property_status NOT NULL DEFAULT 'available',
  locality TEXT NOT NULL, -- Foreign key/lookup reference to property_locations.name
  address TEXT NOT NULL, -- Full street address in Nagpur, Maharashtra
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  agent_id UUID REFERENCES public.agents_brokers(id) ON DELETE SET NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  features TEXT[] NOT NULL DEFAULT '{}', -- e.g. ["24/7 Security", "Nagpur Metro 500m", "Lift", "Power Backup", "Covered Car Parking"]
  is_featured BOOLEAN NOT NULL DEFAULT false,
  views_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(customer_id, property_id)
);

-- 7. INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents_brokers(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  status inquiry_status NOT NULL DEFAULT 'new',
  agent_reply TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. VISIT REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.visit_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents_brokers(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL,
  time_slot TEXT NOT NULL, -- e.g. "10:00 AM - 11:30 AM", "04:00 PM - 05:30 PM"
  status visit_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  agent_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. PROPERTY VIEWS (Audit Log for automated follow-ups)
CREATE TABLE IF NOT EXISTS public.property_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. FOLLOW-UPS TABLE
CREATE TABLE IF NOT EXISTS public.follow_ups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status follow_up_status NOT NULL DEFAULT 'pending',
  notified_admin BOOLEAN NOT NULL DEFAULT false,
  notified_customer BOOLEAN NOT NULL DEFAULT false,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ
);

-- 11. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'follow_up', 'inquiry', 'visit_request', 'system', 'deal'
  message TEXT NOT NULL,
  read_status BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_properties_locality ON public.properties(locality);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_type_category ON public.properties(type, category, listing_type);
CREATE INDEX IF NOT EXISTS idx_property_views_cust_prop ON public.property_views(customer_id, property_id, viewed_at);
CREATE INDEX IF NOT EXISTS idx_inquiries_customer ON public.inquiries(customer_id);
CREATE INDEX IF NOT EXISTS idx_visit_requests_customer ON public.visit_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read_status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Admin role holds UNRESTRICTED read/write authority across every table.
-- Agent and Customer roles are scoped to their authorized records.
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents_brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function: check if authenticated user has role 'admin'
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function: get role of current user
CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- 1. USERS POLICIES
CREATE POLICY "Admin has full authority on users"
  ON public.users FOR ALL
  USING (public.is_admin());

CREATE POLICY "Users can read and update own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- 2. AGENTS & BROKERS POLICIES
CREATE POLICY "Admin has full authority on agents_brokers"
  ON public.agents_brokers FOR ALL
  USING (public.is_admin());

CREATE POLICY "Public can view active agents"
  ON public.agents_brokers FOR SELECT
  USING (is_active = true);

CREATE POLICY "Agents can update their own profile"
  ON public.agents_brokers FOR UPDATE
  USING (user_id = auth.uid());

-- 3. PROPERTY LOCATIONS POLICIES
CREATE POLICY "Admin has full authority on property_locations"
  ON public.property_locations FOR ALL
  USING (public.is_admin());

CREATE POLICY "Public read for property_locations"
  ON public.property_locations FOR SELECT
  USING (true);

-- 4. CUSTOMERS POLICIES
CREATE POLICY "Admin has full authority on customers"
  ON public.customers FOR ALL
  USING (public.is_admin());

CREATE POLICY "Customers can manage own record"
  ON public.customers FOR ALL
  USING (user_id = auth.uid());

-- 5. PROPERTIES POLICIES
CREATE POLICY "Admin has full authority on properties"
  ON public.properties FOR ALL
  USING (public.is_admin());

CREATE POLICY "Public can view available and pending properties"
  ON public.properties FOR SELECT
  USING (status IN ('available', 'pending', 'rented', 'sold'));

CREATE POLICY "Agents can update properties assigned to them"
  ON public.properties FOR UPDATE
  USING (
    agent_id IN (SELECT id FROM public.agents_brokers WHERE user_id = auth.uid())
  );

-- 6. FAVORITES POLICIES
CREATE POLICY "Admin has full authority on favorites"
  ON public.favorites FOR ALL
  USING (public.is_admin());

CREATE POLICY "Customers can manage their own favorites"
  ON public.favorites FOR ALL
  USING (
    customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
  );

-- 7. INQUIRIES POLICIES
CREATE POLICY "Admin has full authority on inquiries"
  ON public.inquiries FOR ALL
  USING (public.is_admin());

CREATE POLICY "Customers can view and create own inquiries"
  ON public.inquiries FOR ALL
  USING (
    customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
  );

CREATE POLICY "Public can submit inquiries"
  ON public.inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Agents can view and update inquiries assigned to them"
  ON public.inquiries FOR SELECT
  USING (
    agent_id IN (SELECT id FROM public.agents_brokers WHERE user_id = auth.uid())
  );

-- 8. VISIT REQUESTS POLICIES
CREATE POLICY "Admin has full authority on visit_requests"
  ON public.visit_requests FOR ALL
  USING (public.is_admin());

CREATE POLICY "Customers can manage own visit requests"
  ON public.visit_requests FOR ALL
  USING (
    customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
  );

CREATE POLICY "Public can schedule visits"
  ON public.visit_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Agents can view and update assigned visit requests"
  ON public.visit_requests FOR ALL
  USING (
    agent_id IN (SELECT id FROM public.agents_brokers WHERE user_id = auth.uid())
  );

-- 9. PROPERTY VIEWS POLICIES
CREATE POLICY "Admin has full authority on property_views"
  ON public.property_views FOR ALL
  USING (public.is_admin());

CREATE POLICY "Customers can insert and view their own property views"
  ON public.property_views FOR ALL
  USING (
    customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
  );

CREATE POLICY "Public can log property views"
  ON public.property_views FOR INSERT
  WITH CHECK (true);

-- 10. FOLLOW-UPS POLICIES
CREATE POLICY "Admin has full authority on follow_ups"
  ON public.follow_ups FOR ALL
  USING (public.is_admin());

CREATE POLICY "Agents can view follow-ups for their properties"
  ON public.follow_ups FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM public.properties
      WHERE agent_id IN (SELECT id FROM public.agents_brokers WHERE user_id = auth.uid())
    )
  );

-- 11. NOTIFICATIONS POLICIES
CREATE POLICY "Admin has full authority on notifications"
  ON public.notifications FOR ALL
  USING (public.is_admin());

CREATE POLICY "Users can manage their own notifications"
  ON public.notifications FOR ALL
  USING (user_id = auth.uid());

-- ============================================================================
-- AUTOMATED FOLLOW-UP LOGIC (TRIGGER / FUNCTION)
-- Scans property_views where viewed_at > 48 hours ago without matching
-- inquiries or visit_requests, auto-creates follow_ups and inserts dual notifications.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.process_unattended_views_to_followups()
RETURNS INT AS $$
DECLARE
  v_count INT := 0;
  v_view RECORD;
  v_agent_user_id UUID;
  v_cust_user_id UUID;
  v_prop_title TEXT;
  v_prop_locality TEXT;
  v_admin_id UUID;
BEGIN
  -- Identify admin user for system notifications
  SELECT id INTO v_admin_id FROM public.users WHERE role = 'admin' LIMIT 1;

  FOR v_view IN
    SELECT DISTINCT pv.customer_id, pv.property_id, pv.viewed_at,
           p.title, p.locality, p.agent_id,
           c.user_id as cust_user_id, c.name as cust_name,
           ab.user_id as agent_user_id
    FROM public.property_views pv
    JOIN public.properties p ON p.id = pv.property_id
    JOIN public.customers c ON c.id = pv.customer_id
    LEFT JOIN public.agents_brokers ab ON ab.id = p.agent_id
    WHERE pv.viewed_at <= NOW() - INTERVAL '48 hours'
      -- Property has no inquiry from this customer
      AND NOT EXISTS (
        SELECT 1 FROM public.inquiries i
        WHERE i.customer_id = pv.customer_id AND i.property_id = pv.property_id
      )
      -- Property has no visit request from this customer
      AND NOT EXISTS (
        SELECT 1 FROM public.visit_requests vr
        WHERE vr.customer_id = pv.customer_id AND vr.property_id = pv.property_id
      )
      -- No existing follow up created yet
      AND NOT EXISTS (
        SELECT 1 FROM public.follow_ups f
        WHERE f.customer_id = pv.customer_id AND f.property_id = pv.property_id
      )
  LOOP
    -- 1. Insert into follow_ups
    INSERT INTO public.follow_ups (customer_id, property_id, triggered_at, status, notified_admin, notified_customer)
    VALUES (v_view.customer_id, v_view.property_id, NOW(), 'pending', true, true);

    -- 2. Notify Admin
    IF v_admin_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, type, message, link)
      VALUES (
        v_admin_id,
        'follow_up',
        'Lead alert: ' || v_view.cust_name || ' viewed "' || v_view.title || '" (' || v_view.locality || ') 48h ago without an inquiry.',
        '/admin'
      );
    END IF;

    -- 3. Notify Agent if assigned
    IF v_view.agent_user_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, type, message, link)
      VALUES (
        v_view.agent_user_id,
        'follow_up',
        'Lead Opportunity: ' || v_view.cust_name || ' showed interest in "' || v_view.title || '". Follow-up recommended.',
        '/admin'
      );
    END IF;

    -- 4. Notify Customer with friendly reminder
    IF v_view.cust_user_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, type, message, link)
      VALUES (
        v_view.cust_user_id,
        'follow_up',
        'Still interested in ' || v_view.title || ' in ' || v_view.locality || '? Book a direct site visit with our local Nagpur broker.',
        '/properties/' || v_view.property_id
      );
    END IF;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Supabase Realtime for instant frontend updates
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

