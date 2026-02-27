import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from '@core/services/dashboard.service';
import { of } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let dashboardService: jasmine.SpyObj<DashboardService>;

  const mockDashboard = {
    success: true,
    data: {
      totalIncome: 5000000,
      totalExpenses: 3000000,
      balance: 2000000,
      monthlyAverageExpense: 3100000,
      totalSavings: 2000000,
      budgetUsagePercentage: 75.0,
      categoryBreakdown: [
        { categoryName: 'Alimentación', color: '#ff6384', amount: 1000000, percentage: 33.33 }
      ],
      budgetVsActual: [
        { categoryName: 'Feb 2026', budgeted: 4000000, actual: 3000000 }
      ],
      balanceHistory: [
        { date: '2026-02-01', balance: 5000000 },
        { date: '2026-02-15', balance: 2000000 }
      ],
      fixedVsVariable: [
        { month: '2026-02', fixedExpenses: 1800000, variableExpenses: 1200000 }
      ]
    }
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('DashboardService', ['getDashboard']);
    spy.getDashboard.and.returnValue(of(mockDashboard));

    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        HttpClientTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: DashboardService, useValue: spy }
      ]
    }).compileComponents();

    dashboardService = TestBed.inject(DashboardService) as jasmine.SpyObj<DashboardService>;
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard data on init', () => {
    expect(dashboardService.getDashboard).toHaveBeenCalled();
    expect(component.data).toBeTruthy();
    expect(component.data!.totalIncome).toBe(5000000);
  });

  it('should build chart data', () => {
    expect(component.donutSeries.length).toBe(1);
    expect(component.donutLabels[0]).toBe('Alimentación');
    expect(component.barSeries.length).toBe(2);
    expect(component.lineSeries.length).toBe(1);
    expect(component.stackedSeries.length).toBe(2);
  });

  it('should show no loading after data loads', () => {
    expect(component.loading).toBeFalse();
  });
});
