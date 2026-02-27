import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  ApiResponse, TransactionRequest, TransactionResponse,
  TransactionFilter, PageResponse
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly apiUrl = `${environment.apiUrl}/transactions`;

  constructor(private http: HttpClient) {}

  getAll(
    filter: TransactionFilter = {},
    page = 0,
    size = 20,
    sort = 'transactionDate,desc'
  ): Observable<ApiResponse<PageResponse<TransactionResponse>>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);

    if (filter.budgetId) params = params.set('budgetId', filter.budgetId);
    if (filter.categoryId) params = params.set('categoryId', filter.categoryId);
    if (filter.type) params = params.set('type', filter.type);
    if (filter.startDate) params = params.set('startDate', filter.startDate);
    if (filter.endDate) params = params.set('endDate', filter.endDate);
    if (filter.search) params = params.set('search', filter.search);

    return this.http.get<ApiResponse<PageResponse<TransactionResponse>>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<ApiResponse<TransactionResponse>> {
    return this.http.get<ApiResponse<TransactionResponse>>(`${this.apiUrl}/${id}`);
  }

  create(request: TransactionRequest): Observable<ApiResponse<TransactionResponse>> {
    return this.http.post<ApiResponse<TransactionResponse>>(this.apiUrl, request);
  }

  update(id: number, request: TransactionRequest): Observable<ApiResponse<TransactionResponse>> {
    return this.http.put<ApiResponse<TransactionResponse>>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  exportCsv(budgetId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/${budgetId}`, { responseType: 'blob' });
  }

  importCsv(budgetId: number, file: File): Observable<ApiResponse<number>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/import/${budgetId}`, formData);
  }
}
