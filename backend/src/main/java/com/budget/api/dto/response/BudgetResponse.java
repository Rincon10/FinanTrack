package com.budget.api.dto.response;

import com.budget.api.enums.BudgetPeriod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class BudgetResponse {
    private Long id;
    private String name;
    private BigDecimal totalAmount;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private Double usagePercentage;
    private BudgetPeriod period;
    private LocalDate startDate;
    private LocalDate endDate;
    private String currency;
    private Boolean active;
    private LocalDateTime createdAt;
}
