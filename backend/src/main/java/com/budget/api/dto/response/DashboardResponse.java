package com.budget.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class DashboardResponse {
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal balance;
    private BigDecimal monthlyAverageExpense;
    private BigDecimal totalSavings;
    private Double budgetUsagePercentage;
    private List<CategoryBreakdown> categoryBreakdown;
    private List<BudgetVsActual> budgetVsActual;
    private List<BalanceOverTime> balanceHistory;
    private List<FixedVsVariable> fixedVsVariable;
    private List<IncomeVsExpense> incomeVsExpenses;

    @Data
    @Builder
    @AllArgsConstructor
    public static class CategoryBreakdown {
        private String categoryName;
        private String color;
        private BigDecimal amount;
        private Double percentage;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class BudgetVsActual {
        private String categoryName;
        private BigDecimal budgeted;
        private BigDecimal actual;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class BalanceOverTime {
        private String date;
        private BigDecimal balance;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class FixedVsVariable {
        private String month;
        private BigDecimal fixedExpenses;
        private BigDecimal variableExpenses;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class IncomeVsExpense {
        private String month;
        private BigDecimal income;
        private BigDecimal expense;
    }
}
