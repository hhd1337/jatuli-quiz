package com.hhd1337.jatuli_quiz.domain.routine.entity;

import com.hhd1337.jatuli_quiz.common.entity.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DailyRoutine extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate routineDate;

    private LocalDateTime plannedAt;

    private LocalDateTime lastModifiedAt;

    @OneToMany(mappedBy = "dailyRoutine", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder asc")
    private List<RoutinePeriod> periods = new ArrayList<>();

    public DailyRoutine(LocalDate routineDate) {
        LocalDateTime now = LocalDateTime.now();

        this.routineDate = routineDate;
        this.plannedAt = now;
        this.lastModifiedAt = now;
    }

    public void replacePeriods(List<RoutinePeriod> newPeriods) {
        this.periods.clear();

        for (RoutinePeriod period : newPeriods) {
            period.setDailyRoutine(this);
            this.periods.add(period);
        }

        this.lastModifiedAt = LocalDateTime.now();
    }
}
