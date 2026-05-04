package com.hhd1337.jatuli_quiz.domain.practice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "practice_cursor")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PracticeCursor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cursor_id")
    private Long cursorId;

    @Enumerated(EnumType.STRING)
    @Column(name = "cursor_type", nullable = false, unique = true, length = 50)
    private PracticeCursorType cursorType;

    @Column(name = "last_leaf_folder_id")
    private Long lastLeafFolderId;

    protected PracticeCursor(
            PracticeCursorType cursorType,
            Long lastLeafFolderId
    ) {
        this.cursorType = cursorType;
        this.lastLeafFolderId = lastLeafFolderId;
    }

    public static PracticeCursor create(PracticeCursorType cursorType) {
        return new PracticeCursor(cursorType, null);
    }

    public void updateLastLeafFolderId(Long lastLeafFolderId) {
        this.lastLeafFolderId = lastLeafFolderId;
    }
}
