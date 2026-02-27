package com.budget.api.dto.request;

import com.budget.api.enums.ExpenseType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryRequest {

    @NotBlank(message = "El nombre de la categoría es obligatorio")
    @Size(max = 80)
    private String name;

    @Size(max = 255)
    private String description;

    private String icon;

    private String color;

    @NotNull(message = "El tipo de gasto es obligatorio")
    private ExpenseType expenseType;
}
