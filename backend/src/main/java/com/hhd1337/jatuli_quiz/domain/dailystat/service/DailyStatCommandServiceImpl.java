package com.hhd1337.jatuli_quiz.domain.dailystat.service;

import com.hhd1337.jatuli_quiz.domain.dailystat.entity.DailyStat;
import com.hhd1337.jatuli_quiz.domain.dailystat.repository.DailyStatRepository;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class DailyStatCommandServiceImpl implements DailyStatCommandService {

    private static final ZoneId SERVICE_ZONE = ZoneId.of("Asia/Seoul");

    private final DailyStatRepository dailyStatRepository;

    @Override
    public DailyStat updateDailyStat(int elapsedSeconds) {
        LocalDate today = LocalDate.now(SERVICE_ZONE);

        Optional<DailyStat> todayStatOptional = dailyStatRepository.findByStatDate(today);

        if (todayStatOptional.isPresent()) {
            DailyStat todayStat = todayStatOptional.get();
            todayStat.applySubmission(elapsedSeconds);
            return todayStat;
        }

        Optional<DailyStat> lastStatOptional =
                dailyStatRepository.findTopByStatDateLessThanOrderByStatDateDesc(today);

        long previousAccumulatedFocusSeconds = lastStatOptional
                .map(DailyStat::getAccumulatedFocusSeconds)
                .orElse(0L);

        int daysInARow = calculateDaysInARow(lastStatOptional, today);

        DailyStat newDailyStat = DailyStat.createFirstSubmissionOfDay(
                today,
                elapsedSeconds,
                previousAccumulatedFocusSeconds,
                daysInARow
        );

        return dailyStatRepository.save(newDailyStat);
    }

    private int calculateDaysInARow(Optional<DailyStat> lastStatOptional, LocalDate today) {
        if (lastStatOptional.isEmpty()) {
            return 1;
        }

        DailyStat lastStat = lastStatOptional.get();
        LocalDate yesterday = today.minusDays(1);

        if (yesterday.equals(lastStat.getStatDate())) {
            Integer previousDaysInARow = lastStat.getDaysInARow();
            return (previousDaysInARow == null ? 0 : previousDaysInARow) + 1;
        }

        return 1;
    }
}
