package com.hhd1337.jatuli_quiz.domain.folder.service;

import com.hhd1337.jatuli_quiz.domain.folder.dto.FolderRequest;
import com.hhd1337.jatuli_quiz.domain.folder.dto.FolderResponse;

public interface FolderCommandService {

    FolderResponse.CreateFolderResponse createFolder(
            FolderRequest.CreateFolderRequest request
    );

    FolderResponse.RenameFolderResponse renameFolder(
            Long folderId,
            FolderRequest.RenameFolderRequest request
    );

    FolderResponse.DeleteFolderResponse deleteFolder(Long folderId);

    FolderResponse.ReorderFoldersResponse reorderChildFolders(
            Long parentFolderId,
            FolderRequest.ReorderFoldersRequest request
    );
}
