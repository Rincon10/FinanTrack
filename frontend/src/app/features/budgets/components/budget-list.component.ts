import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule } from '@ngx-translate/core';
import { BudgetService } from '@core/services/budget.service';
import { BudgetResponse, BudgetRequest } from '@core/models/api.models';
import { CurrencyFormatPipe } from '@shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-budget-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule, MatProgressBarModule,
    MatSnackBarModule, MatChipsModule, TranslateModule, CurrencyFormatPipe
  ],
  template: `
    <div class="page-header">
      <h2>{{ 'BUDGETS.TITLE' | translate }}</h2>
      <button mat-raised-button color="primary" (click)="showForm = !showForm">
        <mat-icon>add</mat-icon> {{ 'BUDGETS.NEW' | translate }}
      </button>
    </div>

    <!-- Create/Edit form -->
    <mat-card *ngIf="showForm" class="form-card">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="budget-form">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'BUDGETS.NAME' | translate }}</mat-label>
            <input matInput formControlName="name">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'BUDGETS.TOTAL_AMOUNT' | translate }}</mat-label>
            <input matInput formControlName="totalAmount" type="number">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'BUDGETS.PERIOD' | translate }}</mat-label>
            <mat-select formControlName="period">
              <mat-option value="MONTHLY">{{ 'BUDGETS.MONTHLY' | translate }}</mat-option>
              <mat-option value="BIWEEKLY">{{ 'BUDGETS.BIWEEKLY' | translate }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'BUDGETS.START_DATE' | translate }}</mat-label>
            <input matInput [matDatepicker]="startPicker" formControlName="startDate">
            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'BUDGETS.END_DATE' | translate }}</mat-label>
            <input matInput [matDatepicker]="endPicker" formControlName="endDate">
            <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
          </mat-form-field>

          <div class="form-actions">
            <button mat-button type="button" (click)="cancelForm()">
              {{ 'COMMON.CANCEL' | translate }}
            </button>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
              {{ editingId ? ('COMMON.UPDATE' | translate) : ('COMMON.CREATE' | translate) }}
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>

    <!-- Budget cards -->
    <div class="budget-grid">
      <mat-card *ngFor="let budget of budgets" class="budget-card">
        <mat-card-header>
          <mat-card-title>{{ budget.name }}</mat-card-title>
          <mat-card-subtitle>
            <mat-chip-set>
              <mat-chip>{{ budget.period === 'MONTHLY' ? ('BUDGETS.MONTHLY' | translate) : ('BUDGETS.BIWEEKLY' | translate) }}</mat-chip>
            </mat-chip-set>
          </mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="budget-amounts">
            <div>
              <span class="label">{{ 'BUDGETS.TOTAL' | translate }}:</span>
              <span class="value">{{ budget.totalAmount | currencyFormat }}</span>
            </div>
            <div>
              <span class="label">{{ 'BUDGETS.SPENT' | translate }}:</span>
              <span class="value negative">{{ budget.spentAmount | currencyFormat }}</span>
            </div>
            <div>
              <span class="label">{{ 'BUDGETS.REMAINING' | translate }}:</span>
              <span class="value" [class.positive]="budget.remainingAmount > 0"
                    [class.negative]="budget.remainingAmount < 0">
                {{ budget.remainingAmount | currencyFormat }}
              </span>
            </div>
          </div>
          <mat-progress-bar
            [mode]="'determinate'"
            [value]="budget.usagePercentage"
            [color]="budget.usagePercentage > 90 ? 'warn' : 'primary'">
          </mat-progress-bar>
          <div class="usage-label">{{ budget.usagePercentage | number:'1.1-1' }}% {{ 'BUDGETS.USED' | translate }}</div>
          <div class="date-range">{{ budget.startDate }} — {{ budget.endDate }}</div>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-icon-button (click)="edit(budget)"><mat-icon>edit</mat-icon></button>
          <button mat-icon-button color="warn" (click)="delete(budget.id)"><mat-icon>delete</mat-icon></button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .form-card { margin-bottom: 24px; }
    .budget-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .form-actions { grid-column: 1 / -1; display: flex; gap: 8px; justify-content: flex-end; }
    .budget-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; }
    .budget-card { border-radius: 12px; }
    .budget-amounts { margin: 16px 0; }
    .budget-amounts > div { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .label { color: #666; }
    .value { font-weight: 500; }
    .positive { color: #4caf50; }
    .negative { color: #f44336; }
    .usage-label { text-align: right; font-size: 12px; color: #666; margin-top: 4px; }
    .date-range { font-size: 12px; color: #999; margin-top: 8px; }
  `]
})
export class BudgetListComponent implements OnInit {
  budgets: BudgetResponse[] = [];
  showForm = false;
  editingId: number | null = null;
  form: FormGroup;

  constructor(
    private budgetService: BudgetService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      totalAmount: [0, [Validators.required, Validators.min(1)]],
      period: ['MONTHLY', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadBudgets();
  }

  loadBudgets(): void {
    this.budgetService.getAll().subscribe(res => {
      this.budgets = res.data.content;
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const request: BudgetRequest = {
      ...this.form.value,
      startDate: this.formatDate(this.form.value.startDate),
      endDate: this.formatDate(this.form.value.endDate)
    };

    const obs = this.editingId
      ? this.budgetService.update(this.editingId, request)
      : this.budgetService.create(request);

    obs.subscribe({
      next: () => {
        this.loadBudgets();
        this.cancelForm();
        this.snackBar.open('Presupuesto guardado', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error', 'Cerrar', { duration: 4000 });
      }
    });
  }

  edit(budget: BudgetResponse): void {
    this.editingId = budget.id;
    this.showForm = true;
    this.form.patchValue({
      name: budget.name,
      totalAmount: budget.totalAmount,
      period: budget.period,
      startDate: new Date(budget.startDate),
      endDate: new Date(budget.endDate)
    });
  }

  delete(id: number): void {
    this.budgetService.delete(id).subscribe(() => {
      this.loadBudgets();
      this.snackBar.open('Presupuesto eliminado', 'OK', { duration: 3000 });
    });
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.form.reset({ period: 'MONTHLY', totalAmount: 0 });
  }

  private formatDate(date: Date | string): string {
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
  }
}
