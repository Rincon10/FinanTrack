package com.budget.api.service;

import com.budget.api.dto.request.BudgetRequest;
import com.budget.api.dto.response.BudgetResponse;
import com.budget.api.entity.Budget;
import com.budget.api.entity.User;
import com.budget.api.enums.BudgetPeriod;
import com.budget.api.enums.TransactionType;
import com.budget.api.exception.ResourceNotFoundException;
import com.budget.api.mapper.BudgetMapper;
import com.budget.api.repository.BudgetRepository;
import com.budget.api.repository.TransactionRepository;
import com.budget.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetServiceTest {

    @Mock
    private BudgetRepository budgetRepository;
    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private BudgetMapper budgetMapper;

    @InjectMocks
    private BudgetService budgetService;

    private User testUser;
    private Budget testBudget;
    private BudgetRequest testRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .email("test@example.com")
                .fullName("Test User")
                .preferredCurrency("COP")
                .build();
        testUser.setId(1L);

        testBudget = Budget.builder()
                .name("Febrero 2026")
                .totalAmount(new BigDecimal("3000000"))
                .period(BudgetPeriod.MONTHLY)
                .startDate(LocalDate.of(2026, 2, 1))
                .endDate(LocalDate.of(2026, 2, 28))
                .currency("COP")
                .user(testUser)
                .build();
        testBudget.setId(1L);

        testRequest = new BudgetRequest();
        testRequest.setName("Febrero 2026");
        testRequest.setTotalAmount(new BigDecimal("3000000"));
        testRequest.setPeriod(BudgetPeriod.MONTHLY);
        testRequest.setStartDate(LocalDate.of(2026, 2, 1));
        testRequest.setEndDate(LocalDate.of(2026, 2, 28));
    }

    @Test
    @DisplayName("Debe crear un presupuesto correctamente")
    void shouldCreateBudget() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(budgetMapper.toEntity(testRequest)).thenReturn(testBudget);
        when(budgetRepository.save(any(Budget.class))).thenReturn(testBudget);
        when(budgetMapper.toResponse(testBudget)).thenReturn(
                BudgetResponse.builder()
                        .id(1L)
                        .name("Febrero 2026")
                        .totalAmount(new BigDecimal("3000000"))
                        .build()
        );
        when(transactionRepository.sumByBudgetIdAndType(1L, TransactionType.EXPENSE))
                .thenReturn(BigDecimal.ZERO);
        when(transactionRepository.sumByBudgetIdAndType(1L, TransactionType.INCOME))
                .thenReturn(BigDecimal.ZERO);

        BudgetResponse result = budgetService.create(1L, testRequest);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Febrero 2026");
        verify(budgetRepository).save(any(Budget.class));
    }

    @Test
    @DisplayName("Debe lanzar excepción si el usuario no existe")
    void shouldThrowWhenUserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> budgetService.create(99L, testRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Usuario no encontrado");
    }

    @Test
    @DisplayName("Debe encontrar presupuesto por ID y usuario")
    void shouldFindBudgetById() {
        when(budgetRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testBudget));
        when(budgetMapper.toResponse(testBudget)).thenReturn(
                BudgetResponse.builder()
                        .id(1L)
                        .name("Febrero 2026")
                        .totalAmount(new BigDecimal("3000000"))
                        .build()
        );
        when(transactionRepository.sumByBudgetIdAndType(1L, TransactionType.EXPENSE))
                .thenReturn(new BigDecimal("1500000"));
        when(transactionRepository.sumByBudgetIdAndType(1L, TransactionType.INCOME))
                .thenReturn(new BigDecimal("3000000"));

        BudgetResponse result = budgetService.findById(1L, 1L);

        assertThat(result).isNotNull();
        assertThat(result.getSpentAmount()).isEqualTo(new BigDecimal("1500000"));
        assertThat(result.getRemainingAmount()).isEqualTo(new BigDecimal("1500000"));
    }

    @Test
    @DisplayName("Debe desactivar presupuesto al eliminar")
    void shouldSoftDeleteBudget() {
        when(budgetRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testBudget));

        budgetService.delete(1L, 1L);

        assertThat(testBudget.getActive()).isFalse();
        verify(budgetRepository).save(testBudget);
    }
}
