import { supabase, isSupabaseConfigured, getSupabaseAdminClient, getSupabaseClient } from "./client";
import {
  Property,
  AgentBroker,
  Customer,
  PropertyLocation,
  Inquiry,
  VisitRequest,
  FollowUp,
  AppNotification,
  AuditLog,
  PropertyStatus,
  VisitStatus,
  InquiryStatus,
  FollowUpStatus
} from "../types/database";

import { isValidUuid, toUuid, fromUuid, isMatchingId } from "../utils";
export { isValidUuid, toUuid, fromUuid, isMatchingId };


export interface SupabaseHealthResult {
  isConfigured: boolean;
  isConnected: boolean;
  message: string;
  tableCounts?: {
    properties: number;
    agents: number;
    customers: number;
    inquiries: number;
    visits: number;
    localities: number;
    auditLogs?: number;
  };
  error?: string;
}

class SupabaseService {
  /**
   * Helper to resolve the most capable Supabase client
   */
  public getClient() {
    return getSupabaseAdminClient() || getSupabaseClient() || supabase;
  }

  /**
   * Diagnostic health check for Supabase connection & table accessibility
   */
  async checkHealth(): Promise<SupabaseHealthResult> {
    const client = this.getClient();
    if (!isSupabaseConfigured || !client) {
      return {
        isConfigured: false,
        isConnected: false,
        message: "Supabase credentials are not set or are placeholders in .env.local"
      };
    }

    try {
      // Query properties table count
      const { count: propCount, error: propErr } = await client
        .from("properties")
        .select("*", { count: "exact", head: true });

      if (propErr) {
        return {
          isConfigured: true,
          isConnected: false,
          message: `Database error querying "properties": ${propErr.message}`,
          error: propErr.message
        };
      }

      // Query other tables in parallel
      const [
        { count: agentCount },
        { count: custCount },
        { count: inqCount },
        { count: visitCount },
        { count: locCount },
        auditRes
      ] = await Promise.all([
        client.from("agents_brokers").select("*", { count: "exact", head: true }),
        client.from("customers").select("*", { count: "exact", head: true }),
        client.from("inquiries").select("*", { count: "exact", head: true }),
        client.from("visit_requests").select("*", { count: "exact", head: true }),
        client.from("property_locations").select("*", { count: "exact", head: true }),
        Promise.resolve(client.from("audit_logs").select("*", { count: "exact", head: true })).catch(() => ({ count: 0, data: null, error: null }))
      ]);

      return {
        isConfigured: true,
        isConnected: true,
        message: "Successfully connected to your Supabase PostgreSQL database!",
        tableCounts: {
          properties: propCount ?? 0,
          agents: agentCount ?? 0,
          customers: custCount ?? 0,
          inquiries: inqCount ?? 0,
          visits: visitCount ?? 0,
          localities: locCount ?? 0,
          auditLogs: (auditRes as any)?.count ?? 0
        }
      };
    } catch (err: any) {
      return {
        isConfigured: true,
        isConnected: false,
        message: `Connection failed: ${err.message}`,
        error: err.message
      };
    }
  }

  // ==========================================
  // PROPERTIES (CRUD)
  // ==========================================

  async getProperties(): Promise<{ data: Property[] | null; error: string | null }> {
    const client = this.getClient();
    if (!isSupabaseConfigured || !client) {
      return { data: null, error: "Supabase not configured" };
    }

    try {
      const { data, error } = await client
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { data: (data as Property[]) || [], error: null };
    } catch (err: any) {
      console.error("Supabase getProperties error:", err);
      return { data: null, error: err.message };
    }
  }

