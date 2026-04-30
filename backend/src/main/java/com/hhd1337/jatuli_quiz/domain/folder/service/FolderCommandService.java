package com.hhd1337.jatuli_quiz.domain.folder.service;

import com.hhd1337.jatuli_quiz.domain.folder.dto.FolderRequest;
import com.hhd1337.jatuli_quiz.domain.folder.dto.FolderResponse;

public interface FolderCommandService {

    FolderResponse.CreateFolderResponse createFolder(
            FolderRequest.CreateFolderRequest request
    );
}
