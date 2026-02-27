package com.budget.api.entity;

import com.budget.api.enums.ExpenseType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "categories",
       uniqueConstraints = @UniqueConstraint(columnNames = {"name", "user_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Category extends BaseEntity {

    @Column(nullable = false, length = 80)
    private String name;

    @Column(length = 255)
    private String description;

    @Column(length = 30)
    private String icon;

    @Column(length = 7)
    private String color;

    @Enumerated(EnumType.STRING)
    @Column(name = "expense_type", nullable = false, length = 20)
    private ExpenseType expenseType;

    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private Boolean isDefault = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}
