package com.budget.api.dto.request;

import com.budget.api.enums.TransactionType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransactionRequest {

    @NotBlank(message = "La descripción es obligatoria")
    @Size(max = 200)
    private String description;

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    private BigDecimal amount;

    @NotNull(message = "El tipo es obligatorio")
    private TransactionType type;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate transactionDate;

    @NotNull(message = "El presupuesto es obligatorio")
    private Long budgetId;

    private Long categoryId;

    @Size(max = 500)
    private String notes;
}
