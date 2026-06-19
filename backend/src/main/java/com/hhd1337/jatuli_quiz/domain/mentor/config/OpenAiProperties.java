package com.hhd1337.jatuli_quiz.domain.mentor.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "openai")
public class OpenAiProperties {

    private String apiKey;

    private String model = "gpt-5.5";

    private String baseUrl = "https://api.openai.com/v1";

    private long timeoutSeconds = 30;

    private int maxOutputTokens = 3000;

    public String getNormalizedBaseUrl() {
        if (!StringUtils.hasText(baseUrl)) {
            return "https://api.openai.com/v1";
        }

        return baseUrl.replaceAll("/+$", "");
    }
}