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

  private currentUser = signal<UserResponse | null>({
    id: 1,
    email: 'default@budget.app',
    fullName: 'Usuario por Defecto',
    preferredCurrency: 'COP',
    preferredLocale: 'es'
  });

  user = computed(() => this.currentUser());

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, request);
  }

  register(request: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, request);
  }

  logout(): void {
    // No-op: sin autenticación
  }

  getToken(): string | null {
    return null;
  }

  isAuthenticated(): boolean {
    return true;
  }
}
