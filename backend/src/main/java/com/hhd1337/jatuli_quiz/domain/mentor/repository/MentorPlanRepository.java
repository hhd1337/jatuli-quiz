package com.hhd1337.jatuli_quiz.domain.mentor.repository;

import com.hhd1337.jatuli_quiz.domain.mentor.entity.MentorPlan;
import com.hhd1337.jatuli_quiz.domain.mentor.entity.MentorPlanType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MentorPlanRepository extends JpaRepository<MentorPlan, Long> {

    Optional<MentorPlan> findByTypeAndActiveTrue(MentorPlanType type);

    List<MentorPlan> findAllByActiveTrue();
}
