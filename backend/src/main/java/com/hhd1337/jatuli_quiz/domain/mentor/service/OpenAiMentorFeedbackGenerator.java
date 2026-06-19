package com.hhd1337.jatuli_quiz.domain.mentor.service;

import com.hhd1337.jatuli_quiz.domain.mentor.config.OpenAiProperties;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import tools.jackson.databind.JsonNode;

@Slf4j
@Component
@ConditionalOnProperty(
        name = "mentor.feedback.provider",
        havingValue = "openai",
        matchIfMissing = true
)
public class OpenAiMentorFeedbackGenerator implements MentorFeedbackGenerator {

    private static final String SYSTEM_INSTRUCTION = """
            너는 사용자의 1대1 취업 준비 AI 멘토다.
            사용자의 루틴 수행 결과, 장기 계획, 월간 계획, 주간 계획, 오늘 소감을 바탕으로 하루 피드백을 작성한다.
            
            반드시 다음 원칙을 지켜라.
            - 한국어로 작성한다.
            - 사용자를 무작정 위로하지 않는다.
            - 잘한 점은 구체적으로 칭찬한다.
            - 아쉬운 점은 실행 행동 기준으로 지적한다.
            - 현실적인 쓴소리는 비난이 아니라 행동 교정 중심으로 작성한다.
            - 내일 행동 지시는 1~3개로 제한한다.
            - 매일 읽을 수 있도록 너무 길게 쓰지 않는다.
            - 출력 형식은 사용자가 제공한 프롬프트의 형식을 따른다.
            """;

    private final OpenAiProperties openAiProperties;
    private final RestClient restClient;

    public OpenAiMentorFeedbackGenerator(OpenAiProperties openAiProperties) {
        this.openAiProperties = openAiProperties;
        this.restClient = createRestClient(openAiProperties);
    }

    @Override
    public String generate(String prompt) {
        validateRequiredProperties();

        if (!StringUtils.hasText(prompt)) {
            throw new IllegalArgumentException("AI 멘토 피드백 생성을 위한 프롬프트가 비어 있습니다.");
        }

        Map<String, Object> requestBody = buildRequestBody(prompt);

        try {
            JsonNode responseBody = restClient.post()
                    .uri("/responses")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(JsonNode.class);

            return extractFeedbackContent(responseBody);
        } catch (RestClientResponseException exception) {
            log.error(
                    "OpenAI API 응답 오류. status={}, body={}",
                    exception.getStatusCode(),
                    exception.getResponseBodyAsString(),
                    exception
            );

            throw new IllegalStateException("AI 멘토 피드백 생성 중 OpenAI API 응답 오류가 발생했습니다.");
        } catch (RestClientException exception) {
            log.error("OpenAI API 호출 실패", exception);

            throw new IllegalStateException("AI 멘토 피드백 생성 중 OpenAI API 호출에 실패했습니다.");
        }
    }

    private RestClient createRestClient(OpenAiProperties properties) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        Duration timeout = Duration.ofSeconds(Math.max(1, properties.getTimeoutSeconds()));

        requestFactory.setConnectTimeout(timeout);
        requestFactory.setReadTimeout(timeout);

        return RestClient.builder()
                .baseUrl(properties.getNormalizedBaseUrl())
                .requestFactory(requestFactory)
                .defaultHeader("Authorization", "Bearer " + properties.getApiKey())
                .defaultHeader("Accept", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    private Map<String, Object> buildRequestBody(String prompt) {
        Map<String, Object> requestBody = new LinkedHashMap<>();

        requestBody.put("model", openAiProperties.getModel());

        List<Map<String, Object>> input = new ArrayList<>();

        input.add(Map.of(
                "role", "developer",
                "content", SYSTEM_INSTRUCTION
        ));

        input.add(Map.of(
                "role", "user",
                "content", prompt
        ));

        requestBody.put("input", input);

        if (openAiProperties.getMaxOutputTokens() > 0) {
            requestBody.put("max_output_tokens", openAiProperties.getMaxOutputTokens());
        }

        return requestBody;
    }

    private String extractFeedbackContent(JsonNode responseBody) {
        if (responseBody == null || responseBody.isNull()) {
            throw new IllegalStateException("OpenAI API 응답이 비어 있습니다.");
        }

        JsonNode errorNode = responseBody.path("error");

        if (!errorNode.isMissingNode() && !errorNode.isNull()) {
            String errorMessage = errorNode.path("message").asText("알 수 없는 OpenAI API 오류");
            throw new IllegalStateException("OpenAI API 오류: " + errorMessage);
        }

        String status = responseBody.path("status").asText("");

        if ("incomplete".equals(status)) {
            String reason = responseBody.path("incomplete_details").path("reason").asText("unknown");
            throw new IllegalStateException("OpenAI API 응답이 완성되지 않았습니다. reason=" + reason);
        }

        String outputText = extractOutputText(responseBody);

        if (!StringUtils.hasText(outputText)) {
            log.error("OpenAI API 응답에서 피드백 텍스트를 추출하지 못했습니다. response={}", responseBody);
            throw new IllegalStateException("OpenAI API 응답에서 피드백 내용을 찾지 못했습니다.");
        }

        return outputText.trim();
    }

    private String extractOutputText(JsonNode responseBody) {
        JsonNode outputTextNode = responseBody.path("output_text");

        if (outputTextNode.isTextual() && StringUtils.hasText(outputTextNode.asText())) {
            return outputTextNode.asText();
        }

        StringBuilder builder = new StringBuilder();

        JsonNode outputNode = responseBody.path("output");

        if (outputNode.isArray()) {
            for (JsonNode outputItem : outputNode) {
                JsonNode contentNode = outputItem.path("content");

                if (!contentNode.isArray()) {
                    continue;
                }

                for (JsonNode contentItem : contentNode) {
                    JsonNode textNode = contentItem.path("text");

                    if (textNode.isTextual() && StringUtils.hasText(textNode.asText())) {
                        if (!builder.isEmpty()) {
                            builder.append("\n");
                        }

                        builder.append(textNode.asText());
                    }
                }
            }
        }

        return builder.toString();
    }

    private void validateRequiredProperties() {
        if (!StringUtils.hasText(openAiProperties.getApiKey())) {
            throw new IllegalStateException("OPENAI_API_KEY가 설정되어 있지 않습니다.");
        }

        if (!StringUtils.hasText(openAiProperties.getModel())) {
            throw new IllegalStateException("OPENAI_MODEL이 설정되어 있지 않습니다.");
        }
    }
}