package com.budget.api.controller;

import com.budget.api.dto.request.CategoryRequest;
import com.budget.api.dto.response.ApiResponse;
import com.budget.api.dto.response.CategoryResponse;
import com.budget.api.security.SecurityUtils;
import com.budget.api.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
@Tag(name = "Categorías", description = "Gestión de categorías")
public class CategoryController {

    private final CategoryService categoryService;
    private final SecurityUtils securityUtils;

    @GetMapping
    @Operation(summary = "Listar categorías (del usuario + por defecto)")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> findAll() {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(categoryService.findAll(userId)));
    }

    @PostMapping
    @Operation(summary = "Crear categoría personalizada")
    public ResponseEntity<ApiResponse<CategoryResponse>> create(
            @Valid @RequestBody CategoryRequest request) {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(categoryService.create(userId, request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar categoría")
    public ResponseEntity<ApiResponse<CategoryResponse>> update(
            @PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(categoryService.update(userId, id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar categoría personalizada")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        Long userId = securityUtils.getCurrentUserId();
        categoryService.delete(userId, id);
        return ResponseEntity.ok(ApiResponse.ok("Categoría eliminada", null));
    }
}
