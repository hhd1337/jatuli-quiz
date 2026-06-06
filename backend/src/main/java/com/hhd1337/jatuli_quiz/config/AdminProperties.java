package com.hhd1337.jatuli_quiz.config;


import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.admin")
public record AdminProperties(
        String username,
        String passwordHash
) {
    public AdminProperties {
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("app.admin.username must not be blank");
        }

        if (passwordHash == null || passwordHash.isBlank()) {
            throw new IllegalArgumentException("app.admin.password-hash must not be blank");
        }
    }
}