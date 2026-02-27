import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '@env/environment';
import {
  ApiResponse, AuthResponse, LoginRequest, RegisterRequest, UserResponse
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly tokenKey = 'access_token';
  private readonly userKey = 'current_user';

  private currentUser = signal<UserResponse | null>(this.loadUser());

  user = computed(() => this.currentUser());

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, request)
      .pipe(tap(res => this.handleAuth(res.data)));
  }

  register(request: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, request)
      .pipe(tap(res => this.handleAuth(res.data)));
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private handleAuth(auth: AuthResponse): void {
    localStorage.setItem(this.tokenKey, auth.accessToken);
    localStorage.setItem(this.userKey, JSON.stringify(auth.user));
    this.currentUser.set(auth.user);
  }

  private loadUser(): UserResponse | null {
    const raw = localStorage.getItem(this.userKey);
    return raw ? JSON.parse(raw) : null;
  }
}
