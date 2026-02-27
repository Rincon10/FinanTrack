package com.budget.api.security;

import com.budget.api.entity.User;
import com.budget.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final UserRepository userRepository;

    private static final String DEFAULT_EMAIL = "default@budget.app";

    public Long getCurrentUserId() {
        return userRepository.findByEmail(DEFAULT_EMAIL)
                .map(User::getId)
                .orElse(1l);
    }

    public String getCurrentUserEmail() {
        return DEFAULT_EMAIL;
    }
}
