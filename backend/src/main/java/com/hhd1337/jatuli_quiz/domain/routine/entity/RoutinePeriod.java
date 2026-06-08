package com.hhd1337.jatuli_quiz.domain.routine.entity;

import com.hhd1337.jatuli_quiz.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import java.time.LocalDateTime;
import java.time.LocalTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RoutinePeriod extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String label;

    private LocalTime startTime;

    private LocalTime endTime;

    @Column(length = 1000)
    private String taskContent;

    private Integer sortOrder;

    @Enumerated(EnumType.STRING)
    private RoutinePeriodType type;

    @Enumerated(EnumType.STRING)
    private RoutinePeriodStatus status;

    private LocalDateTime completedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "daily_routine_id")
    private DailyRoutine dailyRoutine;

    public RoutinePeriod(
            String label,
            LocalTime startTime,
            LocalTime endTime,
            String taskContent,
            Integer sortOrder,
            RoutinePeriodType type
    ) {
        this.label = label;
        this.startTime = startTime;
        this.endTime = endTime;
        this.taskContent = taskContent;
        this.sortOrder = sortOrder;
        this.type = type;
        this.status = RoutinePeriodStatus.PENDING;
    }

    public void setDailyRoutine(DailyRoutine dailyRoutine) {
        this.dailyRoutine = dailyRoutine;
    }

    public void complete() {
        this.status = RoutinePeriodStatus.COMPLETED;
        this.completedAt = LocalDateTime.now();
    }

    public void skip() {
        this.status = RoutinePeriodStatus.SKIPPED;
    }

    public void resetToPending() {
        this.status = RoutinePeriodStatus.PENDING;
        this.completedAt = null;
    }
}
