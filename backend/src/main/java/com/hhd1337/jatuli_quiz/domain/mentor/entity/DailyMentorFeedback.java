package com.hhd1337.jatuli_quiz.domain.mentor.entity;

import com.hhd1337.jatuli_quiz.common.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DailyMentorFeedback extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate feedbackDate;

    @Lob
    private String promptSnapshot;

    @Lob
    private String feedbackContent;

    private LocalDateTime generatedAt;

    @Enumerated(EnumType.STRING)
    private MentorFeedbackSendStatus sendStatus;

    public DailyMentorFeedback(
            LocalDate feedbackDate,
            String promptSnapshot,
            String feedbackContent
    ) {
        this.feedbackDate = feedbackDate;
        this.promptSnapshot = promptSnapshot;
        this.feedbackContent = feedbackContent;
        this.generatedAt = LocalDateTime.now();
        this.sendStatus = MentorFeedbackSendStatus.NOT_SENT;
    }

    public void regenerate(String promptSnapshot, String feedbackContent) {
        this.promptSnapshot = promptSnapshot;
        this.feedbackContent = feedbackContent;
        this.generatedAt = LocalDateTime.now();
        this.sendStatus = MentorFeedbackSendStatus.NOT_SENT;
    }
}
