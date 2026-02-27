import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DashboardService } from '@core/services/dashboard.service';
import { DashboardResponse } from '@core/models/api.models';
import { CurrencyFormatPipe } from '@shared/pipes/currency-format.pipe';
import {
  ApexChart, ApexNonAxisChartSeries, ApexAxisChartSeries,
  ApexXAxis, ApexDataLabels, ApexStroke, ApexYAxis,
  ApexPlotOptions, ApexFill, ApexLegend, ApexResponsive
} from 'ng-apexcharts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatProgressSpinnerModule,
    MatIconModule, TranslateModule, NgApexchartsModule, CurrencyFormatPipe
  ],
  template: `
    <div *ngIf="loading" class="loading-container">
      <mat-spinner></mat-spinner>
    </div>

    <div *ngIf="!loading && data" class="dashboard">
      <!-- KPI Area -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">{{ 'DASHBOARD.TOTAL_INCOME' | translate }}</div>
          <div class="kpi-value positive">{{ data.totalIncome | currencyFormat }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">{{ 'DASHBOARD.TOTAL_EXPENSES' | translate }}</div>
          <div class="kpi-value negative">{{ data.totalExpenses | currencyFormat }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">{{ 'DASHBOARD.BALANCE' | translate }}</div>
          <div class="kpi-value">{{ data.balance | currencyFormat }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">{{ 'DASHBOARD.MONTHLY_AVG' | translate }}</div>
          <div class="kpi-value">{{ data.monthlyAverageExpense | currencyFormat }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">{{ 'DASHBOARD.SAVINGS' | translate }}</div>
          <div class="kpi-value" [class.positive]="data.totalSavings > 0"
               [class.negative]="data.totalSavings < 0">
            {{ data.totalSavings | currencyFormat }}
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">{{ 'DASHBOARD.BUDGET_USAGE' | translate }}</div>
          <div class="kpi-value" [class.warning]="data.budgetUsagePercentage > 80"
               [class.negative]="data.budgetUsagePercentage > 100">
            {{ data.budgetUsagePercentage | number:'1.1-1' }}%
          </div>
          <div class="kpi-sub" [class.warning]="data.budgetUsagePercentage > 80"
               [class.negative]="data.budgetUsagePercentage > 100">
            {{ data.budgetUsagePercentage > 100 ? ('DASHBOARD.OVER_BUDGET' | translate) :
               data.budgetUsagePercentage > 80 ? ('DASHBOARD.NEAR_LIMIT' | translate) :
               ('DASHBOARD.ON_TRACK' | translate) }}
          </div>
        </div>
      </div>

      <!-- Budget Alert -->
      <div *ngIf="data.budgetUsagePercentage > 80" class="budget-alert"
           [class.warning]="data.budgetUsagePercentage <= 100"
           [class.danger]="data.budgetUsagePercentage > 100">
        <mat-icon>warning</mat-icon>
        <span *ngIf="data.budgetUsagePercentage > 100">
          {{ 'DASHBOARD.ALERT_EXCEEDED' | translate }}
        </span>
        <span *ngIf="data.budgetUsagePercentage <= 100">
          {{ 'DASHBOARD.ALERT_WARNING' | translate }}
        </span>
      </div>

      <!-- Charts -->
      <div class="charts-grid">
        <!-- Donut: Distribución por categoría -->
        <div class="chart-card">
          <h3>{{ 'DASHBOARD.CHART_CATEGORY_DIST' | translate }}</h3>
          <apx-chart
            [series]="donutSeries"
            [chart]="donutChart"
            [labels]="donutLabels"
            [responsive]="chartResponsive"
            [legend]="chartLegend">
          </apx-chart>
        </div>

        <!-- Barras: Presupuesto vs Gasto -->
        <div class="chart-card">
          <h3>{{ 'DASHBOARD.CHART_BUDGET_VS_ACTUAL' | translate }}</h3>
          <apx-chart
            [series]="barSeries"
            [chart]="barChart"
            [xaxis]="barXAxis"
            [plotOptions]="barPlotOptions"
            [dataLabels]="barDataLabels">
          </apx-chart>
        </div>

        <!-- Línea: Saldo a lo largo del tiempo -->
        <div class="chart-card">
          <h3>{{ 'DASHBOARD.CHART_BALANCE_HISTORY' | translate }}</h3>
          <apx-chart
            [series]="lineSeries"
            [chart]="lineChart"
            [xaxis]="lineXAxis"
            [stroke]="lineStroke"
            [dataLabels]="lineDataLabels">
          </apx-chart>
        </div>

        <!-- Apilado: Fijos vs Variables -->
        <div class="chart-card">
          <h3>{{ 'DASHBOARD.CHART_FIXED_VS_VARIABLE' | translate }}</h3>
          <apx-chart
            [series]="stackedSeries"
            [chart]="stackedChart"
            [xaxis]="stackedXAxis"
            [plotOptions]="stackedPlotOptions"
            [fill]="stackedFill">
          </apx-chart>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex; justify-content: center; align-items: center;
      min-height: 60vh;
    }
    .positive { color: #4caf50 !important; }
    .negative { color: #f44336 !important; }
    .warning  { color: #ff9800 !important; }
  `]
})
export class DashboardComponent implements OnInit {
  data: DashboardResponse | null = null;
  loading = true;

