# 🍊 Nagpur Real Estate & Property Management Platform

A modern, high-performance real estate marketplace and property management platform built exclusively for **Nagpur City, Maharashtra, India** ("The Orange City").

Backed by a **PostgreSQL database hosted on Supabase** and styled with a clean, high-contrast **light theme**, this platform connects local MahaRERA-verified brokers with customers across all 21 micro-markets in Nagpur under **complete, authoritative Admin oversight**.

---

## 🌟 Key Highlights

- **Nagpur City Dedicated Focus**:
  - Covers all 21 authentic localities: Dharampeth, Civil Lines, Sadar, Ramdaspeth, Pratap Nagar, Manish Nagar, Trimurti Nagar, Wardha Road, Somalwada, Besa, Wathoda, Dhantoli, Mahal, Sitabuldi, Gandhibagh, Nandanvan, Khamla, Hingna Road, Zingabai Takli, Ayodhya Nagar, and Bajaj Nagar.
  - Authentic INR pricing formatted in Indian Lakhs and Crores (e.g., ₹48 Lakh, ₹1.15 Cr, ₹22,000/mo).
  - Landmark proximities: Nagpur Metro Aqua/Orange lines, Dr. Babasaheb Ambedkar International Airport, MIHAN SEZ (Infosys/TCS), and Zero Mile Stone.

- **Admin Panel — Full Platform Authority**:
  - Total oversight: No broker or customer action bypasses admin governance.
  - Full CRUD authority over listings (create, edit, approve, reassign, or delete).
  - Full CRUD authority over brokers/agents (onboard, suspend, edit, or reassign portfolios).
  - Full authority over customers (manage accounts, inspect property view audit history).
  - Complete control of inquiries and scheduled visit requests (approve, reject, reschedule, or reassign to another agent).
  - Manual override and resolution of automated follow-up leads.
  - Chronological system audit log recording all actions platform-wide.

- **Customer Self-Service Portal**:
  - Browse, filter, and save favorite properties.
  - Request site visits with date and time-slot selection.
  - Submit inquiries and receive verified broker responses.
  - Track scheduled visits and cancel or reschedule anytime.
  - Notification center with follow-up lead reminders.
  - Direct broker chat messaging.

- **Interactive Nagpur Map**:
  - Dynamic Leaflet/OpenStreetMap integration centered on Nagpur (21.1458° N, 79.0882° E).
  - Custom HTML markers displaying price pills (Buy in blue, Rent in purple).
  - Popups with property photo, specifications, and instant "View Details" links.
  - Quick-jump buttons to popular Nagpur hubs (Zero Mile, Dharampeth, Civil Lines, Wardha Road, Besa).

- **Automated Follow-Up Notification Engine**:
  - Scans `property_views` for views older than 48–72 hours that have no matching inquiry or visit request.
  - Auto-creates `follow_ups` records.
  - Dispatches dual notifications to the Admin/Agent and a friendly reminder to the Customer.
  - Includes a Supabase Edge Function (`supabase/functions/process-followups/index.ts`) for `pg_cron` scheduling, plus on-demand triggering from the Admin Dashboard.

- **Nagpur AI Property Advisor**:
  - Floating chatbot with intelligent local property recommendation heuristics.
  - Advises on Buy vs. Rent ROI and Nagpur locality growth trends (Wardha Road/MIHAN vs. Dharampeth premium).
  - Direct "Schedule Visit" call-to-action right inside the chat dialog.

- **Zero-Friction Dual Database Mode**:
  - Full Supabase integration (`@supabase/supabase-js`) with complete SQL migration & seed scripts.
  - Automatic graceful fallback to a reactive in-browser persistent database initialized with rich Nagpur demo data, allowing every feature, modal, and CRUD action to be evaluated immediately without cloud configuration.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 15+ (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Lucide Icons, Leaflet Maps
- **Backend & Database**: Supabase (PostgreSQL, Row Level Security, Edge Functions)
- **Auth**: Role-based access (`admin`, `agent`, `customer`) with 1-click persona switcher

---

## 🚀 Getting Started

### 1. Installation

```bash
cd C:\Users\HP\.gemini\antigravity\scratch\nagpur-realty
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Quick Role Testing Personas

Use the quick switcher in the top bar to toggle between personas with 1 click:
- 👑 **Admin**: `Rajesh Agrawal` (`usr-admin`) — Access full CRUD, broker management, follow-up scanner, and audit feed at `/admin`.
- 👔 **Agent**: `Amit Sharma` (`usr-agent-1`) — Top luxury broker at Dharampeth Realty Advisors.
- 👤 **Customer**: `Priya Deshmukh` (`usr-cust-1`) — Verified buyer managing visits and saved favorites at `/customer`.

---

## 🗄️ Database Schema & Supabase Setup

The repository includes production-ready SQL scripts in `supabase/`:

### Files
1. **Schema Migration**: `supabase/migrations/20240101000000_init_schema.sql`
   - Defines all 11 normalized tables: `users`, `agents_brokers`, `properties`, `property_locations`, `customers`, `favorites`, `inquiries`, `visit_requests`, `property_views`, `follow_ups`, `notifications`.
   - Enables Row Level Security (RLS) granting the `admin` role unrestricted `ALL` permissions across every table, while scoping `agent` and `customer` permissions.
   - Includes stored procedure `process_unattended_views_to_followups()`.

2. **Seed Data**: `supabase/seed.sql`
   - Populates 21 real Nagpur localities, 4 verified broker profiles, 4 customer accounts, 12 realistic properties across all categories, sample inquiries, visits, view audit logs, and notifications.

3. **Supabase Edge Function**: `supabase/functions/process-followups/index.ts`
   - Deno function executable via `pg_cron` or scheduled webhook.

### Deploying to Supabase Cloud
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in Supabase and paste the contents of `supabase/migrations/20240101000000_init_schema.sql`, then execute.
3. Paste and execute `supabase/seed.sql`.
4. Copy your project URL and anon key into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

---

## 🧪 Follow-Up Automation Demo

To observe the 48–72h automated follow-up engine in action:
1. Navigate to the **Admin Control Center** at `/admin`.
2. Click the **Follow-Up Automation** tab or click **Trigger 48h Follow-Up Scanner** in the top header.
3. The engine inspects views where a customer viewed a property more than 48 hours ago without booking an inquiry or visit.
4. New follow-up leads will instantly be generated with dual notifications to Admin and Customer!
5. Admins can resolve the lead as **Contacted**, **Converted**, or **Dismissed**.

---

## 📄 License & Compliance

Compliant with Maharashtra Real Estate Regulatory Authority (**MahaRERA**) guidelines. Designed for small-scale local broker networks in Nagpur, Maharashtra, India.
