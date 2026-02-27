package com.budget.api.service;

import com.budget.api.dto.request.BudgetRequest;
import com.budget.api.dto.response.BudgetResponse;
import com.budget.api.entity.Budget;
import com.budget.api.entity.User;
import com.budget.api.enums.TransactionType;
import com.budget.api.exception.ResourceNotFoundException;
import com.budget.api.mapper.BudgetMapper;
import com.budget.api.repository.BudgetRepository;
import com.budget.api.repository.TransactionRepository;
import com.budget.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final BudgetMapper budgetMapper;

    @Transactional
    public BudgetResponse create(Long userId, BudgetRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Budget budget = budgetMapper.toEntity(request);
        budget.setUser(user);
        if (budget.getCurrency() == null) {
            budget.setCurrency(user.getPreferredCurrency());
        }

        budget = budgetRepository.save(budget);
        log.info("Presupuesto creado: {} para usuario {}", budget.getName(), userId);
        return enrichResponse(budgetMapper.toResponse(budget), budget.getId());
    }

    @Transactional(readOnly = true)
    public Page<BudgetResponse> findAll(Long userId, Pageable pageable) {
        return budgetRepository.findByUserIdAndActiveTrue(userId, pageable)
                .map(budget -> enrichResponse(budgetMapper.toResponse(budget), budget.getId()));
    }

    @Transactional(readOnly = true)
    public BudgetResponse findById(Long userId, Long budgetId) {
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Presupuesto no encontrado"));
        return enrichResponse(budgetMapper.toResponse(budget), budget.getId());
    }

    @Transactional
    public BudgetResponse update(Long userId, Long budgetId, BudgetRequest request) {
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Presupuesto no encontrado"));

        budgetMapper.updateEntity(request, budget);
        budget = budgetRepository.save(budget);
        log.info("Presupuesto actualizado: {}", budgetId);
        return enrichResponse(budgetMapper.toResponse(budget), budget.getId());
    }

    @Transactional
    public void delete(Long userId, Long budgetId) {
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Presupuesto no encontrado"));
        budget.setActive(false);
        budgetRepository.save(budget);
        log.info("Presupuesto desactivado: {}", budgetId);
    }

    private BudgetResponse enrichResponse(BudgetResponse response, Long budgetId) {
        BigDecimal spent = transactionRepository.sumByBudgetIdAndType(budgetId, TransactionType.EXPENSE);
        BigDecimal income = transactionRepository.sumByBudgetIdAndType(budgetId, TransactionType.INCOME);
        BigDecimal remaining = response.getTotalAmount().subtract(spent);
        double usage = response.getTotalAmount().compareTo(BigDecimal.ZERO) > 0
                ? spent.divide(response.getTotalAmount(), 4, RoundingMode.HALF_UP)
                       .multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;

        response.setSpentAmount(spent);
        response.setRemainingAmount(remaining);
        response.setUsagePercentage(usage);
        return response;
    }
}
