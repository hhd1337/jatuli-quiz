package com.hhd1337.jatuli_quiz.domain.folder.service;

import com.hhd1337.jatuli_quiz.common.exception.GeneralException;
import com.hhd1337.jatuli_quiz.common.exception.code.status.ErrorStatus;
import com.hhd1337.jatuli_quiz.common.exception.handler.FolderHandler;
import com.hhd1337.jatuli_quiz.domain.folder.converter.FolderConverter;
import com.hhd1337.jatuli_quiz.domain.folder.dto.FolderResponse.FolderChildrenResponse;
import com.hhd1337.jatuli_quiz.domain.folder.dto.FolderResponse.PracticeProblemDto;
import com.hhd1337.jatuli_quiz.domain.folder.dto.FolderResponse.PracticeResponse;
import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import com.hhd1337.jatuli_quiz.domain.folder.repository.FolderRepository;
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
public class FolderQueryServiceImpl implements FolderQueryService {

    private static final String SELECTION_RULE_ALL = "ALL";

    private final FolderRepository folderRepository;
    private final ProblemRepository problemRepository;

    @Override
    public FolderChildrenResponse getChildren(Long folderId) {
        Folder currentFolder = folderRepository.findById(folderId)
                .orElseThrow(() -> new FolderHandler(ErrorStatus.FOLDER_NOT_FOUND));

        List<FolderChildrenResponse.BreadcrumbDTO> breadcrumb = buildBreadcrumb(currentFolder);

        List<Folder> childFolders = folderRepository.findByParentFolder_FolderIdOrderByFolderIdAsc(folderId);

        List<FolderChildrenResponse.FolderDTO> folders = childFolders.stream()
                .map(this::toFolderDTO)
                .toList();

        return FolderConverter.toFolderChildrenResponse(breadcrumb, folders);
    }

    private List<FolderChildrenResponse.BreadcrumbDTO> buildBreadcrumb(Folder currentFolder) {
        List<FolderChildrenResponse.BreadcrumbDTO> breadcrumb = new ArrayList<>();

        Folder cursor = currentFolder;
        while (cursor != null) {
            breadcrumb.add(0, FolderConverter.toBreadcrumbDTO(cursor));
            cursor = cursor.getParentFolder();
        }

        return breadcrumb;
    }

    private FolderChildrenResponse.FolderDTO toFolderDTO(Folder folder) {
        boolean hasChildren = folderRepository.existsByParentFolder(folder);
        FolderStats stats = calculateFolderStats(folder);

        return FolderConverter.toFolderDTO(
                folder,
                stats.solved(),
                stats.total(),
                hasChildren
        );
    }

    private FolderStats calculateFolderStats(Folder folder) {
        int total = problemRepository.countByFolder(folder);
        int solved = problemRepository.countByFolderAndSolvedCountGreaterThan(folder, 0);

        List<Folder> children = folderRepository.findByParentFolder_FolderIdOrderByFolderIdAsc(folder.getFolderId());

        for (Folder child : children) {
            FolderStats childStats = calculateFolderStats(child);
            total += childStats.total();
            solved += childStats.solved();
        }

        return new FolderStats(total, solved);
    }

    @Override
    public PracticeResponse getPracticeProblems(Long folderId) {
        Folder folder = folderRepository.findByFolderId(folderId)
                .orElseThrow(() -> new GeneralException(ErrorStatus.FOLDER_NOT_FOUND));

        boolean hasChildren = folderRepository.existsByParentFolder_FolderId(folderId);
        if (hasChildren) {
            throw new GeneralException(ErrorStatus.FOLDER_NOT_LEAF);
        }

        List<Problem> problems = problemRepository.findAllByFolder_FolderIdOrderByProblemNumAsc(folderId);

        List<PracticeProblemDto> problemDtos = problems.stream()
                .map(FolderConverter::toPracticeProblemDto)
                .toList();

        return FolderConverter.toPracticeResponse(SELECTION_RULE_ALL, problemDtos);
    }

    private record FolderStats(int total, int solved) {
    }
}