import { Injectable } from '@angular/core';

export interface AuthUser {
  id: number | string;
  email: string;
  role?: string;
  workspace_id?: number | string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone_number?: string | null;
  staff_name?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly storageKey = 'wedflow_auth';

  setSession(token: string, user: AuthUser): void {
    localStorage.setItem(this.storageKey, JSON.stringify({ token, user }));
  }

  getSession(): { token: string; user: AuthUser } | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as { token: string; user: AuthUser };
    } catch {
      this.clearSession();
      return null;
    }
  }

  getToken(): string | null {
    return this.getSession()?.token ?? null;
  }

  getUser(): AuthUser | null {
    return this.getSession()?.user ?? null;
  }

  isAuthenticated(): boolean {
    const session = this.getSession();
    if (!session?.token) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(session.token.split('.')[1] || ''));
      return typeof payload?.exp === 'number' ? payload.exp * 1000 > Date.now() : true;
    } catch {
      this.clearSession();
      return false;
    }
  }

  clearSession(): void {
    localStorage.removeItem(this.storageKey);
  }
}
