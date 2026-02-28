package com.budget.api.service;

import com.budget.api.dto.response.DashboardResponse;
import com.budget.api.entity.Budget;
import com.budget.api.enums.ExpenseType;
import com.budget.api.enums.TransactionType;
import com.budget.api.repository.BudgetRepository;
import com.budget.api.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboardMetrics(Long userId, LocalDate startDate, LocalDate endDate) {
        // Fetch active budgets first (needed for default date range and budgetVsActual)
        List<Budget> activeBudgets = budgetRepository.findActiveBudgetsByDate(userId, LocalDate.now());

        // Default dates from active budget period instead of just current month
        if (startDate == null) {
            startDate = activeBudgets.stream()
                    .map(Budget::getStartDate)
                    .min(LocalDate::compareTo)
                    .orElse(YearMonth.now().atDay(1));
        }
        if (endDate == null) {
            endDate = activeBudgets.stream()
                    .map(Budget::getEndDate)
                    .max(LocalDate::compareTo)
                    .orElse(YearMonth.now().atEndOfMonth());
        }

        BigDecimal totalIncome = transactionRepository.sumByUserIdAndTypeAndDateRange(
                userId, TransactionType.INCOME, startDate, endDate);
        BigDecimal totalExpenses = transactionRepository.sumByUserIdAndTypeAndDateRange(
                userId, TransactionType.EXPENSE, startDate, endDate);
        BigDecimal balance = totalIncome.subtract(totalExpenses);
        BigDecimal savings = totalIncome.subtract(totalExpenses);

        // Gasto promedio mensual (últimos 6 meses)
        LocalDate sixMonthsAgo = LocalDate.now().minusMonths(6);
        BigDecimal sixMonthExpenses = transactionRepository.sumByUserIdAndTypeAndDateRange(
                userId, TransactionType.EXPENSE, sixMonthsAgo, LocalDate.now());
        BigDecimal monthlyAverage = sixMonthExpenses.divide(BigDecimal.valueOf(6), 2, RoundingMode.HALF_UP);

        // Porcentaje de uso del presupuesto
        BigDecimal totalBudget = activeBudgets.stream()
                .map(Budget::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        double budgetUsage = totalBudget.compareTo(BigDecimal.ZERO) > 0
                ? totalExpenses.divide(totalBudget, 4, RoundingMode.HALF_UP)
                               .multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;

        // Desglose por categoría
        List<DashboardResponse.CategoryBreakdown> categoryBreakdown = buildCategoryBreakdown(
                userId, startDate, endDate, totalExpenses);

        // Presupuesto vs real
        List<DashboardResponse.BudgetVsActual> budgetVsActual = buildBudgetVsActual(activeBudgets);

        // Saldo a lo largo del tiempo
        List<DashboardResponse.BalanceOverTime> balanceHistory = buildBalanceHistory(
                userId, startDate, endDate);

        // Fijos vs variables
        List<DashboardResponse.FixedVsVariable> fixedVsVariable = buildFixedVsVariable(userId);

        // Ingresos vs gastos por mes
        List<DashboardResponse.IncomeVsExpense> incomeVsExpenses = buildIncomeVsExpenses(userId);

        return DashboardResponse.builder()
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .balance(balance)
                .monthlyAverageExpense(monthlyAverage)
                .totalSavings(savings)
                .budgetUsagePercentage(budgetUsage)
                .categoryBreakdown(categoryBreakdown)
                .budgetVsActual(budgetVsActual)
                .balanceHistory(balanceHistory)
                .fixedVsVariable(fixedVsVariable)
                .incomeVsExpenses(incomeVsExpenses)
                .build();
    }

    private List<DashboardResponse.CategoryBreakdown> buildCategoryBreakdown(
            Long userId, LocalDate start, LocalDate end, BigDecimal totalExpenses) {

        List<Object[]> results = transactionRepository.sumExpensesByCategory(userId, start, end);
        return results.stream()
                .map(row -> {
                    String categoryName = (String) row[0];
                    BigDecimal amount = (BigDecimal) row[1];
                    double pct = totalExpenses.compareTo(BigDecimal.ZERO) > 0
                            ? amount.divide(totalExpenses, 4, RoundingMode.HALF_UP)
                                    .multiply(BigDecimal.valueOf(100)).doubleValue()
                            : 0.0;
                    return DashboardResponse.CategoryBreakdown.builder()
                            .categoryName(categoryName != null ? categoryName : "Sin categoría")
                            .amount(amount)
                            .percentage(pct)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<DashboardResponse.BudgetVsActual> buildBudgetVsActual(List<Budget> activeBudgets) {
        return activeBudgets.stream()
                .map(budget -> {
                    BigDecimal actual = transactionRepository.sumByBudgetIdAndType(
                            budget.getId(), TransactionType.EXPENSE);
                    return DashboardResponse.BudgetVsActual.builder()
                            .categoryName(budget.getName())
                            .budgeted(budget.getTotalAmount())
                            .actual(actual)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<DashboardResponse.BalanceOverTime> buildBalanceHistory(
            Long userId, LocalDate start, LocalDate end) {

        List<Object[]> dailyChanges = transactionRepository.dailyBalanceChange(userId, start, end);
        List<DashboardResponse.BalanceOverTime> history = new ArrayList<>();
        BigDecimal runningBalance = BigDecimal.ZERO;

        for (Object[] row : dailyChanges) {
            LocalDate date = (LocalDate) row[0];
            BigDecimal change = (BigDecimal) row[1];
            runningBalance = runningBalance.add(change);
            history.add(DashboardResponse.BalanceOverTime.builder()
                    .date(date.toString())
                    .balance(runningBalance)
                    .build());
        }
        return history;
    }

    private List<DashboardResponse.IncomeVsExpense> buildIncomeVsExpenses(Long userId) {
        List<DashboardResponse.IncomeVsExpense> result = new ArrayList<>();
        LocalDate now = LocalDate.now();

        for (int i = 5; i >= 0; i--) {
            YearMonth month = YearMonth.from(now.minusMonths(i));
            LocalDate start = month.atDay(1);
            LocalDate end = month.atEndOfMonth();

            BigDecimal income = transactionRepository.sumByUserIdAndTypeAndDateRange(
                    userId, TransactionType.INCOME, start, end);
            BigDecimal expense = transactionRepository.sumByUserIdAndTypeAndDateRange(
                    userId, TransactionType.EXPENSE, start, end);

            result.add(DashboardResponse.IncomeVsExpense.builder()
                    .month(month.toString())
                    .income(income)
                    .expense(expense)
                    .build());
        }
        return result;
    }

    private List<DashboardResponse.FixedVsVariable> buildFixedVsVariable(Long userId) {
        List<DashboardResponse.FixedVsVariable> result = new ArrayList<>();
        LocalDate now = LocalDate.now();

        for (int i = 5; i >= 0; i--) {
            YearMonth month = YearMonth.from(now.minusMonths(i));
            LocalDate start = month.atDay(1);
            LocalDate end = month.atEndOfMonth();

            List<Object[]> byType = transactionRepository.sumExpensesByExpenseType(userId, start, end);

            BigDecimal fixed = BigDecimal.ZERO;
            BigDecimal variable = BigDecimal.ZERO;

            for (Object[] row : byType) {
                ExpenseType type = (ExpenseType) row[0];
                BigDecimal amount = (BigDecimal) row[1];
                if (type == ExpenseType.FIXED) {
                    fixed = amount;
                } else {
                    variable = amount;
                }
            }

            result.add(DashboardResponse.FixedVsVariable.builder()
                    .month(month.toString())
                    .fixedExpenses(fixed)
                    .variableExpenses(variable)
                    .build());
        }
        return result;
    }
}
