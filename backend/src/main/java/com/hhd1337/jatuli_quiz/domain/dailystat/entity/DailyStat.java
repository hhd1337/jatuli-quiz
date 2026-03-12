package com.hhd1337.jatuli_quiz.domain.dailystat.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "daily_stat")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DailyStat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "daily_stat_id")
    private Long dailyStatId;

    @Column(name = "stat_date")
    private LocalDate statDate;

    @Column(name = "solved_count")
    private Integer solvedCount;

    @Column(name = "focus_seconds")
    private Integer focusSeconds;

    @Column(name = "accumulated_focus_seconds")
    private Long accumulatedFocusSeconds;

    @Column(name = "days_in_a_row")
    private Integer daysInARow;

    public DailyStat(
            LocalDate statDate,
            Integer solvedCount,
            Integer focusSeconds,
            Long accumulatedFocusSeconds,
            Integer daysInARow
    ) {
        this.statDate = statDate;
        this.solvedCount = solvedCount;
        this.focusSeconds = focusSeconds;
        this.accumulatedFocusSeconds = accumulatedFocusSeconds;
        this.daysInARow = daysInARow;
    }

    public static DailyStat createFirstSubmissionOfDay(
            LocalDate statDate,
            int elapsedSeconds,
            long previousAccumulatedFocusSeconds,
            int daysInARow
    ) {
        return new DailyStat(
                statDate,
                1,
                elapsedSeconds,
                previousAccumulatedFocusSeconds + elapsedSeconds,
                daysInARow
        );
    }

    public void applySubmission(int elapsedSeconds) {
        if (this.solvedCount == null) {
            this.solvedCount = 0;
        }
        if (this.focusSeconds == null) {
            this.focusSeconds = 0;
        }
        if (this.accumulatedFocusSeconds == null) {
            this.accumulatedFocusSeconds = 0L;
        }

        this.solvedCount += 1;
        this.focusSeconds += elapsedSeconds;
        this.accumulatedFocusSeconds += elapsedSeconds;
    }
}