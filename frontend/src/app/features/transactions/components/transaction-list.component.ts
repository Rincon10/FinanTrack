import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { TransactionService } from '@core/services/transaction.service';
import { BudgetService } from '@core/services/budget.service';
import { CategoryService } from '@core/services/category.service';
import {
  TransactionResponse, TransactionRequest, TransactionFilter,
  BudgetResponse, CategoryResponse
} from '@core/models/api.models';
import { CurrencyFormatPipe } from '@shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule, MatChipsModule,
    MatSnackBarModule, MatTooltipModule, TranslateModule, CurrencyFormatPipe
  ],
  template: `
    <div class="page-header">
      <h2>{{ 'TRANSACTIONS.TITLE' | translate }}</h2>
      <div class="header-actions">
        <button mat-stroked-button (click)="exportCsv()" [disabled]="!selectedBudgetId">
          <mat-icon>download</mat-icon> {{ 'TRANSACTIONS.EXPORT' | translate }}
        </button>
        <button mat-stroked-button (click)="fileInput.click()" [disabled]="!selectedBudgetId">
          <mat-icon>upload</mat-icon> {{ 'TRANSACTIONS.IMPORT' | translate }}
        </button>
        <input #fileInput type="file" accept=".csv" hidden (change)="importCsv($event)">
        <button mat-raised-button color="primary" (click)="showForm = !showForm">
          <mat-icon>add</mat-icon> {{ 'TRANSACTIONS.NEW' | translate }}
        </button>
      </div>
    </div>

    <!-- Search & Filters -->
    <mat-card class="filter-card">
      <div class="filter-row">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ 'TRANSACTIONS.SEARCH' | translate }}</mat-label>
          <input matInput [(ngModel)]="filter.search" (keyup.enter)="loadTransactions()">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ 'TRANSACTIONS.BUDGET' | translate }}</mat-label>
          <mat-select [(ngModel)]="selectedBudgetId" (selectionChange)="onBudgetChange()">
            <mat-option [value]="null">{{ 'COMMON.ALL' | translate }}</mat-option>
            <mat-option *ngFor="let b of budgets" [value]="b.id">{{ b.name }}</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ 'TRANSACTIONS.TYPE' | translate }}</mat-label>
          <mat-select [(ngModel)]="filter.type" (selectionChange)="loadTransactions()">
            <mat-option [value]="undefined">{{ 'COMMON.ALL' | translate }}</mat-option>
            <mat-option value="INCOME">{{ 'TRANSACTIONS.INCOME' | translate }}</mat-option>
            <mat-option value="EXPENSE">{{ 'TRANSACTIONS.EXPENSE' | translate }}</mat-option>
          </mat-select>
        </mat-form-field>
        <button mat-icon-button (click)="loadTransactions()" matTooltip="Buscar">
          <mat-icon>filter_list</mat-icon>
        </button>
      </div>
    </mat-card>

    <!-- Create form -->
    <mat-card *ngIf="showForm" class="form-card">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="transaction-form">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'TRANSACTIONS.DESCRIPTION' | translate }}</mat-label>
            <input matInput formControlName="description">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ 'TRANSACTIONS.AMOUNT' | translate }}</mat-label>
            <input matInput formControlName="amount" type="number">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ 'TRANSACTIONS.TYPE' | translate }}</mat-label>
            <mat-select formControlName="type">
              <mat-option value="INCOME">{{ 'TRANSACTIONS.INCOME' | translate }}</mat-option>
              <mat-option value="EXPENSE">{{ 'TRANSACTIONS.EXPENSE' | translate }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ 'TRANSACTIONS.DATE' | translate }}</mat-label>
            <input matInput [matDatepicker]="dp" formControlName="transactionDate">
            <mat-datepicker-toggle matSuffix [for]="dp"></mat-datepicker-toggle>
            <mat-datepicker #dp></mat-datepicker>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ 'TRANSACTIONS.BUDGET' | translate }}</mat-label>
            <mat-select formControlName="budgetId">
              <mat-option *ngFor="let b of budgets" [value]="b.id">{{ b.name }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ 'TRANSACTIONS.CATEGORY' | translate }}</mat-label>
            <mat-select formControlName="categoryId">
              <mat-option [value]="null">{{ 'COMMON.NONE' | translate }}</mat-option>
              <mat-option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-span">
            <mat-label>{{ 'TRANSACTIONS.NOTES' | translate }}</mat-label>
            <textarea matInput formControlName="notes" rows="2"></textarea>
          </mat-form-field>
          <div class="form-actions">
            <button mat-button type="button" (click)="cancelForm()">{{ 'COMMON.CANCEL' | translate }}</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
              {{ editingId ? ('COMMON.UPDATE' | translate) : ('COMMON.CREATE' | translate) }}
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>

    <!-- Table -->
    <mat-card>
      <table mat-table [dataSource]="dataSource" matSort class="full-width-table">
        <ng-container matColumnDef="transactionDate">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ 'TRANSACTIONS.DATE' | translate }}</th>
          <td mat-cell *matCellDef="let t">{{ t.transactionDate }}</td>
        </ng-container>
        <ng-container matColumnDef="description">
          <th mat-header-cell *matHeaderCellDef>{{ 'TRANSACTIONS.DESCRIPTION' | translate }}</th>
          <td mat-cell *matCellDef="let t">{{ t.description }}</td>
        </ng-container>
        <ng-container matColumnDef="amount">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ 'TRANSACTIONS.AMOUNT' | translate }}</th>
          <td mat-cell *matCellDef="let t"
              [class.positive]="t.type === 'INCOME'"
              [class.negative]="t.type === 'EXPENSE'">
            {{ t.type === 'INCOME' ? '+' : '-' }}{{ t.amount | currencyFormat }}
          </td>
        </ng-container>
        <ng-container matColumnDef="type">
          <th mat-header-cell *matHeaderCellDef>{{ 'TRANSACTIONS.TYPE' | translate }}</th>
          <td mat-cell *matCellDef="let t">
            <mat-chip [class]="t.type === 'INCOME' ? 'income-chip' : 'expense-chip'">
              {{ t.type === 'INCOME' ? ('TRANSACTIONS.INCOME' | translate) : ('TRANSACTIONS.EXPENSE' | translate) }}
            </mat-chip>
          </td>
        </ng-container>
        <ng-container matColumnDef="categoryName">
          <th mat-header-cell *matHeaderCellDef>{{ 'TRANSACTIONS.CATEGORY' | translate }}</th>
          <td mat-cell *matCellDef="let t">{{ t.categoryName || '-' }}</td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let t">
            <button mat-icon-button (click)="edit(t)"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button color="warn" (click)="delete(t.id)"><mat-icon>delete</mat-icon></button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
      <mat-paginator [pageSizeOptions]="[10, 20, 50]" [pageSize]="20"
                     (page)="onPageChange($event)" [length]="totalElements">
      </mat-paginator>
    </mat-card>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px; }
    .header-actions { display: flex; gap: 8px; }
    .filter-card { margin-bottom: 16px; padding: 8px 16px; }
    .filter-row { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
    .filter-field { flex: 1; min-width: 150px; }
    .form-card { margin-bottom: 16px; }
    .transaction-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
    .full-span { grid-column: 1 / -1; }
    .form-actions { grid-column: 1 / -1; display: flex; gap: 8px; justify-content: flex-end; }
    .positive { color: #4caf50; font-weight: 500; }
    .negative { color: #f44336; font-weight: 500; }
    .income-chip { background-color: #e8f5e9 !important; color: #2e7d32; }
    .expense-chip { background-color: #ffebee !important; color: #c62828; }
  `]
})
export class TransactionListComponent implements OnInit {
  transactions: TransactionResponse[] = [];
  budgets: BudgetResponse[] = [];
  categories: CategoryResponse[] = [];
  dataSource = new MatTableDataSource<TransactionResponse>();
  displayedColumns = ['transactionDate', 'description', 'amount', 'type', 'categoryName', 'actions'];
  totalElements = 0;
  currentPage = 0;
  pageSize = 20;
  filter: TransactionFilter = {};
  selectedBudgetId: number | null = null;
  showForm = false;
  editingId: number | null = null;
  form: FormGroup;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private transactionService: TransactionService,
    private budgetService: BudgetService,
    private categoryService: CategoryService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      description: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      type: ['EXPENSE', Validators.required],
      transactionDate: [new Date(), Validators.required],
      budgetId: [null, Validators.required],
      categoryId: [null],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadBudgets();
    this.loadCategories();
    this.loadTransactions();
  }

  loadBudgets(): void {
    this.budgetService.getAll(0, 100).subscribe(res => this.budgets = res.data.content);
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe(res => this.categories = res.data);
  }

  loadTransactions(): void {
    const f: TransactionFilter = { ...this.filter };
    if (this.selectedBudgetId) f.budgetId = this.selectedBudgetId;

    this.transactionService.getAll(f, this.currentPage, this.pageSize).subscribe(res => {
      this.transactions = res.data.content;
      this.totalElements = res.data.totalElements;
      this.dataSource.data = this.transactions;
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTransactions();
  }

  onBudgetChange(): void {
    this.filter.budgetId = this.selectedBudgetId || undefined;
    this.loadTransactions();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const val = this.form.value;
    const request: TransactionRequest = {
      ...val,
      transactionDate: this.formatDate(val.transactionDate)
    };

    const obs = this.editingId
      ? this.transactionService.update(this.editingId, request)
      : this.transactionService.create(request);

    obs.subscribe({
      next: () => {
        this.loadTransactions();
        this.cancelForm();
        this.snackBar.open('Transacción guardada', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error', 'Cerrar', { duration: 4000 });
      }
    });
  }

  edit(t: TransactionResponse): void {
    this.editingId = t.id;
    this.showForm = true;
    this.form.patchValue({
      description: t.description,
      amount: t.amount,
      type: t.type,
      transactionDate: new Date(t.transactionDate),
      budgetId: t.budgetId,
      categoryId: t.categoryId,
      notes: t.notes
    });
  }

  delete(id: number): void {
    this.transactionService.delete(id).subscribe(() => {
      this.loadTransactions();
      this.snackBar.open('Transacción eliminada', 'OK', { duration: 3000 });
    });
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.form.reset({ type: 'EXPENSE', transactionDate: new Date(), amount: 0 });
  }

  exportCsv(): void {
    if (!this.selectedBudgetId) return;
    this.transactionService.exportCsv(this.selectedBudgetId).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transacciones.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  importCsv(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.selectedBudgetId) return;
    this.transactionService.importCsv(this.selectedBudgetId, input.files[0]).subscribe({
      next: (res) => {
        this.loadTransactions();
        this.snackBar.open(`${res.data} transacciones importadas`, 'OK', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Error al importar CSV', 'Cerrar', { duration: 4000 });
      }
    });
  }

  private formatDate(date: Date | string): string {
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
  }
}
