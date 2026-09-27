// TillSync TypeScript Types
// Matches api-contract.md exactly

// ─── User ──────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'owner' | 'manager' | 'attendant';
  tenantId: string;
}

// ─── Till ──────────────────────────────────────────────

export interface Till {
  id: string;
  tillNumber: string;
  name: string;
  isActive: boolean;
  attendantCount?: number;
  attendants?: Attendant[];
  createdAt: string;
}

// ─── Attendant ─────────────────────────────────────────

export interface Attendant {
  id: string;
  name: string;
  phone: string;
  assignedAt?: string;
}

// ─── Notification ──────────────────────────────────────

export interface Notification {
  id: string;
  tillNumber: string;
  amount: number;
  currency: string;
  senderName?: string;
  senderPhone?: string;
  channel: 'sms' | 'whatsapp';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  createdAt: string;
}

// ─── Dashboard ─────────────────────────────────────────

export interface DashboardStats {
  totalTills: number;
  activeTills: number;
  totalAttendants: number;
  notificationsToday: number;
  notificationsThisWeek: number;
  notificationsThisMonth: number;
}

// ─── Billing ───────────────────────────────────────────

export interface Subscription {
  plan: 'trial' | 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'pending' | 'expired';
  price: number;
  currency: string;
  tillsAllowed: number;
  tillsUsed: number;
  smsUsed: number;
  smsAllowed: number;
  expiresAt: string;
}

export interface Invoice {
  id: string;
  plan: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  paidAt: string;
}

// ─── Referrals ─────────────────────────────────────────

export interface ReferralCode {
  code: string;
  link: string;
}

export interface ReferralStats {
  code: string;
  link: string;
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalCommission: number;
  currency: string;
}

// ─── API Response Wrappers ─────────────────────────────

export interface ApiResponse<T> {
  data: T;
}

export interface ApiListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

// ─── Request Bodies ────────────────────────────────────

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  phone: string;
  email?: string;
  password: string;
}

export interface AuthResponse {
  data: User;
  token: string;
}

export interface CreateTillRequest {
  tillNumber: string;
  name: string;
}

export interface UpdateTillRequest {
  name?: string;
  isActive?: boolean;
}

export interface CreateAttendantRequest {
  name: string;
  phone: string;
  password: string;
}

export interface AssignAttendantRequest {
  attendantId: string;
}

export interface SubscribeRequest {
  plan: 'trial' | 'basic' | 'pro' | 'enterprise';
  paymentMethod: 'momo';
  phone: string;
}

export interface SubscribeResponse {
  subscriptionId: string;
  plan: string;
  status: string;
  message: string;
}
