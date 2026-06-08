package com.hhd1337.jatuli_quiz.domain.routine.repository;

import com.hhd1337.jatuli_quiz.domain.routine.entity.DailyRoutine;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DailyRoutineRepository extends JpaRepository<DailyRoutine, Long> {

    Optional<DailyRoutine> findByRoutineDate(LocalDate routineDate);

    boolean existsByRoutineDate(LocalDate routineDate);
}
