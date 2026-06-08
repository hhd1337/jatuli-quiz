package com.hhd1337.jatuli_quiz.domain.problemsubmission.repository;

import com.hhd1337.jatuli_quiz.domain.problemsubmission.entity.ProblemSubmission;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProblemSubmissionRepository extends JpaRepository<ProblemSubmission, Long> {

    @Query("""
            select distinct ps.problem.problemId
            from ProblemSubmission ps
            where ps.submittedAt >= :startAt
              and ps.submittedAt < :endAt
            order by ps.problem.problemId asc
            """)
    List<Long> findDistinctProblemIdsSolvedBetween(
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt
    );

    @Query("""
            select count(ps)
            from ProblemSubmission ps
            where ps.problem.problemId = :problemId
            """)
    long countByProblemId(@Param("problemId") Long problemId);
}