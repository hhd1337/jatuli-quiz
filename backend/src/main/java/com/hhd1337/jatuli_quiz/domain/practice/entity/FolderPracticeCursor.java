package com.hhd1337.jatuli_quiz.domain.practice.entity;

import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "folder_practice_cursor",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_folder_practice_cursor_folder_id",
                        columnNames = "folder_id"
                )
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FolderPracticeCursor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cursor_id")
    private Long cursorId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id", nullable = false)
    private Folder folder;

    @Column(name = "next_problem_id")
    private Long nextProblemId;

    @Column(name = "last_submitted_problem_id")
    private Long lastSubmittedProblemId;

    private FolderPracticeCursor(
            Folder folder,
            Long nextProblemId,
            Long lastSubmittedProblemId
    ) {
        this.folder = folder;
        this.nextProblemId = nextProblemId;
        this.lastSubmittedProblemId = lastSubmittedProblemId;
    }

    public static FolderPracticeCursor create(Folder folder, Long nextProblemId) {
        return new FolderPracticeCursor(
                folder,
                nextProblemId,
                null
        );
    }

    public void updateCursor(Long submittedProblemId, Long nextProblemId) {
        this.lastSubmittedProblemId = submittedProblemId;
        this.nextProblemId = nextProblemId;
    }

    public void resetToFirstProblem(Long firstProblemId) {
        this.lastSubmittedProblemId = null;
        this.nextProblemId = firstProblemId;
    }
}