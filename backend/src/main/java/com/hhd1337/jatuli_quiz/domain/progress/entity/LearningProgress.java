package com.hhd1337.jatuli_quiz.domain.progress.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "learning_progress")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LearningProgress {

    public static final String SINGLE_USER_PROGRESS_KEY = "SINGLE_USER";

    @Id
    @Column(name = "progress_key", length = 50)
    private String progressKey;

    @Column(name = "completed_bookmarked_round_count", nullable = false)
    private Integer completedBookmarkedRoundCount;

    @Column(name = "current_bookmarked_round_no", nullable = false)
    private Integer currentBookmarkedRoundNo;

    private LearningProgress(
            String progressKey,
            Integer completedBookmarkedRoundCount,
            Integer currentBookmarkedRoundNo
    ) {
        this.progressKey = progressKey;
        this.completedBookmarkedRoundCount = completedBookmarkedRoundCount;
        this.currentBookmarkedRoundNo = currentBookmarkedRoundNo;
    }

    public static LearningProgress createSingleUserProgress() {
        return new LearningProgress(
                SINGLE_USER_PROGRESS_KEY,
                0,
                1
        );
    }

    public void completeCurrentBookmarkedRound() {
        if (this.completedBookmarkedRoundCount == null) {
            this.completedBookmarkedRoundCount = 0;
        }

        if (this.currentBookmarkedRoundNo == null) {
            this.currentBookmarkedRoundNo = 1;
        }

        this.completedBookmarkedRoundCount += 1;
        this.currentBookmarkedRoundNo += 1;
    }

    public int getLevel() {
        if (this.completedBookmarkedRoundCount == null) {
            return 1;
        }

        return this.completedBookmarkedRoundCount + 1;
    }
}
