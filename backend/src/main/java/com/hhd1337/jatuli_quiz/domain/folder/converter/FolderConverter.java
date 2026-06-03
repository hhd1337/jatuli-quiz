package com.hhd1337.jatuli_quiz.domain.folder.converter;

import com.hhd1337.jatuli_quiz.domain.folder.dto.FolderResponse;
import com.hhd1337.jatuli_quiz.domain.folder.dto.FolderResponse.FolderChildrenResponse;
import com.hhd1337.jatuli_quiz.domain.folder.dto.FolderResponse.PracticeProblemDto;
import com.hhd1337.jatuli_quiz.domain.folder.dto.FolderResponse.PracticeProblemMetaDto;
import com.hhd1337.jatuli_quiz.domain.folder.dto.FolderResponse.PracticeResponse;
import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import com.hhd1337.jatuli_quiz.domain.problem.entity.Problem;
import java.util.List;

public class FolderConverter {

    private FolderConverter() {
    }

    public static FolderChildrenResponse toFolderChildrenResponse(
            List<FolderChildrenResponse.BreadcrumbDTO> breadcrumb,
            List<FolderChildrenResponse.FolderDTO> folders
    ) {
        return FolderChildrenResponse.builder()
                .breadcrumb(breadcrumb)
                .folders(folders)
                .build();
    }

    public static FolderChildrenResponse.BreadcrumbDTO toBreadcrumbDTO(Folder folder) {
        return FolderChildrenResponse.BreadcrumbDTO.builder()
                .folderId(folder.getFolderId())
                .name(folder.getName())
                .build();
    }

    public static FolderChildrenResponse.FolderDTO toFolderDTO(
            Folder folder,
            int solved,
            int total,
            boolean hasChildren
    ) {
        return FolderChildrenResponse.FolderDTO.builder()
                .folderId(folder.getFolderId())
                .name(folder.getName())
                .solved(solved)
                .total(total)
                .hasChildren(hasChildren)
                .sortOrder(folder.getSortOrder())
                .build();
    }

    public static PracticeResponse toPracticeResponse(
            String selectionRule,
            List<PracticeProblemDto> problems
    ) {
        return PracticeResponse.builder()
                .selectionRule(selectionRule)
                .problems(problems)
                .build();
    }

    public static PracticeProblemDto toPracticeProblemDto(Problem problem) {
        return PracticeProblemDto.builder()
                .problemId(problem.getProblemId())
                .problemNum(problem.getProblemNum())
                .question(problem.getQuestionText())
                .answer(problem.getAnswerText())
                .explanation(problem.getExplanationText())
                .meta(toPracticeProblemMetaDto(problem))
                .build();
    }

    public static PracticeProblemMetaDto toPracticeProblemMetaDto(Problem problem) {
        return PracticeProblemMetaDto.builder()
                .attemptCount(problem.getSolvedCount())
                .isBookmarked(problem.getIsBookmarked())
                .build();
    }

    public static FolderResponse.CreateFolderResponse toCreateFolderResponse(Folder folder) {
        return FolderResponse.CreateFolderResponse.builder()
                .folderId(folder.getFolderId())
                .parentFolderId(folder.getParentFolder().getFolderId())
                .name(folder.getName())
                .fullPath(folder.getFullPath())
                .depth(folder.getDepth())
                .problemCount(folder.getProblemCount())
                .build();
    }

    public static FolderResponse.RenameFolderResponse toRenameFolderResponse(Folder folder) {
        return FolderResponse.RenameFolderResponse.builder()
                .folderId(folder.getFolderId())
                .parentFolderId(folder.getParentFolder().getFolderId())
                .name(folder.getName())
                .fullPath(folder.getFullPath())
                .depth(folder.getDepth())
                .build();
    }

    public static FolderResponse.DeleteFolderResponse toDeleteFolderResponse(Long folderId) {
        return FolderResponse.DeleteFolderResponse.builder()
                .folderId(folderId)
                .build();
    }

    public static FolderResponse.ReorderFoldersResponse toReorderFoldersResponse(
            Long parentFolderId,
            List<Folder> folders
    ) {
        List<FolderResponse.ReorderFoldersResponse.ReorderedFolderDTO> folderDtos =
                folders.stream()
                        .map(folder -> FolderResponse.ReorderFoldersResponse.ReorderedFolderDTO.builder()
                                .folderId(folder.getFolderId())
                                .name(folder.getName())
                                .sortOrder(folder.getSortOrder())
                                .build())
                        .toList();

        return FolderResponse.ReorderFoldersResponse.builder()
                .parentFolderId(parentFolderId)
                .folders(folderDtos)
                .build();
    }
}