package com.budget.api.config;

import com.budget.api.entity.User;
import com.budget.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final UserRepository userRepository;

    @Bean
    public CommandLineRunner initDefaultUser() {
        return args -> {
            String defaultEmail = "default@budget.app";
            if (userRepository.findByEmail(defaultEmail).isEmpty()) {
                User user = User.builder()
                        .email(defaultEmail)
                        .password("no-auth")
                        .fullName("Usuario por Defecto")
                        .preferredCurrency("COP")
                        .preferredLocale("es")
                        .build();
                userRepository.save(user);
                log.info("Usuario por defecto creado: {}", defaultEmail);
            } else {
                log.info("Usuario por defecto ya existe: {}", defaultEmail);
            }
        };
    }
}