  async getPropertyById(id: string): Promise<{ data: Property | null; error: string | null }> {
    const client = this.getClient();
    if (!isSupabaseConfigured || !client) {
      return { data: null, error: "Supabase not configured" };
    }

    const targetId = toUuid(id) || id;

    try {
      const { data, error } = await client
        .from("properties")
        .select("*")
        .eq("id", targetId)
        .single();

      if (error) throw error;
      return { data: data as Property, error: null };
    } catch (err: any) {
      const errMsg = err?.message || err?.details || (typeof err === "object" ? JSON.stringify(err) : String(err));
      console.error(`Supabase getPropertyById(${id}) error:`, errMsg);
      return { data: null, error: errMsg };
    }
  }

  async createProperty(
    property: Omit<Property, "id" | "views_count" | "created_at" | "updated_at"> & { id?: string }
  ): Promise<{ data: Property | null; error: string | null }> {
    const client = this.getClient();
    if (!isSupabaseConfigured || !client) {
      return { data: null, error: "Supabase not configured" };
    }

    try {
      const payload: any = {
        ...property,
        agent_id: toUuid(property.agent_id) || property.agent_id,
        views_count: 0
      };

      if (payload.id && !isValidUuid(payload.id)) {
        delete payload.id;
      }

      const { data, error } = await client
        .from("properties")
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return { data: data as Property, error: null };
    } catch (err: any) {
      const errMsg = err?.message || err?.details || (typeof err === "object" ? JSON.stringify(err) : String(err));
      console.error("Supabase createProperty error:", errMsg);
      return { data: null, error: errMsg };
    }
  }

  async updateProperty(
    id: string,
    updates: Partial<Property>
  ): Promise<{ data: Property | null; error: string | null }> {
    const client = this.getClient();
    if (!isSupabaseConfigured || !client) {
      return { data: null, error: "Supabase not configured" };
    }

    const targetId = toUuid(id) || id;

    try {
      const payload: any = { ...updates, updated_at: new Date().toISOString() };
      if (payload.agent_id) {
        payload.agent_id = toUuid(payload.agent_id) || payload.agent_id;
      }

      const { data, error } = await client
        .from("properties")
        .update(payload)
        .eq("id", targetId)
        .select()
        .single();

      if (error) throw error;
      return { data: data as Property, error: null };
    } catch (err: any) {
      const errMsg = err?.message || err?.details || (typeof err === "object" ? JSON.stringify(err) : String(err));
      console.error(`Supabase updateProperty(${id}) error:`, errMsg);
      return { data: null, error: errMsg };
    }
  }

  async deleteProperty(id: string): Promise<{ success: boolean; error: string | null }> {
    const client = this.getClient();
    if (!isSupabaseConfigured || !client) {
      return { success: false, error: "Supabase not configured" };
    }

    const targetId = toUuid(id) || id;

    try {
      const { error } = await client.from("properties").delete().eq("id", targetId);
      if (error) throw error;
      return { success: true, error: null };
    } catch (err: any) {
      const errMsg = err?.message || err?.details || (typeof err === "object" ? JSON.stringify(err) : String(err));
      console.error(`Supabase deleteProperty(${id}) error:`, errMsg);
      return { success: false, error: errMsg };
    }
  }

  // ==========================================
  // AGENTS / BROKERS
  // ==========================================

  async createAgent(
    agent: Omit<AgentBroker, "id" | "created_at"> & { id?: string }
  ): Promise<{ data: AgentBroker | null; error: string | null }> {
    const client = this.getClient();
    if (!isSupabaseConfigured || !client) {
      return { data: null, error: "Supabase not configured" };
    }

    try {
      const payload: any = { ...agent };
      if (payload.id && !isValidUuid(payload.id)) {
        delete payload.id;
      }

      const { data, error } = await client
        .from("agents_brokers")
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return { data: data as AgentBroker, error: null };
    } catch (err: any) {
      const errMsg = err?.message || err?.details || (typeof err === "object" ? JSON.stringify(err) : String(err));
      console.error("Supabase createAgent error:", errMsg);
      return { data: null, error: errMsg };
    }
  }

