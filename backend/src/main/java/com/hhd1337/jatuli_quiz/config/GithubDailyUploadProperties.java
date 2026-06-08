package com.hhd1337.jatuli_quiz.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "github.daily-upload")
public record GithubDailyUploadProperties(
        boolean enabled,
        String owner,
        String repo,
        String branch,
        String token,
        String basePath,
        String committerName,
        String committerEmail
) {
}