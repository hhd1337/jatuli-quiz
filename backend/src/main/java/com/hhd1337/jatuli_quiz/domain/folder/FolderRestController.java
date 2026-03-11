package com.hhd1337.jatuli_quiz.domain.folder;

import com.hhd1337.jatuli_quiz.common.response.ApiResponse;
import com.hhd1337.jatuli_quiz.domain.folder.dto.FolderResponse.FolderChildrenResponse;
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
}
