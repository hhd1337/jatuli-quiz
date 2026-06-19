package com.hhd1337.jatuli_quiz.domain.mentor.repository;

import com.hhd1337.jatuli_quiz.domain.mentor.entity.DailyReflection;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DailyReflectionRepository extends JpaRepository<DailyReflection, Long> {

    Optional<DailyReflection> findByReflectionDate(LocalDate reflectionDate);
}