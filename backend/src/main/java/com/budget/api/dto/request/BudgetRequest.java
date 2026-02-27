package com.budget.api.dto.request;

import com.budget.api.enums.BudgetPeriod;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BudgetRequest {

    @NotBlank(message = "El nombre del presupuesto es obligatorio")
    @Size(max = 100)
    private String name;

    @NotNull(message = "El monto total es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    private BigDecimal totalAmount;

    @NotNull(message = "El periodo es obligatorio")
    private BudgetPeriod period;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate startDate;

    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDate endDate;

    private String currency;
}
