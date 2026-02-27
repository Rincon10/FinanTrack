package com.budget.api.repository;

import com.budget.api.entity.Budget;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    Page<Budget> findByUserIdAndActiveTrue(Long userId, Pageable pageable);

    List<Budget> findByUserIdAndActiveTrueOrderByStartDateDesc(Long userId);

    Optional<Budget> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId AND b.active = true " +
           "AND b.startDate <= :date AND b.endDate >= :date")
    List<Budget> findActiveBudgetsByDate(@Param("userId") Long userId, @Param("date") LocalDate date);
}
