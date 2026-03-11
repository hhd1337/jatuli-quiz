package com.hhd1337.jatuli_quiz.domain.problem.repository;

import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import com.hhd1337.jatuli_quiz.domain.problem.entity.Problem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProblemRepository extends JpaRepository<Problem, Long> {
    int countByFolder(Folder folder);

    int countByFolderAndSolvedCountGreaterThan(Folder folder, Integer solvedCount);
}