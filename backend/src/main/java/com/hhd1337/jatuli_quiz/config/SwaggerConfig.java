package com.hhd1337.jatuli_quiz.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI jatuliOpenAPI() {
        return new OpenAPI()
                .addServersItem(new Server().url("/"))
                .info(createInfo());
    }

    private Info createInfo(){
        return new Info()
                .title("Jatuli API")
                .description("Jatuli API 명세서")
                .version("1.0.0");
    }
}