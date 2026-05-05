package com.hhd1337.jatuli_quiz.domain.problem.repository;

import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import com.hhd1337.jatuli_quiz.domain.problem.entity.Problem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Query("""
            select p
            from Problem p
            where p.isBookmarked = true
            order by coalesce(p.solvedCount, 0) asc, p.problemId asc
            """)
    List<Problem> findBookmarkedProblemsOrderByAttemptCountAsc();

    Optional<Problem> findTopByFolder_FolderIdOrderByProblemNumDesc(Long folderId);

    @Query("""
            select distinct f
            from Problem p
            join p.folder f
            where p.isBookmarked = true
              and not exists (
                  select 1
                  from Folder child
                  where child.parentFolder = f
              )
            order by f.folderId asc
            """)
    List<Folder> findLeafFoldersHavingBookmarkedProblemsOrderByFolderIdAsc();

    @Query("""
            select p
            from Problem p
            join fetch p.folder f
            where f.folderId = :folderId
              and p.isBookmarked = true
            order by coalesce(p.solvedCount, 0) asc,
                     p.problemNum asc,
                     p.problemId asc
            """)
    List<Problem> findBookmarkedProblemsByFolderIdForPractice(
            @Param("folderId") Long folderId,
            Pageable pageable
    );

    int countByIsBookmarkedTrue();

    int countByIsBookmarkedTrueAndLastPracticedBookmarkedRoundNo(Integer roundNo);
}