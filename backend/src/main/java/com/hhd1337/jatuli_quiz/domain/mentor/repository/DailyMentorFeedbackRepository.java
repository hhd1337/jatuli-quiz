package com.hhd1337.jatuli_quiz.domain.mentor.repository;

import com.hhd1337.jatuli_quiz.domain.mentor.entity.DailyMentorFeedback;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DailyMentorFeedbackRepository extends JpaRepository<DailyMentorFeedback, Long> {

    Optional<DailyMentorFeedback> findByFeedbackDate(LocalDate feedbackDate);
}