  async getAgents(): Promise<{ data: AgentBroker[] | null; error: string | null }> {
    const client = this.getClient();
    if (!isSupabaseConfigured || !client) {
      return { data: null, error: "Supabase not configured" };
    }

    try {
      const { data, error } = await client
        .from("agents_brokers")
        .select("*")
        .order("rating", { ascending: false });

      if (error) throw error;
      return { data: (data as AgentBroker[]) || [], error: null };
    } catch (err: any) {
      const errMsg = err?.message || err?.details || (typeof err === "object" ? JSON.stringify(err) : String(err));
      console.error("Supabase getAgents error:", errMsg);
      return { data: null, error: errMsg };
    }
  }

  async updateAgent(
    id: string,
    updates: Partial<AgentBroker>
  ): Promise<{ data: AgentBroker | null; error: string | null }> {
    const client = this.getClient();
    if (!isSupabaseConfigured || !client) {
      return { data: null, error: "Supabase not configured" };
    }

    const targetId = toUuid(id) || id;

    try {
      const { data, error } = await client
        .from("agents_brokers")
        .update(updates)
        .eq("id", targetId)
        .select()
        .single();

      if (error) throw error;
      return { data: data as AgentBroker, error: null };
    } catch (err: any) {
      const errMsg = err?.message || err?.details || (typeof err === "object" ? JSON.stringify(err) : String(err));
      console.error(`Supabase updateAgent(${id}) error:`, errMsg);
      return { data: null, error: errMsg };
    }
  }

  // ==========================================
  // CUSTOMERS
  // ==========================================

  async createCustomer(
    customer: Omit<Customer, "id" | "created_at"> & { id?: string }
  ): Promise<{ data: Customer | null; error: string | null }> {
    const client = this.getClient();
    if (!isSupabaseConfigured || !client) {
      return { data: null, error: "Supabase not configured" };
    }

    try {
      const payload: any = { ...customer };
      if (payload.id && !isValidUuid(payload.id)) {
        delete payload.id;
      }
      if (payload.user_id && !isValidUuid(payload.user_id)) {
        payload.user_id = null;
      }

      const { data, error } = await client
        .from("customers")
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return { data: data as Customer, error: null };
    } catch (err: any) {
      const errMsg = err?.message || err?.details || (typeof err === "object" ? JSON.stringify(err) : String(err));
      console.error("Supabase createCustomer error:", errMsg);
      return { data: null, error: errMsg };
    }
  }

  async getCustomers(): Promise<{ data: Customer[] | null; error: string | null }> {
    const client = this.getClient();
    if (!isSupabaseConfigured || !client) {
      return { data: null, error: "Supabase not configured" };
    }

    try {
      const { data, error } = await client
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { data: (data as Customer[]) || [], error: null };
    } catch (err: any) {
      const errMsg = err?.message || err?.details || (typeof err === "object" ? JSON.stringify(err) : String(err));
      console.error("Supabase getCustomers error:", errMsg);
      return { data: null, error: errMsg };
    }
  }

  async updateCustomer(
    id: string,
    updates: Partial<Customer>
  ): Promise<{ data: Customer | null; error: string | null }> {
    const client = this.getClient();
    if (!isSupabaseConfigured || !client) {
      return { data: null, error: "Supabase not configured" };
    }

    const targetId = toUuid(id) || id;

    try {
      const { data, error } = await client
        .from("customers")
        .update(updates)
        .eq("id", targetId)
        .select()
        .single();

      if (error) throw error;
      return { data: data as Customer, error: null };
    } catch (err: any) {
      const errMsg = err?.message || err?.details || (typeof err === "object" ? JSON.stringify(err) : String(err));
      console.error(`Supabase updateCustomer(${id}) error:`, errMsg);
      return { data: null, error: errMsg };
    }
  }

  // ==========================================
  // LOCALITIES
  // ==========================================