  // Donut chart
  donutSeries: ApexNonAxisChartSeries = [];
  donutLabels: string[] = [];
  donutChart: ApexChart = { type: 'donut', height: 350 };

  // Bar chart
  barSeries: ApexAxisChartSeries = [];
  barChart: ApexChart = { type: 'bar', height: 350 };
  barXAxis: ApexXAxis = { categories: [] };
  barPlotOptions: ApexPlotOptions = {
    bar: { horizontal: false, columnWidth: '55%' }
  };
  barDataLabels: ApexDataLabels = { enabled: false };

  // Line chart
  lineSeries: ApexAxisChartSeries = [];
  lineChart: ApexChart = { type: 'area', height: 350 };
  lineXAxis: ApexXAxis = { categories: [] };
  lineStroke: ApexStroke = { curve: 'smooth', width: 2 };
  lineDataLabels: ApexDataLabels = { enabled: false };

  // Stacked bar
  stackedSeries: ApexAxisChartSeries = [];
  stackedChart: ApexChart = { type: 'bar', height: 350, stacked: true };
  stackedXAxis: ApexXAxis = { categories: [] };
  stackedPlotOptions: ApexPlotOptions = {
    bar: { horizontal: false, columnWidth: '50%' }
  };
  stackedFill: ApexFill = { opacity: 1 };

  chartResponsive: ApexResponsive[] = [{
    breakpoint: 480,
    options: { chart: { width: 300 }, legend: { position: 'bottom' } }
  }];
  chartLegend: ApexLegend = { position: 'bottom' };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.dashboardService.getDashboard().subscribe({
      next: (res) => {
        this.data = res.data;
        this.buildCharts();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private buildCharts(): void {
    if (!this.data) return;

    // Donut
    this.donutSeries = this.data.categoryBreakdown.map(c => c.amount);
    this.donutLabels = this.data.categoryBreakdown.map(c => c.categoryName);

    // Bar: Budget vs Actual
    this.barSeries = [
      { name: 'Presupuestado', data: this.data.budgetVsActual.map(b => b.budgeted) },
      { name: 'Gastado', data: this.data.budgetVsActual.map(b => b.actual) }
    ];
    this.barXAxis = { categories: this.data.budgetVsActual.map(b => b.categoryName) };

    // Line: Balance history
    this.lineSeries = [{
      name: 'Saldo',
      data: this.data.balanceHistory.map(b => b.balance)
    }];
    this.lineXAxis = { categories: this.data.balanceHistory.map(b => b.date) };

    // Stacked: Fixed vs Variable
    this.stackedSeries = [
      { name: 'Gastos Fijos', data: this.data.fixedVsVariable.map(f => f.fixedExpenses) },
      { name: 'Gastos Variables', data: this.data.fixedVsVariable.map(f => f.variableExpenses) }
    ];
    this.stackedXAxis = { categories: this.data.fixedVsVariable.map(f => f.month) };
  }
}
