import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse, BudgetRequest, BudgetResponse, PageResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private readonly apiUrl = `${environment.apiUrl}/budgets`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 10): Observable<ApiResponse<PageResponse<BudgetResponse>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<BudgetResponse>>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<ApiResponse<BudgetResponse>> {
    return this.http.get<ApiResponse<BudgetResponse>>(`${this.apiUrl}/${id}`);
  }

  create(request: BudgetRequest): Observable<ApiResponse<BudgetResponse>> {
    return this.http.post<ApiResponse<BudgetResponse>>(this.apiUrl, request);
  }

  update(id: number, request: BudgetRequest): Observable<ApiResponse<BudgetResponse>> {
    return this.http.put<ApiResponse<BudgetResponse>>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
