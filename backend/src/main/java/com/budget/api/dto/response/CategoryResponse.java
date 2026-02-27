package com.budget.api.dto.response;

import com.budget.api.enums.ExpenseType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    private String icon;
    private String color;
    private ExpenseType expenseType;
    private Boolean isDefault;
}
