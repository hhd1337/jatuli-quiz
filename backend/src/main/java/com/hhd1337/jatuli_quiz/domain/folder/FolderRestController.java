package com.hhd1337.jatuli_quiz.domain.folder;

import com.hhd1337.jatuli_quiz.common.response.ApiResponse;
import com.hhd1337.jatuli_quiz.domain.folder.dto.FolderResponse.FolderChildrenResponse;
import com.hhd1337.jatuli_quiz.domain.folder.dto.FolderResponse.PracticeResponse;
import com.hhd1337.jatuli_quiz.domain.folder.service.FolderQueryService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/folders")
@RequiredArgsConstructor
public class FolderRestController {
    private final FolderQueryService folderQueryService;

    @Operation(
            summary = "폴더 하위 목록 조회",
            description = """
                    특정 folderId를 기준으로 현재 폴더의 직계 하위 폴더 목록을 조회합니다.
                    응답에는 breadcrumb와 자식 폴더 목록이 포함됩니다.
                    """
    )
    @GetMapping("/{folderId}/children")
    public ApiResponse<FolderChildrenResponse> getChildren(@PathVariable Long folderId) {
        return ApiResponse.onSuccess(folderQueryService.getChildren(folderId));
    }

    @Operation(
            summary = "폴더 연습 문제 조회",
            description = """
                    특정 folderId를 기준으로 연습용 문제 목록을 조회합니다.
                    practice API는 leaf 폴더에서만 호출할 수 있습니다.
                    현재 MVP에서는 해당 폴더에 포함된 모든 문제를 그대로 반환합니다.
                    각 문제에는 문제 번호, 질문, 답, 해설과 함께 meta 정보(attemptCount, isBookmarked)가 포함됩니다.
                    폴더에 문제가 없는 경우에도 200 OK로 빈 배열을 반환합니다.
                    """
    )
    @GetMapping("/{folderId}/practice")
    public ApiResponse<PracticeResponse> getPracticeProblems(@PathVariable Long folderId) {
        return ApiResponse.onSuccess(folderQueryService.getPracticeProblems(folderId));
    }
}
