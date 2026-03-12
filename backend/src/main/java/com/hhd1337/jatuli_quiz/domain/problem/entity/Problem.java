package com.hhd1337.jatuli_quiz.domain.problem.entity;

import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "problem")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "problem_id")
    private Long problemId;

    @Column(name = "problem_num")
    private Integer problemNum;

    @Lob
    @Column(name = "question_text", columnDefinition = "TEXT")
    private String questionText;

    @Lob
    @Column(name = "explanation_text", columnDefinition = "TEXT")
    private String explanationText;

    @Lob
    @Column(name = "answer_text", columnDefinition = "TEXT")
    private String answerText;

    @Column(name = "is_bookmarked")
    private Boolean isBookmarked;

    @Column(name = "solved_count")
    private Integer solvedCount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id", nullable = false)
    private Folder folder;

    public Problem(
            Integer problemNum,
            String questionText,
            String explanationText,
            String answerText,
            Boolean isBookmarked,
            Integer solvedCount,
            Folder folder
    ) {
        this.problemNum = problemNum;
        this.questionText = questionText;
        this.explanationText = explanationText;
        this.answerText = answerText;
        this.isBookmarked = isBookmarked;
        this.solvedCount = solvedCount;
        this.folder = folder;
    }

    public void increaseSolvedCount() {
        if (this.solvedCount == null) {
            this.solvedCount = 0;
        }
        this.solvedCount += 1;
    }

    public void toggleBookmark() {
        if (this.isBookmarked == null) {
            this.isBookmarked = true;
            return;
        }
        this.isBookmarked = !this.isBookmarked;
    }
}