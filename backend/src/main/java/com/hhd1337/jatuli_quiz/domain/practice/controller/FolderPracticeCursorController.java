package com.hhd1337.jatuli_quiz.domain.practice.controller;

import com.hhd1337.jatuli_quiz.common.response.ApiResponse;
import com.hhd1337.jatuli_quiz.domain.practice.dto.FolderPracticeCursorResponse;
import com.hhd1337.jatuli_quiz.domain.practice.service.FolderPracticeCursorService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class FolderPracticeCursorController {

    private final FolderPracticeCursorService folderPracticeCursorService;

    @Operation(
            summary = "폴더별 문제풀이 진행 커서 조회",
            description = """
                    특정 폴더의 문제풀이 진행 커서를 조회합니다.
                    
                    폴더별 문제풀이에서 사용자가 이전에 제출한 기록이 있는 경우,
                    다음에 이어서 풀 문제의 위치 정보를 반환합니다.
                    
                    프론트엔드는 이 API 응답의 hasCursor 값을 기준으로
                    사용자에게 "이어서 풀까요?" 알림창을 표시할 수 있습니다.
                    
                    - hasCursor가 false이면 저장된 진행 위치가 없으므로 1번 문제부터 시작합니다.
                    - hasCursor가 true이면 nextProblemIndex 또는 nextProblemNumber를 기준으로 이어서 풀 수 있습니다.
                    - 북마크 문제 전체 순회는 별도 학습 흐름이므로 이 커서 조회 대상에 포함되지 않습니다.
                    """
    )
    @GetMapping("/api/v1/folders/{folderId}/practice-cursor")
    public ApiResponse<FolderPracticeCursorResponse> getFolderPracticeCursor(
            @PathVariable Long folderId
    ) {
        FolderPracticeCursorResponse response = folderPracticeCursorService.getCursor(folderId);

        return ApiResponse.onSuccess(response);
    }
}