  async getLocalities(): Promise<{ data: PropertyLocation[] | null; error: string | null }> {
    const client = this.getClient();
    if (!isSupabaseConfigured || !client) {
      return { data: null, error: "Supabase not configured" };
    }

    try {
      const { data, error } = await client
        .from("property_locations")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      return { data: (data as PropertyLocation[]) || [], error: null };
    } catch (err: any) {
      const errMsg = err?.message || err?.details || (typeof err === "object" ? JSON.stringify(err) : String(err));
      console.error("Supabase getLocalities error:", errMsg);
      return { data: null, error: errMsg };
    }
  }

  // ==========================================
  // INQUIRIES
  // ==========================================

  async getInquiries(filter?: {
    customerId?: string;
    agentId?: string;
  }): Promise<{ data: Inquiry[] | null; error: string | null }> {
    const client = this.getClient();
    if (!isSupabaseConfigured || !client) {
      return { data: null, error: "Supabase not configured" };
    }

    try {
      let query = client.from("inquiries").select("*").order("created_at", { ascending: false });

      if (filter?.customerId) {
        query = query.eq("customer_id", toUuid(filter.customerId) || filter.customerId);
      }
      if (filter?.agentId) {
        query = query.eq("agent_id", toUuid(filter.agentId) || filter.agentId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: (data as Inquiry[]) || [], error: null };
    } catch (err: any) {
      const errMsg = err?.message || err?.details || (typeof err === "object" ? JSON.stringify(err) : String(err));
      console.error("Supabase getInquiries error:", errMsg);
      return { data: null, error: errMsg };
    }
  }

  async createInquiry(
    inquiry: Omit<Inquiry, "id" | "created_at" | "updated_at"> & { id?: string }
  ): Promise<{ data: Inquiry | null; error: string | null }> {
    const client = this.getClient();
    if (!isSupabaseConfigured || !client) {
      return { data: null, error: "Supabase not configured" };
    }

    try {
      const payload: any = {
        ...inquiry,
        customer_id: toUuid(inquiry.customer_id) || inquiry.customer_id,
        property_id: toUuid(inquiry.property_id) || inquiry.property_id,
        agent_id: toUuid(inquiry.agent_id) || inquiry.agent_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (payload.id && !isValidUuid(payload.id)) {
        delete payload.id;
      }

      const res = await client
        .from("inquiries")
        .insert([payload])
        .select()
        .single();

      if (res.error && (res.error.code === "42501" || res.error.message?.toLowerCase().includes("row-level security"))) {
        const plainInsert = await client.from("inquiries").insert([payload]);
        if (plainInsert.error) throw plainInsert.error;
        return { data: { ...payload, id: payload.id || "inq-" + Date.now() } as Inquiry, error: null };
      }

      if (res.error) throw res.error;
      return { data: res.data as Inquiry, error: null };
    } catch (err: any) {
      const errMsg = err?.message || err?.details || (typeof err === "object" ? JSON.stringify(err) : String(err));
      console.error("Supabase createInquiry error:", errMsg);
      return { data: null, error: errMsg };
    }
  }

  async updateInquiryStatus(
    id: string,
    status: InquiryStatus,
    agentReply?: string
  ): Promise<{ data: Inquiry | null; error: string | null }> {
    const client = this.getClient();
    if (!isSupabaseConfigured || !client) {
      return { data: null, error: "Supabase not configured" };
    }

    const targetId = toUuid(id) || id;

    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString()
      };
      if (agentReply !== undefined) {
        updates.agent_reply = agentReply;
      }

      const res = await client
        .from("inquiries")
        .update(updates)
        .eq("id", targetId)
        .select()
        .single();

      if (res.error) {
        const plainUpdate = await client.from("inquiries").update(updates).eq("id", targetId);
        if (plainUpdate.error) throw plainUpdate.error;
        return { data: { id: targetId, ...updates } as any, error: null };
      }

      return { data: res.data as Inquiry, error: null };
    } catch (err: any) {
      const errMsg = err?.message || err?.details || (typeof err === "object" ? JSON.stringify(err) : String(err));
      console.error(`Supabase updateInquiryStatus(${id}) error:`, errMsg);
      return { data: null, error: errMsg };
    }
  }

