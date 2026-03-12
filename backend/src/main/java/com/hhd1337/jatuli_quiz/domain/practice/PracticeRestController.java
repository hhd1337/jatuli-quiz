package com.hhd1337.jatuli_quiz.domain.practice;

import com.hhd1337.jatuli_quiz.common.response.ApiResponse;
import com.hhd1337.jatuli_quiz.domain.practice.dto.PracticeResponse;
import com.hhd1337.jatuli_quiz.domain.practice.service.PracticeQueryService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/practice")
@RequiredArgsConstructor
public class PracticeRestController {

    private final PracticeQueryService practiceQueryService;

    @Operation(
            summary = "북마크 문제 연습 세트 조회",
            description = """
                    사용자가 북마크한 문제들만 모아 연습 세트로 반환합니다.
                    현재 MVP에서는 북마크된 문제들을 attemptCount(solvedCount) 오름차순으로 정렬하여 반환합니다.
                    응답 형식은 selectionRule, problems 배열로 통일합니다.
                    북마크된 문제가 없으면 빈 배열을 반환합니다.
                    """
    )
    @PostMapping("/bookmarks")
    public ApiResponse<PracticeResponse.GetPracticeProblemsResponse> getBookmarkedPracticeProblems() {
        return ApiResponse.onSuccess(practiceQueryService.getBookmarkedPracticeProblems());
    }
}