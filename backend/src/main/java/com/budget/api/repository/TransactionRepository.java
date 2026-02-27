package com.budget.api.repository;

import com.budget.api.entity.Transaction;
import com.budget.api.enums.ExpenseType;
import com.budget.api.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long>,
        JpaSpecificationExecutor<Transaction> {

    Page<Transaction> findByBudgetUserIdAndDeletedFalse(Long userId, Pageable pageable);

    Optional<Transaction> findByIdAndBudgetUserId(Long id, Long userId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.budget.id = :budgetId AND t.type = :type AND t.deleted = false")
    BigDecimal sumByBudgetIdAndType(@Param("budgetId") Long budgetId,
                                     @Param("type") TransactionType type);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.budget.user.id = :userId AND t.type = :type AND t.deleted = false " +
           "AND t.transactionDate BETWEEN :start AND :end")
    BigDecimal sumByUserIdAndTypeAndDateRange(@Param("userId") Long userId,
                                              @Param("type") TransactionType type,
                                              @Param("start") LocalDate start,
                                              @Param("end") LocalDate end);

    @Query("SELECT t.category.name, COALESCE(SUM(t.amount), 0) " +
           "FROM Transaction t WHERE t.budget.user.id = :userId " +
           "AND t.type = 'EXPENSE' AND t.deleted = false " +
           "AND t.transactionDate BETWEEN :start AND :end " +
           "GROUP BY t.category.name")
    List<Object[]> sumExpensesByCategory(@Param("userId") Long userId,
                                         @Param("start") LocalDate start,
                                         @Param("end") LocalDate end);

    @Query("SELECT t.category.expenseType, COALESCE(SUM(t.amount), 0) " +
           "FROM Transaction t WHERE t.budget.user.id = :userId " +
           "AND t.type = 'EXPENSE' AND t.deleted = false " +
           "AND t.transactionDate BETWEEN :start AND :end " +
           "GROUP BY t.category.expenseType")
    List<Object[]> sumExpensesByExpenseType(@Param("userId") Long userId,
                                            @Param("start") LocalDate start,
                                            @Param("end") LocalDate end);

    @Query("SELECT t.transactionDate, COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE -t.amount END), 0) " +
           "FROM Transaction t WHERE t.budget.user.id = :userId AND t.deleted = false " +
           "AND t.transactionDate BETWEEN :start AND :end " +
           "GROUP BY t.transactionDate ORDER BY t.transactionDate")
    List<Object[]> dailyBalanceChange(@Param("userId") Long userId,
                                       @Param("start") LocalDate start,
                                       @Param("end") LocalDate end);

    @Query("SELECT COUNT(t) FROM Transaction t " +
           "WHERE t.budget.user.id = :userId AND t.type = 'EXPENSE' AND t.deleted = false " +
           "AND t.transactionDate >= :since")
    long countExpensesSince(@Param("userId") Long userId, @Param("since") LocalDate since);

    List<Transaction> findByBudgetIdAndDeletedFalseOrderByTransactionDateDesc(Long budgetId);
}