  // ==========================================
  // VISIT REQUESTS
  // ==========================================

  async getVisitRequests(filter?: {
    customerId?: string;
    agentId?: string;
  }): Promise<{ data: VisitRequest[] | null; error: string | null }> {
    const client = this.getClient();
    if (!isSupabaseConfigured || !client) {
      return { data: null, error: "Supabase not configured" };
    }

    try {
      let query = client.from("visit_requests").select("*").order("created_at", { ascending: false });

      if (filter?.customerId) {
        query = query.eq("customer_id", toUuid(filter.customerId) || filter.customerId);
      }
      if (filter?.agentId) {
        query = query.eq("agent_id", toUuid(filter.agentId) || filter.agentId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: (data as VisitRequest[]) || [], error: null };
    } catch (err: any) {
      const errMsg = err?.message || err?.details || (typeof err === "object" ? JSON.stringify(err) : String(err));
      console.error("Supabase getVisitRequests error:", errMsg);
      return { data: null, error: errMsg };
    }
  }

  async createVisitRequest(
    visit: Omit<VisitRequest, "id" | "created_at" | "updated_at"> & { id?: string }
  ): Promise<{ data: VisitRequest | null; error: string | null }> {
    const client = this.getClient();
    if (!isSupabaseConfigured || !client) {
      return { data: null, error: "Supabase not configured" };
    }

    try {
      const payload: any = {
        ...visit,
        customer_id: toUuid(visit.customer_id) || visit.customer_id,
        property_id: toUuid(visit.property_id) || visit.property_id,
        agent_id: toUuid(visit.agent_id) || visit.agent_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Strip mock non-UUID id so Postgres generates default UUID
      if (payload.id && !isValidUuid(payload.id)) {
        delete payload.id;
      }

      // Ensure valid UUID foreign keys for Postgres integrity
      if (payload.customer_id && !isValidUuid(payload.customer_id)) {
        payload.customer_id = "33333333-3333-3333-3333-333333333001";
      }
      if (payload.property_id && !isValidUuid(payload.property_id)) {
        payload.property_id = "44444444-4444-4444-4444-444444444001";
      }
      if (payload.agent_id && !isValidUuid(payload.agent_id)) {
        payload.agent_id = null;
      }

      const res = await client
        .from("visit_requests")
        .insert([payload])
        .select()
        .single();

      // If RLS blocked .select() (code 42501) for anonymous/public users, perform plain insert
      if (res.error && (res.error.code === "42501" || res.error.message?.toLowerCase().includes("row-level security"))) {
        const plainInsert = await client.from("visit_requests").insert([payload]);
        if (plainInsert.error) throw plainInsert.error;
        return { data: { ...payload, id: payload.id || "visit-" + Date.now() } as VisitRequest, error: null };
      }

      if (res.error) throw res.error;
      return { data: res.data as VisitRequest, error: null };
    } catch (err: any) {
      const errMsg = err?.message || err?.details || (typeof err === "object" ? JSON.stringify(err) : String(err));
      console.error("Supabase createVisitRequest error:", errMsg);
      return { data: null, error: errMsg };
    }
  }

  async updateVisitStatus(
    id: string,
    status: VisitStatus,
    agentNotes?: string,
    reschedule?: { scheduled_date?: string; time_slot?: string }
  ): Promise<{ data: VisitRequest | null; error: string | null }> {
    const client = this.getClient();
    if (!isSupabaseConfigured || !client) {
      return { data: null, error: "Supabase not configured" };
    }

    const targetId = toUuid(id) || id;

    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString()
      };
      if (agentNotes !== undefined) {
        updates.agent_notes = agentNotes;
      }
      if (reschedule?.scheduled_date) {
        updates.scheduled_date = reschedule.scheduled_date;
      }
      if (reschedule?.time_slot) {
        updates.time_slot = reschedule.time_slot;
      }

      const res = await client
        .from("visit_requests")
        .update(updates)
        .eq("id", targetId)
        .select()
        .single();

      if (res.error) {
        const plainUpdate = await client.from("visit_requests").update(updates).eq("id", targetId);
        if (plainUpdate.error) throw plainUpdate.error;
        return { data: { id: targetId, ...updates } as any, error: null };
      }

      return { data: res.data as VisitRequest, error: null };
    } catch (err: any) {
      const errMsg = err?.message || err?.details || (typeof err === "object" ? JSON.stringify(err) : String(err));
      console.error(`Supabase updateVisitStatus(${id}) error:`, errMsg);
      return { data: null, error: errMsg };
    }
  }

