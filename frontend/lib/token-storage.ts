import { AUTH_CONFIG } from "@/config/constants";

class TokenStorage {
  private isBrowser = typeof window !== "undefined";

  setAccessToken(token: string): void {
    if (!this.isBrowser) return;
    localStorage.setItem(AUTH_CONFIG.ACCESS_TOKEN_KEY, token);
  }

  getAccessToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
  }

  removeAccessToken(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
  }

  clearAll(): void {
    if (!this.isBrowser) return;
    this.removeAccessToken();
  }
}

export const tokenStorage = new TokenStorage();
