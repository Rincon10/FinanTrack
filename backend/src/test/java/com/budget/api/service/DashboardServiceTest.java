package com.budget.api.service;

import com.budget.api.dto.response.DashboardResponse;
import com.budget.api.entity.Budget;
import com.budget.api.enums.BudgetPeriod;
import com.budget.api.enums.TransactionType;
import com.budget.api.repository.BudgetRepository;
import com.budget.api.repository.TransactionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private BudgetRepository budgetRepository;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    @DisplayName("Debe calcular métricas del dashboard correctamente")
    void shouldCalculateDashboardMetrics() {
        LocalDate start = LocalDate.of(2026, 2, 1);
        LocalDate end = LocalDate.of(2026, 2, 28);

        when(transactionRepository.sumByUserIdAndTypeAndDateRange(eq(1L), eq(TransactionType.INCOME), any(), any()))
                .thenReturn(new BigDecimal("5000000"));
        when(transactionRepository.sumByUserIdAndTypeAndDateRange(eq(1L), eq(TransactionType.EXPENSE), any(), any()))
                .thenReturn(new BigDecimal("3000000"));
        when(budgetRepository.findActiveBudgetsByDate(eq(1L), any()))
                .thenReturn(List.of(
                        Budget.builder()
                                .name("Febrero")
                                .totalAmount(new BigDecimal("4000000"))
                                .period(BudgetPeriod.MONTHLY)
                                .startDate(start)
                                .endDate(end)
                                .build()
                ));
        when(transactionRepository.sumExpensesByCategory(eq(1L), any(), any()))
                .thenReturn(Collections.emptyList());
        when(transactionRepository.sumByBudgetIdAndType(any(), eq(TransactionType.EXPENSE)))
                .thenReturn(new BigDecimal("3000000"));
        when(transactionRepository.dailyBalanceChange(eq(1L), any(), any()))
                .thenReturn(Collections.emptyList());
        when(transactionRepository.sumExpensesByExpenseType(eq(1L), any(), any()))
                .thenReturn(Collections.emptyList());

        DashboardResponse result = dashboardService.getDashboardMetrics(1L, start, end);

        assertThat(result.getTotalIncome()).isEqualTo(new BigDecimal("5000000"));
        assertThat(result.getTotalExpenses()).isEqualTo(new BigDecimal("3000000"));
        assertThat(result.getBalance()).isEqualTo(new BigDecimal("2000000"));
        assertThat(result.getBudgetUsagePercentage()).isGreaterThan(0);
    }

    @Test
    @DisplayName("Debe manejar caso sin presupuestos activos")
    void shouldHandleNoBudgets() {
        when(transactionRepository.sumByUserIdAndTypeAndDateRange(eq(1L), any(), any(), any()))
                .thenReturn(BigDecimal.ZERO);
        when(budgetRepository.findActiveBudgetsByDate(eq(1L), any()))
                .thenReturn(Collections.emptyList());
        when(transactionRepository.sumExpensesByCategory(eq(1L), any(), any()))
                .thenReturn(Collections.emptyList());
        when(transactionRepository.dailyBalanceChange(eq(1L), any(), any()))
                .thenReturn(Collections.emptyList());
        when(transactionRepository.sumExpensesByExpenseType(eq(1L), any(), any()))
                .thenReturn(Collections.emptyList());

        DashboardResponse result = dashboardService.getDashboardMetrics(1L, null, null);

        assertThat(result.getBudgetUsagePercentage()).isEqualTo(0.0);
        assertThat(result.getBalance()).isEqualTo(BigDecimal.ZERO);
    }
}
