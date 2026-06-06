package com.hhd1337.jatuli_quiz.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    /*
     * CORS 설정은 SecurityConfig에서 처리한다.
     *
     * 이유:
     * - 이번 작업은 Spring Security 기반 세션 로그인을 사용한다.
     * - 세션 쿠키(JSESSIONID)를 프론트엔드와 백엔드 간에 주고받아야 한다.
     * - 따라서 CORS도 Spring Security 필터 체인에서 함께 처리하는 편이 명확하다.
     *
     * 기존 WebConfig의 allowCredentials(false)는 세션 쿠키 전달을 방해할 수 있으므로 제거한다.
     */
}