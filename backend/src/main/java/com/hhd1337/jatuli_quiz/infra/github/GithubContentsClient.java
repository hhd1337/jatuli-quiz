package com.hhd1337.jatuli_quiz.infra.github;

import com.hhd1337.jatuli_quiz.config.GithubDailyUploadProperties;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

@Slf4j
@Component
public class GithubContentsClient {

    private final GithubDailyUploadProperties properties;
    private final RestClient restClient;

    public GithubContentsClient(
            GithubDailyUploadProperties properties,
            RestClient.Builder restClientBuilder
    ) {
        this.properties = properties;
        this.restClient = restClientBuilder
                .baseUrl("https://api.github.com")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + properties.token())
                .defaultHeader(HttpHeaders.ACCEPT, "application/vnd.github+json")
                .defaultHeader("X-GitHub-Api-Version", "2022-11-28")
                .build();
    }

    public void createOrUpdateFile(String path, String markdownContent, String commitMessage) {
        String existingSha = findExistingFileSha(path);

        String encodedContent = Base64.getEncoder()
                .encodeToString(markdownContent.getBytes(StandardCharsets.UTF_8));

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", commitMessage);
        body.put("content", encodedContent);
        body.put("branch", properties.branch());

        Map<String, String> author = new LinkedHashMap<>();
        author.put("name", properties.committerName());
        author.put("email", properties.committerEmail());
        body.put("author", author);

        Map<String, String> committer = new LinkedHashMap<>();
        committer.put("name", properties.committerName());
        committer.put("email", properties.committerEmail());
        body.put("committer", committer);

        if (existingSha != null) {
            body.put("sha", existingSha);
        }

        String uri = "/repos/%s/%s/contents/%s"
                .formatted(properties.owner(), properties.repo(), path);

        restClient.put()
                .uri(uri)
                .body(body)
                .retrieve()
                .toBodilessEntity();

        if (existingSha == null) {
            log.info("[GitHub Daily Upload] 새 파일 업로드 완료 path={}", path);
        } else {
            log.info("[GitHub Daily Upload] 기존 파일 갱신 완료 path={}", path);
        }
    }

    private String findExistingFileSha(String path) {
        String uri = "/repos/%s/%s/contents/%s?ref=%s"
                .formatted(properties.owner(), properties.repo(), path, properties.branch());

        try {
            GithubContentResponse response = restClient.get()
                    .uri(uri)
                    .retrieve()
                    .body(GithubContentResponse.class);

            return response == null ? null : response.sha();
        } catch (HttpClientErrorException.NotFound e) {
            return null;
        }
    }

    private record GithubContentResponse(
            String sha
    ) {
    }
}