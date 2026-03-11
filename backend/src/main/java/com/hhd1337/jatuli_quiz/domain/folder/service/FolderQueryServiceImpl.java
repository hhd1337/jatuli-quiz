package com.hhd1337.jatuli_quiz.domain.folder.service;

import com.hhd1337.jatuli_quiz.common.exception.code.status.ErrorStatus;
import com.hhd1337.jatuli_quiz.common.exception.handler.FolderHandler;
import com.hhd1337.jatuli_quiz.domain.folder.dto.FolderResponse.FolderChildrenResponse;
import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import com.hhd1337.jatuli_quiz.domain.folder.repository.FolderRepository;
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

        return FolderChildrenResponse.builder()
                .breadcrumb(breadcrumb)
                .folders(folders)
                .build();
    }

    private List<FolderChildrenResponse.BreadcrumbDTO> buildBreadcrumb(Folder currentFolder) {
        List<FolderChildrenResponse.BreadcrumbDTO> breadcrumb = new ArrayList<>();

        Folder cursor = currentFolder;
        while (cursor != null) {
            breadcrumb.add(0, FolderChildrenResponse.BreadcrumbDTO.builder()
                    .folderId(cursor.getFolderId())
                    .name(cursor.getName())
                    .build());

            cursor = cursor.getParentFolder();
        }

        return breadcrumb;
    }

    private FolderChildrenResponse.FolderDTO toFolderDTO(Folder folder) {
        int total = problemRepository.countByFolder(folder);
        int solved = problemRepository.countByFolderAndSolvedCountGreaterThan(folder, 0);
        boolean hasChildren = folderRepository.existsByParentFolder(folder);

        return FolderChildrenResponse.FolderDTO.builder()
                .folderId(folder.getFolderId())
                .name(folder.getName())
                .solved(solved)
                .total(total)
                .hasChildren(hasChildren)
                .build();
    }
}