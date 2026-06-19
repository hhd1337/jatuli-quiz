package com.hhd1337.jatuli_quiz.domain.mentor.entity;

import com.hhd1337.jatuli_quiz.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DailyReflection extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate reflectionDate;

    @Column(length = 500)
    private String mood;

    @Column(length = 1000)
    private String good;

    @Column(length = 1000)
    private String regret;

    @Column(length = 3000)
    private String freeText;

    private LocalDateTime writtenAt;

    public DailyReflection(
            LocalDate reflectionDate,
            String mood,
            String good,
            String regret,
            String freeText
    ) {
        this.reflectionDate = reflectionDate;
        this.mood = mood;
        this.good = good;
        this.regret = regret;
        this.freeText = freeText;
        this.writtenAt = LocalDateTime.now();
    }

    public void update(
            String mood,
            String good,
            String regret,
            String freeText
    ) {
        this.mood = mood;
        this.good = good;
        this.regret = regret;
        this.freeText = freeText;
        this.writtenAt = LocalDateTime.now();
    }
}
