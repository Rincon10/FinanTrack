package com.budget.api.controller;

import com.budget.api.dto.response.ApiResponse;
import com.budget.api.dto.response.DashboardResponse;
import com.budget.api.security.SecurityUtils;
import com.budget.api.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@Tag(name = "Reportes / Dashboard", description = "Métricas y datos para el dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final SecurityUtils securityUtils;

    @GetMapping("/dashboard")
    @Operation(summary = "Obtener métricas del dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Long userId = securityUtils.getCurrentUserId();
        DashboardResponse response = dashboardService.getDashboardMetrics(userId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
