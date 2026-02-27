package com.budget.api.controller;

import com.budget.api.dto.request.LoginRequest;
import com.budget.api.dto.request.RegisterRequest;
import com.budget.api.dto.response.AuthResponse;
import com.budget.api.dto.response.UserResponse;
import com.budget.api.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.bean.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @MockBean
    private AuthService authService;

    @Test
    @DisplayName("POST /api/auth/register - Debe registrar usuario")
    void shouldRegister() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Juan Pérez");
        request.setEmail("juan@example.com");
        request.setPassword("password123");

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken("jwt-token")
                .refreshToken("refresh-token")
                .tokenType("Bearer")
                .expiresIn(86400000L)
                .user(UserResponse.builder()
                        .id(1L)
                        .email("juan@example.com")
                        .fullName("Juan Pérez")
                        .preferredCurrency("COP")
                        .preferredLocale("es")
                        .build())
                .build();

        when(authService.register(any())).thenReturn(authResponse);

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("jwt-token"));
    }

    @Test
    @DisplayName("POST /api/auth/register - Debe fallar con validación")
    void shouldFailValidation() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("invalid-email");
        request.setPassword("short");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}
