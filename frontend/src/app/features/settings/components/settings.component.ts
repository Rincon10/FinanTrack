import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from '@env/environment';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatFormFieldModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, TranslateModule
  ],
  template: `
    <h2>{{ 'SETTINGS.TITLE' | translate }}</h2>

    <mat-card class="settings-card">
      <mat-card-header>
        <mat-card-title>{{ 'SETTINGS.PREFERENCES' | translate }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="settings-form">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'SETTINGS.LANGUAGE' | translate }}</mat-label>
            <mat-select [(ngModel)]="selectedLocale">
              <mat-option value="es">Español</mat-option>
              <mat-option value="en">English</mat-option>
              <mat-option value="pt">Português</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'SETTINGS.CURRENCY' | translate }}</mat-label>
            <mat-select [(ngModel)]="selectedCurrency">
              <mat-option value="COP">COP - Peso Colombiano</mat-option>
              <mat-option value="USD">USD - Dólar Estadounidense</mat-option>
              <mat-option value="EUR">EUR - Euro</mat-option>
              <mat-option value="MXN">MXN - Peso Mexicano</mat-option>
              <mat-option value="ARS">ARS - Peso Argentino</mat-option>
              <mat-option value="BRL">BRL - Real Brasileño</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-raised-button color="primary" (click)="saveSettings()">
            <mat-icon>save</mat-icon> {{ 'SETTINGS.SAVE' | translate }}
          </button>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .settings-card { max-width: 600px; margin-top: 16px; padding: 16px; }
    .settings-form { display: flex; flex-direction: column; gap: 16px; }
    mat-form-field { width: 100%; }
  `]
})
export class SettingsComponent implements OnInit {
  selectedLocale = 'es';
  selectedCurrency = 'COP';

  constructor(
    private http: HttpClient,
    private translate: TranslateService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.selectedLocale = localStorage.getItem('locale') || 'es';
    this.selectedCurrency = localStorage.getItem('currency') || 'COP';
  }

  saveSettings(): void {
    // Save locale
    localStorage.setItem('locale', this.selectedLocale);
    localStorage.setItem('currency', this.selectedCurrency);
    this.translate.use(this.selectedLocale);

    // Sync to backend
    this.http.patch(`${environment.apiUrl}/users/me/settings`, {
      preferredCurrency: this.selectedCurrency,
      preferredLocale: this.selectedLocale
    }).subscribe({
      next: () => {
        this.snackBar.open(
          this.translate.instant('SETTINGS.SAVED'),
          'OK',
          { duration: 3000 }
        );
      },
      error: () => {
        this.snackBar.open('Error al guardar', 'Cerrar', { duration: 4000 });
      }
    });
  }
}
