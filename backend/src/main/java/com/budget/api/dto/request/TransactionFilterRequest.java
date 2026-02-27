package com.budget.api.dto.request;

import com.budget.api.enums.TransactionType;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TransactionFilterRequest {
    private Long budgetId;
    private Long categoryId;
    private TransactionType type;
    private LocalDate startDate;
    private LocalDate endDate;
    private String search;
}
