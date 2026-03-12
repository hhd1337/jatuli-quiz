package com.hhd1337.jatuli_quiz.domain.dailystat.repository;

import com.hhd1337.jatuli_quiz.domain.dailystat.entity.DailyStat;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DailyStatRepository extends JpaRepository<DailyStat, Long> {
    Optional<DailyStat> findByStatDate(LocalDate statDate);
}
