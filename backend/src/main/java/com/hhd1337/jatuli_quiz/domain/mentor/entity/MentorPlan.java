package com.hhd1337.jatuli_quiz.domain.mentor.entity;

import com.hhd1337.jatuli_quiz.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MentorPlan extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private MentorPlanType type;

    @Column(length = 5000)
    private String content;

    private Boolean active;

    public MentorPlan(MentorPlanType type, String content) {
        this.type = type;
        this.content = content;
        this.active = true;
    }

    public void updateContent(String content) {
        this.content = content;
    }

    public void deactivate() {
        this.active = false;
    }
}
