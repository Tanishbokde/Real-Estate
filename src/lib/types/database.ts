export type UserRole = "admin" | "agent" | "customer";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface AgentBroker {
  id: string;
  user_id?: string;
  name: string;
  phone: string;
  email: string;
  agency: string;
  rating: number;
  area_specialization: string;
  license_no?: string;
  bio?: string;
  total_deals: number;
  is_active: boolean;
  created_at: string;
}

export interface PropertyLocation {
  id: string;
  name: string;
  zone: string;
  pincode: string;
  popular_landmarks: string[];
  latitude: number;
  longitude: number;
  is_active: boolean;
}

export interface Customer {
  id: string;
  user_id?: string;
  name: string;
  phone: string;
  email: string;
  preferences?: {
    budget_min?: number;
    budget_max?: number;
    preferred_localities?: string[];
    bhk?: number[];
    listing_type?: "buy" | "rent";
  };
  status: "active" | "inactive" | "archived";
  created_at: string;
}

export type PropertyType = "residential" | "commercial";
export type PropertyCategory = "apartment" | "villa" | "plot" | "land";
export type ListingType = "buy" | "rent";
export type PropertyStatus = "available" | "sold" | "pending" | "rented";

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  category: PropertyCategory;
  listing_type: ListingType;
  bhk: number | null;
  price: number;
  price_range: string;
  area_sqft: number;
  status: PropertyStatus;
  locality: string;
  address: string;
  latitude: number;
  longitude: number;
  agent_id: string;
  images: string[];
  features: string[];
  is_featured: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  customer_id: string;
  property_id: string;
  created_at: string;
}

export type InquiryStatus = "new" | "in_progress" | "contacted" | "resolved" | "closed";

export interface Inquiry {
  id: string;
  customer_id: string;
  property_id: string;
  agent_id?: string;
  message: string;
  status: InquiryStatus;
  agent_reply?: string;
  created_at: string;
  updated_at: string;
}

export type VisitStatus = "pending" | "confirmed" | "completed" | "cancelled" | "rejected";

export interface VisitRequest {
  id: string;
  customer_id: string;
  property_id: string;
  agent_id?: string;
  scheduled_date: string;
  time_slot: string;
  status: VisitStatus;
  notes?: string;
  agent_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyView {
  id: string;
  customer_id: string;
  property_id: string;
  viewed_at: string;
}

export type FollowUpStatus = "pending" | "contacted" | "dismissed" | "converted";

export interface FollowUp {
  id: string;
  customer_id: string;
  property_id: string;
  triggered_at: string;
  status: FollowUpStatus;
  notified_admin: boolean;
  notified_customer: boolean;
  resolution_notes?: string;
  resolved_at?: string;
}

export type NotificationType = "follow_up" | "inquiry" | "visit_request" | "system" | "deal";

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  message: string;
  read_status: boolean;
  link?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_name: string;
  role: UserRole;
  action: string;
  details: string;
  timestamp: string;
}
