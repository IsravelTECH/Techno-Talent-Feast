/**
 * Techno Talent Fest 2026 - Central API Client
 * Connects frontend to Express + MongoDB Atlas backend
 */

const API_BASE = (import.meta.env.VITE_API_URL as string) || '/api';

export interface LoginResponse {
  success: boolean;
  user: {
    id: string;
    _id?: string;
    name: string;
    email: string;
    role: 'admin' | 'judge';
    judgeId?: string;
    avatar?: string;
    title?: string;
    organization?: string;
    phone?: string;
    specialization?: string;
    assignedCategories?: number[];
    assignedCategoryNames?: string[];
    assignedHall?: string;
    assignedSlot?: string;
    status?: string;
  };
}

export interface SubmitEvaluationPayload {
  teamId: string;
  criterionScores: {
    'crit-tech': number;
    'crit-innov': number;
    'crit-design': number;
    'crit-demo': number;
    'crit-doc': number;
  };
  judgeRemarks?: string;
  judgeId?: string;
  judgeName?: string;
  judgeEmail?: string;
}

export interface CreateJudgePayload {
  name: string;
  email: string;
  password?: string;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      ...options
    });

    const contentType = res.headers.get('content-type') || '';
    let data: any;

    if (contentType.includes('application/json')) {
      try {
        data = await res.json();
      } catch (e: any) {
        throw new Error(`Invalid JSON received from server: ${e?.message || 'Unexpected end of JSON'}`);
      }
    } else {
      const text = await res.text();
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}: ${text.slice(0, 150) || res.statusText}`);
      }
      data = text;
    }

    if (!res.ok) {
      throw new Error(data?.error || data?.message || `Request failed with status ${res.status}`);
    }

    return data as T;
  }

  // Authentication
  async login(email: string, password: string): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async updateProfile(id: string, payload: { name?: string; email?: string; phone?: string; role?: string }) {
    return this.request<{ success: boolean; message: string; user: any }>(`/auth/profile/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async changePassword(id: string, payload: { currentPassword?: string; newPassword: string }) {
    return this.request<{ success: boolean; message: string }>(`/auth/change-password/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  // Teams & Scoring
  async lookupTeam(teamId: string) {
    return this.request<{ success: boolean; team: any }>(`/teams/lookup/${encodeURIComponent(teamId)}`);
  }

  async getTeams(params?: { category?: string | number; status?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', String(params.category));
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ success: boolean; count: number; teams: any[] }>(`/teams${queryString}`);
  }

  async submitEvaluation(payload: SubmitEvaluationPayload) {
    return this.request<{ success: boolean; message: string; team: any; activity: any }>('/evaluations/submit', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async createTeam(payload: any) {
    return this.request<{ success: boolean; team: any }>('/teams', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async updateTeam(id: string, payload: any) {
    return this.request<{ success: boolean; team: any }>(`/teams/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deleteTeam(id: string) {
    return this.request<{ success: boolean; message: string }>(`/teams/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  }

  async bulkCreateTeams(teams: any[]) {
    return this.request<{ success: boolean; count: number; teams: any[]; errors?: any[]; message?: string }>('/teams/bulk', {
      method: 'POST',
      body: JSON.stringify({ teams })
    });
  }

  // Judges (Admin feature)
  async getJudges() {
    return this.request<{ success: boolean; count: number; judges: any[] }>('/judges');
  }

  async createJudge(payload: CreateJudgePayload) {
    return this.request<{ success: boolean; message: string; judge: any }>('/judges', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async bulkCreateJudges(judges: any[]) {
    return this.request<{ success: boolean; count: number; judges: any[]; errors?: any[]; message?: string }>('/judges/bulk', {
      method: 'POST',
      body: JSON.stringify({ judges })
    });
  }

  async updateJudge(id: string, payload: { name?: string; email?: string; password?: string; status?: string }) {
    return this.request<{ success: boolean; judge: any }>(`/judges/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deleteJudge(id: string) {
    return this.request<{ success: boolean; message: string }>(`/judges/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  }

  // Schools, Categories, Projects
  async getSchools() {
    return this.request<{ success: boolean; count: number; schools: any[] }>('/schools');
  }

  async createSchool(payload: any) {
    return this.request<{ success: boolean; school: any }>('/schools', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async updateSchool(id: string, payload: any) {
    return this.request<{ success: boolean; school: any }>(`/schools/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deleteSchool(id: string) {
    return this.request<{ success: boolean; message: string }>(`/schools/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  }

  async getCategories() {
    return this.request<{ success: boolean; count: number; categories: any[] }>('/categories');
  }

  async createCategory(payload: any) {
    return this.request<{ success: boolean; category: any }>('/categories', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async updateCategory(id: string, payload: any) {
    return this.request<{ success: boolean; category: any }>(`/categories/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deleteCategory(id: string) {
    return this.request<{ success: boolean; message: string }>(`/categories/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  }

  // Dashboard Stats & Activities
  async getDashboardStats() {
    return this.request<{
      success: boolean;
      stats: {
        totalTeams: number;
        completedEvaluations: number;
        pendingEvaluations: number;
        scoringProgress: number;
        totalSchools: number;
        totalJudges: number;
        averageScore: number;
      };
      topTeams: any[];
      recentActivities: any[];
    }>('/dashboard/stats');
  }

  // Notifications API
  async getNotifications() {
    return this.request<{ success: boolean; count: number; notifications: any[] }>('/notifications');
  }

  async markNotificationRead(id: string) {
    return this.request<{ success: boolean; message: string; notification: any }>(`/notifications/${encodeURIComponent(id)}/read`, {
      method: 'PATCH'
    });
  }

  async markAllNotificationsRead() {
    return this.request<{ success: boolean; message: string; updatedCount: number }>('/notifications/mark-all-read', {
      method: 'PATCH'
    });
  }

  async createNotification(payload: { title: string; message: string; type?: string; actionLink?: string; recipientRole?: string }) {
    return this.request<{ success: boolean; message: string; notification: any }>('/notifications', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async deleteNotification(id: string) {
    return this.request<{ success: boolean; message: string }>(`/notifications/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  }

  // Score Edit Requests API
  async requestScoreEdit(payload: { teamId: string; judgeId?: string; judgeName?: string; reason: string }) {
    return this.request<{ success: boolean; message: string; team: any; notification?: any }>('/evaluations/request-edit', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getScoreEditRequests() {
    return this.request<{ success: boolean; count: number; requests: any[] }>('/evaluations/requests');
  }

  async respondToScoreEditRequest(teamId: string, payload: { action: 'APPROVE' | 'REJECT'; remarks?: string; adminName?: string }) {
    return this.request<{ success: boolean; message: string; team: any }>(`/evaluations/requests/${encodeURIComponent(teamId)}/respond`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  }

  // Tie-Break Alerts API
  async sendTieBreakAlert(payload: { teamId: string; judgeId?: string; judgeName?: string; message?: string; adminName?: string }) {
    return this.request<{ success: boolean; message: string; team: any; notification?: any }>('/evaluations/send-tie-alert', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
}

export const api = new ApiService();
export default api;
