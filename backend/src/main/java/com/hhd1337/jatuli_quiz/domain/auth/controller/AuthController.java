package com.hhd1337.jatuli_quiz.domain.auth.controller;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    @GetMapping("/api/auth/csrf")
    public Map<String, Object> csrf(CsrfToken csrfToken) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("token", csrfToken.getToken());
        result.put("headerName", csrfToken.getHeaderName());
        result.put("parameterName", csrfToken.getParameterName());

        return success("AUTH200", "CSRF 토큰 조회에 성공했습니다.", result);
    }

    @GetMapping("/api/auth/me")
    public Map<String, Object> me(Authentication authentication) {
        boolean authenticated = authentication != null
                && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("authenticated", authenticated);

        if (authenticated) {
            result.put("username", authentication.getName());
        }

        return success("AUTH200", "인증 상태 조회에 성공했습니다.", result);
    }

    private Map<String, Object> success(
            String code,
            String message,
            Object result
    ) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("isSuccess", true);
        body.put("code", code);
        body.put("message", message);
        body.put("result", result);
        return body;
    }
}