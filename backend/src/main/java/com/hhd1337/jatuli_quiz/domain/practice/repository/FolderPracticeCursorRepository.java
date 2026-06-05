package com.hhd1337.jatuli_quiz.domain.practice.repository;

import com.hhd1337.jatuli_quiz.domain.practice.entity.FolderPracticeCursor;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FolderPracticeCursorRepository extends JpaRepository<FolderPracticeCursor, Long> {

    Optional<FolderPracticeCursor> findByFolder_FolderId(Long folderId);
}