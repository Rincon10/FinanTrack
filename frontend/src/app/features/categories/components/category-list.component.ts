import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { CategoryService } from '@core/services/category.service';
import { CategoryResponse, CategoryRequest } from '@core/models/api.models';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatChipsModule, MatSnackBarModule, TranslateModule
  ],
  template: `
    <div class="page-header">
      <h2>{{ 'CATEGORIES.TITLE' | translate }}</h2>
      <button mat-raised-button color="primary" (click)="showForm = !showForm">
        <mat-icon>add</mat-icon> {{ 'CATEGORIES.NEW' | translate }}
      </button>
    </div>

    <mat-card *ngIf="showForm" class="form-card">
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="category-form">
        <mat-form-field appearance="outline">
          <mat-label>{{ 'CATEGORIES.NAME' | translate }}</mat-label>
          <input matInput formControlName="name">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'CATEGORIES.DESCRIPTION' | translate }}</mat-label>
          <input matInput formControlName="description">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'CATEGORIES.EXPENSE_TYPE' | translate }}</mat-label>
          <mat-select formControlName="expenseType">
            <mat-option value="FIXED">{{ 'CATEGORIES.FIXED' | translate }}</mat-option>
            <mat-option value="VARIABLE">{{ 'CATEGORIES.VARIABLE' | translate }}</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'CATEGORIES.ICON' | translate }}</mat-label>
          <input matInput formControlName="icon" placeholder="restaurant">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'CATEGORIES.COLOR' | translate }}</mat-label>
          <input matInput formControlName="color" type="color">
        </mat-form-field>
        <div class="form-actions">
          <button mat-button type="button" (click)="cancelForm()">{{ 'COMMON.CANCEL' | translate }}</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
            {{ editingId ? ('COMMON.UPDATE' | translate) : ('COMMON.CREATE' | translate) }}
          </button>
        </div>
      </form>
    </mat-card>

    <div class="category-grid">
      <mat-card *ngFor="let cat of categories" class="category-card"
                [style.border-left]="'4px solid ' + (cat.color || '#ccc')">
        <mat-card-header>
          <mat-icon mat-card-avatar>{{ cat.icon || 'label' }}</mat-icon>
          <mat-card-title>{{ cat.name }}</mat-card-title>
          <mat-card-subtitle>{{ cat.description }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <mat-chip-set>
            <mat-chip>{{ cat.expenseType === 'FIXED' ? ('CATEGORIES.FIXED' | translate) : ('CATEGORIES.VARIABLE' | translate) }}</mat-chip>
            <mat-chip *ngIf="cat.isDefault" color="accent">{{ 'CATEGORIES.DEFAULT' | translate }}</mat-chip>
          </mat-chip-set>
        </mat-card-content>
        <mat-card-actions align="end" *ngIf="!cat.isDefault">
          <button mat-icon-button (click)="edit(cat)"><mat-icon>edit</mat-icon></button>
          <button mat-icon-button color="warn" (click)="delete(cat.id)"><mat-icon>delete</mat-icon></button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .form-card { margin-bottom: 24px; padding: 16px; }
    .category-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
    .form-actions { grid-column: 1 / -1; display: flex; gap: 8px; justify-content: flex-end; }
    .category-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
    .category-card { border-radius: 8px; }
  `]
})
export class CategoryListComponent implements OnInit {
  categories: CategoryResponse[] = [];
  showForm = false;
  editingId: number | null = null;
  form: FormGroup;

  constructor(
    private categoryService: CategoryService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      expenseType: ['VARIABLE', Validators.required],
      icon: [''],
      color: ['#3f51b5']
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe(res => this.categories = res.data);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const request: CategoryRequest = this.form.value;

    const obs = this.editingId
      ? this.categoryService.update(this.editingId, request)
      : this.categoryService.create(request);

    obs.subscribe({
      next: () => {
        this.loadCategories();
        this.cancelForm();
        this.snackBar.open('Categoría guardada', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error', 'Cerrar', { duration: 4000 });
      }
    });
  }

  edit(cat: CategoryResponse): void {
    this.editingId = cat.id;
    this.showForm = true;
    this.form.patchValue(cat);
  }

  delete(id: number): void {
    this.categoryService.delete(id).subscribe(() => {
      this.loadCategories();
      this.snackBar.open('Categoría eliminada', 'OK', { duration: 3000 });
    });
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.form.reset({ expenseType: 'VARIABLE', color: '#3f51b5' });
  }
}
