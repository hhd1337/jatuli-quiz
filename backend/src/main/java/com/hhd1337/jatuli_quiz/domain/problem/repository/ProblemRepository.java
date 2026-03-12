package com.hhd1337.jatuli_quiz.domain.problem.repository;

import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import com.hhd1337.jatuli_quiz.domain.problem.entity.Problem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProblemRepository extends JpaRepository<Problem, Long> {
    int countByFolder(Folder folder);

    int countByFolderAndSolvedCountGreaterThan(Folder folder, Integer solvedCount);

    List<Problem> findAllByFolder_FolderIdOrderByProblemNumAsc(Long folderId);

    @Query("select coalesce(sum(p.solvedCount), 0) from Problem p")
    Integer sumSolvedCount();

    @Query("""
                select count(p)
                from Problem p
                where p.folder.folderId = :folderId
                  and p.solvedCount > 0
            """)
    Integer countSolvedProblemsByFolderId(Long folderId);

    List<Problem> findAllByIsBookmarkedTrueOrderBySolvedCountAscProblemIdAsc();

    @Query("""
            select p
            from Problem p
            where p.isBookmarked = true
            order by coalesce(p.solvedCount, 0) asc, p.problemId asc
            """)
    List<Problem> findBookmarkedProblemsOrderByAttemptCountAsc();
}