package com.budget.api.controller;

import com.budget.api.dto.response.ApiResponse;
import com.budget.api.dto.response.UserResponse;
import com.budget.api.entity.User;
import com.budget.api.exception.ResourceNotFoundException;
import com.budget.api.repository.UserRepository;
import com.budget.api.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Usuarios", description = "Perfil y configuración del usuario")
public class UserController {

    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;

    @GetMapping("/me")
    @Operation(summary = "Obtener perfil del usuario autenticado")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile() {
        Long userId = securityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        UserResponse response = UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .preferredCurrency(user.getPreferredCurrency())
                .preferredLocale(user.getPreferredLocale())
                .build();

        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PatchMapping("/me/settings")
    @Operation(summary = "Actualizar configuración del usuario (moneda, idioma)")
    public ResponseEntity<ApiResponse<UserResponse>> updateSettings(@RequestBody Map<String, String> settings) {
        Long userId = securityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (settings.containsKey("preferredCurrency")) {
            user.setPreferredCurrency(settings.get("preferredCurrency"));
        }
        if (settings.containsKey("preferredLocale")) {
            user.setPreferredLocale(settings.get("preferredLocale"));
        }

        user = userRepository.save(user);

        UserResponse response = UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .preferredCurrency(user.getPreferredCurrency())
                .preferredLocale(user.getPreferredLocale())
                .build();

        return ResponseEntity.ok(ApiResponse.ok("Configuración actualizada", response));
    }
}
