package com.hhd1337.jatuli_quiz.domain.problem;

import com.hhd1337.jatuli_quiz.common.response.ApiResponse;
import com.hhd1337.jatuli_quiz.domain.problem.dto.ProblemBookmarkResponse;
import com.hhd1337.jatuli_quiz.domain.problem.dto.ProblemImportRequest;
import com.hhd1337.jatuli_quiz.domain.problem.dto.ProblemImportResponse;
import com.hhd1337.jatuli_quiz.domain.problem.service.ProblemCommandService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

    @Operation(
            summary = "문제 문자열 일괄 등록",
            description = """
                    GPT가 생성한 문제 문자열을 받아 problem 테이블에 일괄 저장합니다.
                    요청 본문에는 folderId와 rawText를 포함해야 합니다.
                    rawText는 다음 포맷을 따릅니다.
                    
                    ### 문제 1
                    문제 본문
                    
                    해설
                    해설 본문
                    
                    정답
                    정답 본문
                    
                    ---
                    
                    여러 문제가 위 형식으로 반복되면 모두 파싱하여 저장합니다.
                    저장 시 problem_num은 해당 폴더 내 마지막 문제 번호 다음 번호부터 순차 부여합니다.
                    """
    )
    @PostMapping(value = "/import/text", consumes = "text/plain")
    public ApiResponse<ProblemImportResponse.ImportProblemsFromTextResponse> importProblemsFromText(
            @RequestParam Long folderId,
            @RequestBody String rawText
    ) {
        ProblemImportRequest.ImportProblemsFromTextRequest request =
                new ProblemImportRequest.ImportProblemsFromTextRequest(folderId, rawText);

        return ApiResponse.onSuccess(problemCommandService.importProblemsFromText(request));
    }
}