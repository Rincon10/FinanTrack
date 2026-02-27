package com.budget.api.controller;

import com.budget.api.dto.request.TransactionFilterRequest;
import com.budget.api.dto.request.TransactionRequest;
import com.budget.api.dto.response.ApiResponse;
import com.budget.api.dto.response.TransactionResponse;
import com.budget.api.entity.Transaction;
import com.budget.api.security.SecurityUtils;
import com.budget.api.service.CsvService;
import com.budget.api.service.TransactionService;
import com.opencsv.exceptions.CsvValidationException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
@Tag(name = "Transacciones", description = "CRUD y búsqueda de transacciones")
public class TransactionController {

    private final TransactionService transactionService;
    private final CsvService csvService;
    private final SecurityUtils securityUtils;

    @PostMapping
    @Operation(summary = "Registrar transacción (ingreso o gasto)")
    public ResponseEntity<ApiResponse<TransactionResponse>> create(
            @Valid @RequestBody TransactionRequest request) {
        Long userId = securityUtils.getCurrentUserId();
        TransactionResponse response = transactionService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }

    @GetMapping
    @Operation(summary = "Listar transacciones con filtros y paginación")
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> findAll(
            TransactionFilterRequest filter,
            @PageableDefault(size = 20, sort = "transactionDate") Pageable pageable) {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(transactionService.findAll(userId, filter, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener transacción por ID")
    public ResponseEntity<ApiResponse<TransactionResponse>> findById(@PathVariable Long id) {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(transactionService.findById(userId, id)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar transacción")
    public ResponseEntity<ApiResponse<TransactionResponse>> update(
            @PathVariable Long id, @Valid @RequestBody TransactionRequest request) {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(transactionService.update(userId, id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar transacción (soft delete)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        Long userId = securityUtils.getCurrentUserId();
        transactionService.delete(userId, id);
        return ResponseEntity.ok(ApiResponse.ok("Transacción eliminada", null));
    }

    @GetMapping("/export/{budgetId}")
    @Operation(summary = "Exportar transacciones a CSV")
    public ResponseEntity<byte[]> exportCsv(@PathVariable Long budgetId) throws IOException {
        List<Transaction> transactions = transactionService.findByBudgetForExport(budgetId);
        byte[] csv = csvService.exportTransactions(transactions);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=transacciones.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @PostMapping("/import/{budgetId}")
    @Operation(summary = "Importar transacciones desde CSV")
    public ResponseEntity<ApiResponse<Integer>> importCsv(
            @PathVariable Long budgetId,
            @RequestParam("file") MultipartFile file) throws IOException, CsvValidationException {
        Long userId = securityUtils.getCurrentUserId();
        List<TransactionRequest> requests = csvService.importTransactions(file.getInputStream(), budgetId);

        int imported = 0;
        for (TransactionRequest req : requests) {
            transactionService.create(userId, req);
            imported++;
        }

        return ResponseEntity.ok(ApiResponse.ok("Transacciones importadas: " + imported, imported));
    }
}
