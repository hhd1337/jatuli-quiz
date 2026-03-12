package com.hhd1337.jatuli_quiz.domain.problemsubmission.entity;

import com.hhd1337.jatuli_quiz.domain.problem.entity.Problem;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "problem_submission")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProblemSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "problem_submission_id")
    private Long problemSubmissionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Column(name = "elapsed_seconds")
    private Integer elapsedSeconds;

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;

    public ProblemSubmission(
            Problem problem,
            Boolean isCorrect,
            Integer elapsedSeconds,
            LocalDateTime submittedAt
    ) {
        this.problem = problem;
        this.isCorrect = isCorrect;
        this.elapsedSeconds = elapsedSeconds;
        this.submittedAt = submittedAt;
    }
}
