package com.hhd1337.jatuli_quiz.domain.problemsubmission.repository;

import com.hhd1337.jatuli_quiz.domain.problemsubmission.entity.ProblemSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProblemSubmissionRepository extends JpaRepository<ProblemSubmission, Long> {
}
