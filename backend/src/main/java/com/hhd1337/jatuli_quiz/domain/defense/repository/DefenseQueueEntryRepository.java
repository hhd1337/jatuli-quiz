package com.hhd1337.jatuli_quiz.domain.defense.repository;

import com.hhd1337.jatuli_quiz.domain.defense.entity.DefenseQueueEntry;
import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface DefenseQueueEntryRepository extends JpaRepository<DefenseQueueEntry, Long> {

    @Query("""
            select e
            from DefenseQueueEntry e
            join fetch e.folder f
            order by e.queueOrder asc
            """)
    List<DefenseQueueEntry> findAllOrderByQueueOrderAsc();

    boolean existsByFolder(Folder folder);

    Optional<DefenseQueueEntry> findByFolder_FolderId(Long folderId);

    @Query("select coalesce(max(e.queueOrder), 0) from DefenseQueueEntry e")
    Integer findMaxQueueOrder();
}
