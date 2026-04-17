package com.hhd1337.jatuli_quiz.domain.folder.converter;

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
}