  // ==========================================
  // AUDIT LOGS / HISTORY
  // ==========================================

  async getAuditLogs(limit = 100): Promise<{ data: AuditLog[] | null; error: string | null }> {
    const client = this.getClient();
    if (!isSupabaseConfigured || !client) {
      return { data: null, error: "Supabase not configured" };
    }

    try {
      const { data, error } = await client
        .from("audit_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (error) {
        console.warn("Supabase getAuditLogs warning:", error.message);
        return { data: null, error: error.message };
      }
      return { data: (data as AuditLog[]) || [], error: null };
    } catch (err: any) {
      console.error("Supabase getAuditLogs error:", err);
      return { data: null, error: err.message };
    }
  }

  async createAuditLog(
    log: AuditLog
  ): Promise<{ data: AuditLog | null; error: string | null }> {
    const client = this.getClient();
    if (!isSupabaseConfigured || !client) {
      return { data: null, error: "Supabase not configured" };
    }

    try {
      const payload = {
        id: log.id || `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        user_name: log.user_name,
        role: log.role,
        action: log.action,
        details: log.details,
        timestamp: log.timestamp || new Date().toISOString()
      };

      const { data, error } = await client
        .from("audit_logs")
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.warn("Supabase createAuditLog warning:", error.message);
        return { data: null, error: error.message };
      }
      return { data: data as AuditLog, error: null };
    } catch (err: any) {
      console.error("Supabase createAuditLog error:", err);
      return { data: null, error: err.message };
    }
  }

  // ==========================================
  // PROPERTY VIEWS
  // ==========================================

  async logPropertyView(
    customerId: string,
    propertyId: string
  ): Promise<{ success: boolean; error: string | null }> {
    const client = this.getClient();
    if (!isSupabaseConfigured || !client) {
      return { success: false, error: "Supabase not configured" };
    }

    try {
      const mappedCustId = toUuid(customerId) || customerId;
      const mappedPropId = toUuid(propertyId) || propertyId;

      // 1. Insert property view record
      const { error: viewErr } = await client.from("property_views").insert([
        {
          customer_id: mappedCustId,
          property_id: mappedPropId,
          viewed_at: new Date().toISOString()
        }
      ]);

      if (viewErr) {
        console.warn("View logging warning:", viewErr.message);
      }

      // 2. Increment property views_count via RPC or direct update
      try {
        await client.rpc("increment_property_views", { p_id: mappedPropId });
      } catch {}

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // ==========================================
  // REALTIME SUBSCRIPTIONS
  // ==========================================

  subscribeToChanges(table: string, onUpdate: () => void) {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      const channel = supabase
        .channel(`public:${table}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table },
          () => {
            onUpdate();
          }
        )
        .subscribe();

      return channel;
    } catch (err) {
      console.error(`Failed to subscribe to ${table}:`, err);
      return null;
    }
  }
}

export const supabaseService = new SupabaseService();
