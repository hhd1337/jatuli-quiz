package com.hhd1337.jatuli_quiz.domain.folder.service;

import com.hhd1337.jatuli_quiz.domain.folder.dto.FolderResponse;

public interface FolderQueryService {
    FolderResponse.FolderChildrenResponse getChildren(Long folderId);

    FolderResponse.PracticeResponse getPracticeProblems(Long folderId);
}
