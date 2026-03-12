package com.hhd1337.jatuli_quiz.domain.problem;

import com.hhd1337.jatuli_quiz.common.response.ApiResponse;
import com.hhd1337.jatuli_quiz.domain.problem.dto.ProblemBookmarkResponse;
import com.hhd1337.jatuli_quiz.domain.problem.service.ProblemCommandService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/problems")
@RequiredArgsConstructor
public class ProblemRestController {

    private final ProblemCommandService problemCommandService;

    @Operation(
            summary = "문제 북마크 토글",
            description = """
                    문제 상세/풀이 화면에서 북마크 아이콘 클릭 시 북마크 상태를 토글합니다.
                    현재 MVP에서는 단일 사용자 기준으로 Problem의 isBookmarked 값을 직접 변경합니다.
                    호출할 때마다 true/false가 반전되며, 최신 isBookmarked 값을 반환합니다.
                    존재하지 않는 problemId 요청 시 예외를 반환합니다.
                    """
    )
    @PostMapping("/{problemId}/bookmark")
    public ApiResponse<ProblemBookmarkResponse.ToggleBookmarkResponse> toggleBookmark(
            @PathVariable Long problemId
    ) {
        return ApiResponse.onSuccess(problemCommandService.toggleBookmark(problemId));
    }
}