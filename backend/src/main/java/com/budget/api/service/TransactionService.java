package com.budget.api.service;

import com.budget.api.dto.request.TransactionFilterRequest;
import com.budget.api.dto.request.TransactionRequest;
import com.budget.api.dto.response.TransactionResponse;
import com.budget.api.entity.Budget;
import com.budget.api.entity.Category;
import com.budget.api.entity.Transaction;
import com.budget.api.enums.TransactionType;
import com.budget.api.exception.BudgetExceededException;
import com.budget.api.exception.ResourceNotFoundException;
import com.budget.api.mapper.TransactionMapper;
import com.budget.api.repository.BudgetRepository;
import com.budget.api.repository.CategoryRepository;
import com.budget.api.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionMapper transactionMapper;

    @Transactional
    public TransactionResponse create(Long userId, TransactionRequest request) {
        Budget budget = budgetRepository.findByIdAndUserId(request.getBudgetId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Presupuesto no encontrado"));

        Transaction transaction = transactionMapper.toEntity(request);
        transaction.setBudget(budget);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
            transaction.setCategory(category);
        }

        // Verificar si se excede el presupuesto
        if (request.getType() == TransactionType.EXPENSE) {
            BigDecimal currentSpent = transactionRepository.sumByBudgetIdAndType(
                    budget.getId(), TransactionType.EXPENSE);
            BigDecimal newTotal = currentSpent.add(request.getAmount());
            if (newTotal.compareTo(budget.getTotalAmount()) > 0) {
                log.warn("Alerta: El gasto excede el presupuesto '{}'. Gastado: {}, Presupuesto: {}",
                        budget.getName(), newTotal, budget.getTotalAmount());
                throw new BudgetExceededException(
                        String.format("Este gasto excede el presupuesto '%s'. Gastado: %s / %s",
                                budget.getName(), newTotal, budget.getTotalAmount()));
            }
        }

        transaction = transactionRepository.save(transaction);
        log.info("Transacción creada: {} - {} {}", transaction.getDescription(),
                transaction.getType(), transaction.getAmount());
        return transactionMapper.toResponse(transaction);
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> findAll(Long userId, TransactionFilterRequest filter, Pageable pageable) {
        Specification<Transaction> spec = buildSpecification(userId, filter);
        return transactionRepository.findAll(spec, pageable)
                .map(transactionMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public TransactionResponse findById(Long userId, Long transactionId) {
        Transaction transaction = transactionRepository.findByIdAndBudgetUserId(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transacción no encontrada"));
        return transactionMapper.toResponse(transaction);
    }

    @Transactional
    public TransactionResponse update(Long userId, Long transactionId, TransactionRequest request) {
        Transaction transaction = transactionRepository.findByIdAndBudgetUserId(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transacción no encontrada"));

        Budget budget = budgetRepository.findByIdAndUserId(request.getBudgetId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Presupuesto no encontrado"));

        transactionMapper.updateEntity(request, transaction);
        transaction.setBudget(budget);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
            transaction.setCategory(category);
        }

        transaction = transactionRepository.save(transaction);
        log.info("Transacción actualizada: {}", transactionId);
        return transactionMapper.toResponse(transaction);
    }

    @Transactional
    public void delete(Long userId, Long transactionId) {
        Transaction transaction = transactionRepository.findByIdAndBudgetUserId(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transacción no encontrada"));
        transaction.setDeleted(true); // Soft delete
        transactionRepository.save(transaction);
        log.info("Transacción eliminada (soft): {}", transactionId);
    }

    @Transactional(readOnly = true)
    public List<Transaction> findByBudgetForExport(Long budgetId) {
        return transactionRepository.findByBudgetIdAndDeletedFalseOrderByTransactionDateDesc(budgetId);
    }

    private Specification<Transaction> buildSpecification(Long userId, TransactionFilterRequest filter) {
        Specification<Transaction> spec = (root, query, cb) ->
                cb.and(
                    cb.equal(root.get("budget").get("user").get("id"), userId),
                    cb.isFalse(root.get("deleted"))
                );

        if (filter == null) return spec;

        if (filter.getBudgetId() != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("budget").get("id"), filter.getBudgetId()));
        }
        if (filter.getCategoryId() != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("category").get("id"), filter.getCategoryId()));
        }
        if (filter.getType() != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("type"), filter.getType()));
        }
        if (filter.getStartDate() != null) {
            spec = spec.and((root, query, cb) ->
                    cb.greaterThanOrEqualTo(root.get("transactionDate"), filter.getStartDate()));
        }
        if (filter.getEndDate() != null) {
            spec = spec.and((root, query, cb) ->
                    cb.lessThanOrEqualTo(root.get("transactionDate"), filter.getEndDate()));
        }
        if (filter.getSearch() != null && !filter.getSearch().isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("description")),
                            "%" + filter.getSearch().toLowerCase() + "%"));
        }

        return spec;
    }
}
