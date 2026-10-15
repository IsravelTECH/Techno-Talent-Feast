/**
 * Techno Talent Feast 2026 - Central API Client
 * Connects frontend to Express + MongoDB Atlas backend
 */

const API_BASE = '/api';

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

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
    }

    return data;
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

  async getCategories() {
    return this.request<{ success: boolean; count: number; categories: any[] }>('/categories');
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
}

export const api = new ApiService();
export default api;
