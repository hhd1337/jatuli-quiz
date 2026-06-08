package com.hhd1337.jatuli_quiz;

import com.hhd1337.jatuli_quiz.config.GithubDailyUploadProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@EnableConfigurationProperties(GithubDailyUploadProperties.class)
@SpringBootApplication
public class JatuliQuizApplication {

    public static void main(String[] args) {
        SpringApplication.run(JatuliQuizApplication.class, args);
    }
}