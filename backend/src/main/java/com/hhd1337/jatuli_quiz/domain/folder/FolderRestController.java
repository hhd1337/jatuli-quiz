package com.hhd1337.jatuli_quiz.domain.folder;

import com.hhd1337.jatuli_quiz.common.response.ApiResponse;
import com.hhd1337.jatuli_quiz.domain.folder.dto.FolderRequest;
import com.hhd1337.jatuli_quiz.domain.folder.dto.FolderResponse;
import com.hhd1337.jatuli_quiz.domain.folder.dto.FolderResponse.FolderChildrenResponse;
import com.hhd1337.jatuli_quiz.domain.folder.dto.FolderResponse.PracticeResponse;
import com.hhd1337.jatuli_quiz.domain.folder.service.FolderCommandService;
import com.hhd1337.jatuli_quiz.domain.folder.service.FolderQueryService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/folders")
@RequiredArgsConstructor
public class FolderRestController {
    private final FolderQueryService folderQueryService;
    private final FolderCommandService folderCommandService;

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

    @Operation(
            summary = "폴더 추가",
            description = """
                    특정 부모 폴더 아래에 새로운 하위 폴더를 생성합니다.
                    
                    홈 화면에서 바로 보이는 폴더들(예: 자바, 스프링, JPA, DB, 도커)은
                    루트 폴더의 바로 아래 자식 폴더입니다.
                    따라서 해당 폴더들을 생성하려면 parentFolderId로 루트 폴더 ID인 1을 전달합니다.
                    
                    부모 폴더가 존재하지 않으면 폴더 생성을 차단합니다.
                    같은 부모 폴더 아래에 동일한 이름의 자식 폴더가 이미 존재하는 경우에도 폴더 생성을 차단합니다.
                    """
    )
    @PostMapping
    public ApiResponse<FolderResponse.CreateFolderResponse> createFolder(
            @Valid @RequestBody FolderRequest.CreateFolderRequest request
    ) {
        return ApiResponse.onSuccess(folderCommandService.createFolder(request));
    }

    @Operation(
            summary = "폴더 이름 변경",
            description = """
                    특정 폴더의 이름을 변경합니다.
                    루트 폴더는 이름을 변경할 수 없습니다.
                    같은 부모 폴더 아래에 동일한 이름의 폴더가 이미 존재하면 변경을 차단합니다.
                    폴더 이름 변경 시 해당 폴더와 하위 폴더들의 fullPath도 함께 갱신됩니다.
                    """
    )
    @PatchMapping("/{folderId}/name")
    public ApiResponse<FolderResponse.RenameFolderResponse> renameFolder(
            @PathVariable Long folderId,
            @Valid @RequestBody FolderRequest.RenameFolderRequest request
    ) {
        return ApiResponse.onSuccess(
                folderCommandService.renameFolder(folderId, request)
        );
    }

    @Operation(
            summary = "폴더 삭제",
            description = """
                    특정 폴더를 삭제합니다.
                    루트 폴더는 삭제할 수 없습니다.
                    현재 정책에서는 하위 폴더나 문제가 존재하는 폴더는 삭제할 수 없습니다.
                    """
    )
    @DeleteMapping("/{folderId}")
    public ApiResponse<FolderResponse.DeleteFolderResponse> deleteFolder(
            @PathVariable Long folderId
    ) {
        return ApiResponse.onSuccess(
                folderCommandService.deleteFolder(folderId)
        );
    }

    @Operation(
            summary = "하위 폴더 순서 변경",
            description = """
                    특정 부모 폴더 아래의 직계 하위 폴더 순서를 변경합니다.
                    orderedFolderIds에는 해당 부모 폴더의 직계 자식 폴더 ID 전체를 원하는 순서대로 전달해야 합니다.
                    다른 부모에 속한 폴더 ID가 포함되거나, 누락/중복된 ID가 있으면 요청을 차단합니다.
                    """
    )
    @PatchMapping("/{parentFolderId}/children/order")
    public ApiResponse<FolderResponse.ReorderFoldersResponse> reorderChildFolders(
            @PathVariable Long parentFolderId,
            @Valid @RequestBody FolderRequest.ReorderFoldersRequest request
    ) {
        return ApiResponse.onSuccess(
                folderCommandService.reorderChildFolders(parentFolderId, request)
        );
    }
}
