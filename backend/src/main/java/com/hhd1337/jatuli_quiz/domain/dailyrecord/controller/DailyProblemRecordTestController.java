package com.hhd1337.jatuli_quiz.domain.dailyrecord.controller;

import com.hhd1337.jatuli_quiz.domain.dailyrecord.service.DailyProblemRecordService;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Profile("local")
@RestController
@RequiredArgsConstructor
public class DailyProblemRecordTestController {

    private final DailyProblemRecordService dailyProblemRecordService;

    @PostMapping("/api/v1/test/github-daily-upload")
    public String uploadDailyRecord(@RequestParam LocalDate date) {
        dailyProblemRecordService.uploadDailyRecord(date);
        return "OK";
    }
}