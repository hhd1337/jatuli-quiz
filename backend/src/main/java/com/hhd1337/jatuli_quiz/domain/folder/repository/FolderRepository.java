package com.hhd1337.jatuli_quiz.domain.folder.repository;

import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FolderRepository extends JpaRepository<Folder, Long> {
    List<Folder> findByParentFolder_FolderIdOrderByFolderIdAsc(Long parentFolderId);

    boolean existsByParentFolder(Folder parentFolder);

    Optional<Folder> findByFolderId(Long folderId);

    boolean existsByParentFolder_FolderId(Long folderId);

    List<Folder> findAllByParentFolder_FolderIdOrderByFolderIdAsc(Long parentFolderId);
    
}