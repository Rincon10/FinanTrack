import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/components/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/components/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/components/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'budgets',
        loadComponent: () => import('./features/budgets/components/budget-list.component').then(m => m.BudgetListComponent)
      },
      {
        path: 'transactions',
        loadComponent: () => import('./features/transactions/components/transaction-list.component').then(m => m.TransactionListComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/categories/components/category-list.component').then(m => m.CategoryListComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/components/settings.component').then(m => m.SettingsComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
