package com.hhd1337.jatuli_quiz.domain.problem.service;

import com.hhd1337.jatuli_quiz.common.exception.GeneralException;
import com.hhd1337.jatuli_quiz.common.exception.code.status.ErrorStatus;
import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import com.hhd1337.jatuli_quiz.domain.folder.repository.FolderRepository;
import com.hhd1337.jatuli_quiz.domain.problem.converter.ProblemConverter;
import com.hhd1337.jatuli_quiz.domain.problem.dto.ProblemCopyResponse;
import com.hhd1337.jatuli_quiz.domain.problem.entity.Problem;
import com.hhd1337.jatuli_quiz.domain.problem.repository.ProblemRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProblemQueryServiceImpl implements ProblemQueryService {

    private final ProblemRepository problemRepository;
    private final FolderRepository folderRepository;

    @Override
    public ProblemCopyResponse.CopyProblemsResponse getProblemsForCopy(Long folderId) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new GeneralException(ErrorStatus.FOLDER_NOT_FOUND));

        List<Long> folderIds = new ArrayList<>();
        collectFolderIds(folder.getFolderId(), folderIds);

        List<Problem> problems = problemRepository.findAllByFolderIdsForCopy(folderIds);

        return ProblemConverter.toCopyProblemsResponse(folder.getFolderId(), problems);
    }

    private void collectFolderIds(Long folderId, List<Long> folderIds) {
        folderIds.add(folderId);

        List<Folder> childFolders = folderRepository.findAllByParentFolder_FolderId(folderId);

        for (Folder childFolder : childFolders) {
            collectFolderIds(childFolder.getFolderId(), folderIds);
        }
    }
}