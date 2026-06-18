package com.hhd1337.jatuli_quiz.domain.mentor.service;

import com.hhd1337.jatuli_quiz.domain.mentor.dto.MentorRequest;
import com.hhd1337.jatuli_quiz.domain.mentor.dto.MentorResponse;
import com.hhd1337.jatuli_quiz.domain.mentor.entity.DailyReflection;
import com.hhd1337.jatuli_quiz.domain.mentor.repository.DailyReflectionRepository;
import java.time.LocalDate;
import java.time.ZoneId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DailyReflectionService {

    private static final ZoneId KOREA_ZONE_ID = ZoneId.of("Asia/Seoul");

    private final DailyReflectionRepository dailyReflectionRepository;

    @Transactional
    public MentorResponse.DailyReflectionResponse saveDailyReflection(
            MentorRequest.SaveDailyReflectionRequest request
    ) {
        LocalDate reflectionDate = request.reflectionDate() != null
                ? request.reflectionDate()
                : LocalDate.now(KOREA_ZONE_ID);

        DailyReflection dailyReflection = dailyReflectionRepository.findByReflectionDate(reflectionDate)
                .map(existingReflection -> {
                    existingReflection.update(
                            request.mood(),
                            request.good(),
                            request.regret(),
                            request.freeText()
                    );
                    return existingReflection;
                })
                .orElseGet(() -> dailyReflectionRepository.save(
                        new DailyReflection(
                                reflectionDate,
                                request.mood(),
                                request.good(),
                                request.regret(),
                                request.freeText()
                        )
                ));

        return MentorResponse.DailyReflectionResponse.from(dailyReflection);
    }

    public MentorResponse.DailyReflectionResponse getDailyReflection(LocalDate date) {
        DailyReflection dailyReflection = dailyReflectionRepository.findByReflectionDate(date)
                .orElseThrow(() -> new IllegalArgumentException("해당 날짜의 오늘 소감이 없습니다. date=" + date));

        return MentorResponse.DailyReflectionResponse.from(dailyReflection);
    }
}