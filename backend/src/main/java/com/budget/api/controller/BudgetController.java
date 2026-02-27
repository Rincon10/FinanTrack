package com.budget.api.controller;

import com.budget.api.dto.request.BudgetRequest;
import com.budget.api.dto.response.ApiResponse;
import com.budget.api.dto.response.BudgetResponse;
import com.budget.api.security.SecurityUtils;
import com.budget.api.service.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/budgets")
@RequiredArgsConstructor
@Tag(name = "Presupuestos", description = "CRUD de presupuestos")
public class BudgetController {

    private final BudgetService budgetService;
    private final SecurityUtils securityUtils;

    @PostMapping
    @Operation(summary = "Crear presupuesto")
    public ResponseEntity<ApiResponse<BudgetResponse>> create(@Valid @RequestBody BudgetRequest request) {
        Long userId = securityUtils.getCurrentUserId();
        BudgetResponse response = budgetService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }

    @GetMapping
    @Operation(summary = "Listar presupuestos del usuario")
    public ResponseEntity<ApiResponse<Page<BudgetResponse>>> findAll(
            @PageableDefault(size = 10) Pageable pageable) {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(budgetService.findAll(userId, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener presupuesto por ID")
    public ResponseEntity<ApiResponse<BudgetResponse>> findById(@PathVariable Long id) {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(budgetService.findById(userId, id)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar presupuesto")
    public ResponseEntity<ApiResponse<BudgetResponse>> update(
            @PathVariable Long id, @Valid @RequestBody BudgetRequest request) {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(budgetService.update(userId, id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar presupuesto (soft delete)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        Long userId = securityUtils.getCurrentUserId();
        budgetService.delete(userId, id);
        return ResponseEntity.ok(ApiResponse.ok("Presupuesto eliminado", null));
    }
}
