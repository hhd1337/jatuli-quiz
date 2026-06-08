package com.hhd1337.jatuli_quiz.domain.dailyrecord.scheduler;

import com.hhd1337.jatuli_quiz.domain.dailyrecord.service.DailyProblemRecordService;
import java.time.LocalDate;
import java.time.ZoneId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DailyProblemRecordScheduler {

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");

    private final DailyProblemRecordService dailyProblemRecordService;

    @Scheduled(cron = "0 10 0 * * *", zone = "Asia/Seoul")
    public void uploadYesterdayProblemRecord() {
        LocalDate targetDate = LocalDate.now(KST).minusDays(1);

        log.info("[GitHub Daily Upload] 일일 문제 풀이 기록 업로드 시작 targetDate={}", targetDate);

        dailyProblemRecordService.uploadDailyRecord(targetDate);
    }
}