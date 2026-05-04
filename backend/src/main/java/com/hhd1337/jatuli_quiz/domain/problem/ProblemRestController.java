package com.hhd1337.jatuli_quiz.domain.problem;

import com.hhd1337.jatuli_quiz.common.response.ApiResponse;
import com.hhd1337.jatuli_quiz.domain.practice.dto.PracticeRequest;
import com.hhd1337.jatuli_quiz.domain.practice.dto.PracticeResponse;
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

    @Operation(
            summary = "북마크 문제 전체순회 풀이 문제 조회",
            description = """
                    서비스 전체 leaf 폴더에 존재하는 북마크 문제들을 순회하며 풀이 문제 목록을 제공합니다.
                    
                    현재 MVP에서는 단일 사용자 기준으로 Problem의 isBookmarked, solvedCount 값을 사용합니다.
                    북마크된 문제만 조회 대상에 포함하며, 북마크가 해제된 문제는 순회 대상에서 제외됩니다.
                    
                    순회 방식은 leaf 폴더 라운드로빈 방식입니다.
                    마지막으로 문제를 제공한 leaf 폴더 위치를 practice_cursor에 저장하고,
                    다음 요청 시 해당 폴더 다음 leaf 폴더부터 이어서 조회합니다.
                    
                    각 leaf 폴더에서는 solvedCount가 가장 낮은 문제를 우선 제공합니다.
                    solvedCount가 같으면 problemNum 오름차순, problemId 오름차순으로 정렬합니다.
                    
                    한 leaf 폴더당 최대 2문제씩 연속으로 제공한 뒤 다음 leaf 폴더로 넘어갑니다.
                    예: A1, A2, B1, B2, C1, C2
                    
                    cursor 갱신이 발생하므로 단순 조회가 아닌 POST 방식으로 제공합니다.
                    """
    )
    @PostMapping("/bookmarked/practice")
    public ApiResponse<PracticeResponse.GetBookmarkedPracticeProblemsResponse> getBookmarkedPracticeProblems(
            @RequestBody PracticeRequest.GetBookmarkedPracticeProblemsRequest request
    ) {
        return ApiResponse.onSuccess(problemCommandService.getBookmarkedPracticeProblems(request));
    }
}