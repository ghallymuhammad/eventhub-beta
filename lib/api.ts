'use client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface ApiResponse<T = any> {
  status: 'success' | 'fail' | 'error';
  data?: T;
  message?: string;
  token?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ORGANIZER' | 'ADMIN';
  referralCode: string;
  createdAt: string;
}

export interface LoginData {
  user: User;
  token: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    // Get token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<LoginData> {
    const response = await this.request<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return {
      user: response.data!.user,
      token: response.token!,
    };
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role?: 'USER' | 'ORGANIZER';
    referralCode?: string;
  }): Promise<LoginData> {
    const response = await this.request<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return {
      user: response.data!.user,
      token: response.token!,
    };
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', {
      method: 'POST',
    });
    this.clearToken();
  }

  async getMe(): Promise<User> {
    const response = await this.request<{ user: User }>('/auth/me');
    return response.data!.user;
  }

  // Event methods
  async getEvents(params?: URLSearchParams): Promise<any> {
    const query = params ? `?${params.toString()}` : '';
    const response = await this.request(`/events${query}`);
    return response.data;
  }

  async getEvent(id: string): Promise<any> {
    const response = await this.request(`/events/${id}`);
    return response.data;
  }

  async createEvent(eventData: any): Promise<any> {
    const response = await this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
    return response.data;
  }

  async updateEvent(id: string, eventData: any): Promise<any> {
    const response = await this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
    return response.data;
  }

  async deleteEvent(id: string): Promise<void> {
    await this.request(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  // Transaction methods
  async createTransaction(transactionData: any): Promise<any> {
    const response = await this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
    return response.data;
  }

  async getTransactions(): Promise<any> {
    const response = await this.request('/transactions');
    return response.data;
  }

  async getTransaction(id: string): Promise<any> {
    const response = await this.request(`/transactions/${id}`);
    return response.data;
  }

  async updateTransactionStatus(id: string, status: string): Promise<any> {
    const response = await this.request(`/transactions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return response.data;
  }

  async uploadPaymentProof(id: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('paymentProof', file);

    const response = await this.request(`/transactions/${id}/payment-proof`, {
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type header to let browser set it for FormData
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    });
    return response.data;
  }

  // User methods
  async getUserProfile(): Promise<any> {
    const response = await this.request('/users/profile');
    return response.data;
  }

  async updateUserProfile(profileData: any): Promise<any> {
    const response = await this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    return response.data;
  }

  async getUserPoints(): Promise<any> {
    const response = await this.request('/users/points');
    return response.data;
  }

  async getUserCoupons(): Promise<any> {
    const response = await this.request('/users/coupons');
    return response.data;
  }

  // Organizer methods
  async getOrganizerStats(): Promise<any> {
    const response = await this.request('/organizer/stats');
    return response.data;
  }

  async getOrganizerEvents(): Promise<any> {
    const response = await this.request('/organizer/events');
    return response.data;
  }

  async getOrganizerTransactions(): Promise<any> {
    const response = await this.request('/organizer/transactions');
    return response.data;
  }

  // Utility methods
  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const apiClient = new ApiClient();

// Export for use in components
export default apiClient;
