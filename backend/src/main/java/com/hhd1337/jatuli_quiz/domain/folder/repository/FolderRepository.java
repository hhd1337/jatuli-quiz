package com.hhd1337.jatuli_quiz.domain.folder.repository;

import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FolderRepository extends JpaRepository<Folder, Long> {

    List<Folder> findByParentFolder_FolderIdOrderBySortOrderAscFolderIdAsc(Long parentFolderId);

    List<Folder> findAllByParentFolder_FolderIdOrderBySortOrderAscFolderIdAsc(Long parentFolderId);

    boolean existsByParentFolder(Folder parentFolder);

    Optional<Folder> findByFolderId(Long folderId);

    boolean existsByParentFolder_FolderId(Long folderId);

    boolean existsByParentFolder_FolderIdAndName(Long parentFolderId, String name);

    boolean existsByParentFolder_FolderIdAndNameAndFolderIdNot(
            Long parentFolderId,
            String name,
            Long folderId
    );

    @Query("""
            select coalesce(max(f.sortOrder), 0)
            from Folder f
            where f.parentFolder.folderId = :parentFolderId
            """)
    Integer findMaxSortOrderByParentFolderId(@Param("parentFolderId") Long parentFolderId);

    List<Folder> findAllByParentFolder_FolderId(Long parentFolderId);

    @Query("""
            select f
            from Folder f
            where lower(f.name) like lower(concat('%', :query, '%'))
              and not exists (
                  select 1
                  from Folder child
                  where child.parentFolder = f
              )
            order by f.name asc
            """)
    List<Folder> searchLeafFoldersByName(@Param("query") String query);

}