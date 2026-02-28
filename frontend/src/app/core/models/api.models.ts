// === API Response ===
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// === Auth ===
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  preferredCurrency?: string;
  preferredLocale?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponse;
}

export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  preferredCurrency: string;
  preferredLocale: string;
}

// === Budget ===
export type BudgetPeriod = 'MONTHLY' | 'BIWEEKLY';

export interface BudgetRequest {
  name: string;
  totalAmount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  currency?: string;
}

export interface BudgetResponse {
  id: number;
  name: string;
  totalAmount: number;
  spentAmount: number;
  remainingAmount: number;
  usagePercentage: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  currency: string;
  active: boolean;
  createdAt: string;
}

// === Transaction ===
export type TransactionType = 'INCOME' | 'EXPENSE';

export interface TransactionRequest {
  description: string;
  amount: number;
  type: TransactionType;
  transactionDate: string;
  budgetId: number;
  categoryId?: number;
  notes?: string;
}

export interface TransactionResponse {
  id: number;
  description: string;
  amount: number;
  type: TransactionType;
  transactionDate: string;
  notes: string;
  categoryName: string;
  categoryId: number;
  budgetName: string;
  budgetId: number;
  createdAt: string;
}

export interface TransactionFilter {
  budgetId?: number;
  categoryId?: number;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// === Category ===
export type ExpenseType = 'FIXED' | 'VARIABLE';

export interface CategoryRequest {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  expenseType: ExpenseType;
}

export interface CategoryResponse {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  expenseType: ExpenseType;
  isDefault: boolean;
}

// === Dashboard ===
export interface DashboardResponse {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  monthlyAverageExpense: number;
  totalSavings: number;
  budgetUsagePercentage: number;
  categoryBreakdown: CategoryBreakdown[];
  budgetVsActual: BudgetVsActual[];
  balanceHistory: BalanceOverTime[];
  fixedVsVariable: FixedVsVariable[];
  incomeVsExpenses: IncomeVsExpense[];
}

export interface CategoryBreakdown {
  categoryName: string;
  color: string;
  amount: number;
  percentage: number;
}

export interface BudgetVsActual {
  categoryName: string;
  budgeted: number;
  actual: number;
}

export interface BalanceOverTime {
  date: string;
  balance: number;
}

export interface FixedVsVariable {
  month: string;
  fixedExpenses: number;
  variableExpenses: number;
}

export interface IncomeVsExpense {
  month: string;
  income: number;
  expense: number;
}
