package com.budget.api.dto.response;

import com.budget.api.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class TransactionResponse {
    private Long id;
    private String description;
    private BigDecimal amount;
    private TransactionType type;
    private LocalDate transactionDate;
    private String notes;
    private String categoryName;
    private Long categoryId;
    private String budgetName;
    private Long budgetId;
    private LocalDateTime createdAt;
}
