package com.hhd1337.jatuli_quiz.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableConfigurationProperties({
        AdminProperties.class,
        CorsProperties.class
})
public class SecurityConfig {

    private final AdminProperties adminProperties;
    private final CorsProperties corsProperties;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${server.servlet.session.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${server.servlet.session.cookie.same-site:lax}")
    private String cookieSameSite;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return new InMemoryUserDetailsManager(
                User.withUsername(adminProperties.username())
                        .password(adminProperties.passwordHash())
                        .roles("ADMIN")
                        .build()
        );
    }

    @Bean
    public CookieCsrfTokenRepository csrfTokenRepository() {
        CookieCsrfTokenRepository repository = CookieCsrfTokenRepository.withHttpOnlyFalse();

        repository.setCookieCustomizer((ResponseCookie.ResponseCookieBuilder builder) ->
                builder
                        .secure(cookieSecure)
                        .sameSite(normalizeSameSite(cookieSameSite))
                        .path("/")
        );

        return repository;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .csrf(csrf -> csrf
                        .csrfTokenRepository(csrfTokenRepository())

                        /*
                         * CSRF 검사 제외 경로
                         *
                         * Swagger에서 PUT/PATCH/POST/DELETE 요청을 직접 테스트할 때는
                         * CSRF 토큰이 자동으로 포함되지 않아 403이 발생할 수 있다.
                         *
                         * /api/v1/routines/**, /api/v1/mentor/** 는 현재 MVP 개발/검증 단계에서만 임시로 제외한다.
                         * 프론트 연동 후에는 CSRF 토큰을 정상 전송하도록 바꾸고,
                         * 이 예외는 제거하는 것이 좋다.
                         */
                        .ignoringRequestMatchers(
                                "/api/auth/login",
                                "/api/auth/logout",
                                "/practice/random",
                                "/practice/bookmarks",
                                "/api/v1/problems/bookmarked/practice",
                                "/api/v1/test/github-daily-upload",

                                // TODO: 개발 단계 Swagger 테스트용 임시 허용
                                "/api/v1/routines/**",
                                "/api/v1/mentor/**"
                        )
                )

                .authorizeHttpRequests(auth -> auth
                        // 인증 관련 API
                        .requestMatchers(HttpMethod.GET, "/api/auth/csrf").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/auth/me").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/logout").permitAll()

                        // 헬스 체크
                        .requestMatchers(HttpMethod.GET, "/health").permitAll()

                        // Swagger는 일단 허용. 운영에서 막고 싶으면 authenticated()로 변경
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                        /*
                         * TODO: 개발 단계 Swagger 테스트용 임시 허용
                         *
                         * 루틴 시계 기능은 최종적으로 로그인 후 사용 가능해야 한다.
                         * 다만 현재는 프론트 연동 전 Swagger에서 API 동작을 먼저 확인하기 위해 permitAll 처리한다.
                         *
                         * 프론트 연동 후에는 아래 설정을 authenticated()로 변경한다.
                         */
                        .requestMatchers("/api/v1/routines/**").permitAll()

                        // 조회 API 허용
                        .requestMatchers(HttpMethod.GET, "/**").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 조회성 POST API 허용
                        .requestMatchers(HttpMethod.POST, "/practice/random").permitAll()
                        .requestMatchers(HttpMethod.POST, "/practice/bookmarks").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/problems/bookmarked/practice").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/v1/test/github-daily-upload").permitAll()

                        // 문제 데이터 변경 API 보호
                        .requestMatchers(HttpMethod.POST, "/api/v1/problems").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/problems/*/bookmark").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/problems/import/text").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/problems/**").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/problems/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/problems/**").authenticated()

                        // 문제 제출 결과 저장 API 보호
                        .requestMatchers(HttpMethod.POST, "/api/v1/problem-submissions").authenticated()

                        // 폴더 데이터 변경 API 보호
                        .requestMatchers(HttpMethod.POST, "/api/v1/folders").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/folders/*/practice-cursor").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/folders/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/folders/**").authenticated()

                        // 나머지는 일단 허용
                        .anyRequest().permitAll()
                )

                .formLogin(form -> form
                        .loginProcessingUrl("/api/auth/login")
                        .usernameParameter("username")
                        .passwordParameter("password")
                        .successHandler((request, response, authentication) -> writeJson(
                                response,
                                HttpServletResponse.SC_OK,
                                successBody(
                                        "AUTH200",
                                        "로그인에 성공했습니다.",
                                        Map.of(
                                                "username", authentication.getName()
                                        )
                                )
                        ))
                        .failureHandler((request, response, exception) -> writeJson(
                                response,
                                HttpServletResponse.SC_UNAUTHORIZED,
                                failBody(
                                        "AUTH401",
                                        "아이디 또는 비밀번호가 올바르지 않습니다."
                                )
                        ))
                )

                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler((request, response, authentication) -> writeJson(
                                response,
                                HttpServletResponse.SC_OK,
                                successBody(
                                        "AUTH200",
                                        "로그아웃되었습니다.",
                                        null
                                )
                        ))
                )

                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> writeJson(
                                response,
                                HttpServletResponse.SC_UNAUTHORIZED,
                                failBody(
                                        "AUTH401",
                                        "로그인이 필요합니다."
                                )
                        ))
                        .accessDeniedHandler((request, response, accessDeniedException) -> writeJson(
                                response,
                                HttpServletResponse.SC_FORBIDDEN,
                                failBody(
                                        "AUTH403",
                                        "접근 권한이 없습니다."
                                )
                        ))
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        return request -> {
            CorsConfiguration config = new CorsConfiguration();

            config.setAllowedOrigins(corsProperties.allowedOrigins());
            config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
            config.setAllowedHeaders(List.of("*"));
            config.setAllowCredentials(true);

            return config;
        };
    }

    private String normalizeSameSite(String sameSite) {
        if (sameSite == null || sameSite.isBlank()) {
            return "Lax";
        }

        String normalized = sameSite.trim().toLowerCase(Locale.ROOT);

        return switch (normalized) {
            case "none" -> "None";
            case "strict" -> "Strict";
            case "lax" -> "Lax";
            default -> "Lax";
        };
    }

    private void writeJson(
            HttpServletResponse response,
            int status,
            Map<String, Object> body
    ) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getWriter(), body);
    }

    private Map<String, Object> successBody(
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

    private Map<String, Object> failBody(
            String code,
            String message
    ) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("isSuccess", false);
        body.put("code", code);
        body.put("message", message);
        body.put("result", null);
        return body;
    }
}