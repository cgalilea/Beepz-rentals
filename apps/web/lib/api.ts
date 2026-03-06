const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Request failed: ${res.status}`);
    }

    return res.json();
  }

  async login(email: string, password: string) {
    return this.request<{
      token: string;
      user: { id: string; email: string; role: string };
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe() {
    return this.request<{
      user: { userId: string; email: string; role: string };
    }>("/auth/me");
  }

  async healthCheck() {
    return this.request<{ status: string; timestamp: string }>("/health");
  }

  // Investors
  async listInvestors() {
    return this.request<Investor[]>("/investors");
  }

  async createInvestor(data: { name: string; email: string; phone: string }) {
    return this.request<Investor>("/investors", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateInvestor(id: string, data: { name?: string; email?: string; phone?: string }) {
    return this.request<Investor>(`/investors/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteInvestor(id: string) {
    return this.request<void>(`/investors/${id}`, { method: "DELETE" });
  }

  // Vehicles
  async listVehicles() {
    return this.request<Vehicle[]>("/vehicles");
  }

  async getVehicle(id: string) {
    return this.request<Vehicle>(`/vehicles/${id}`);
  }

  async createVehicle(data: CreateVehicleInput) {
    return this.request<Vehicle>("/vehicles", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateVehicle(id: string, data: UpdateVehicleInput) {
    return this.request<Vehicle>(`/vehicles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteVehicle(id: string) {
    return this.request<void>(`/vehicles/${id}`, { method: "DELETE" });
  }
}

export interface Investor {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface ProfitShare {
  id: string;
  participantType: "BEEPZ" | "INVESTOR";
  investorId: string | null;
  percentage: string;
  investor: Investor | null;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  status: "AVAILABLE" | "RENTED" | "MAINTENANCE";
  createdAt: string;
  profitShares: ProfitShare[];
}

export interface ProfitShareInput {
  participantType: "BEEPZ" | "INVESTOR";
  investorId?: string | null;
  percentage: number;
}

export interface CreateVehicleInput {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  profitShares: ProfitShareInput[];
}

export interface UpdateVehicleInput {
  make?: string;
  model?: string;
  year?: number;
  licensePlate?: string;
  vin?: string;
  status?: string;
  profitShares?: ProfitShareInput[];
}

export const api = new ApiClient();
