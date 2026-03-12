package com.hhd1337.jatuli_quiz.domain.problemsubmission;

import com.hhd1337.jatuli_quiz.common.response.ApiResponse;
import com.hhd1337.jatuli_quiz.domain.problemsubmission.dto.ProblemSubmissionRequest;
import com.hhd1337.jatuli_quiz.domain.problemsubmission.dto.ProblemSubmissionResponse;
import com.hhd1337.jatuli_quiz.domain.problemsubmission.service.ProblemSubmissionCommandService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/problem-submissions")
@RequiredArgsConstructor
public class ProblemSubmissionRestController {

    private final ProblemSubmissionCommandService problemSubmissionCommandService;

    @Operation(
            summary = "문제 제출 결과 저장",
            description = """
                    한 문제를 풀었을 때의 제출 결과를 저장합니다.
                    problemId는 필수이며, isCorrect와 elapsedSeconds는 선택값입니다.
                    제출 시 problem의 attemptCount(solvedCount)를 1 증가시키고,
                    DailyStat의 오늘 solvedCount / focusSeconds / accumulatedFocusSeconds를 함께 갱신합니다.
                    오늘 첫 제출인 경우 daysInARow도 함께 갱신합니다.
                    """
    )
    @PostMapping
    public ApiResponse<ProblemSubmissionResponse.CreateProblemSubmissionResponse> submit(
            @Valid @RequestBody ProblemSubmissionRequest.CreateProblemSubmissionRequest request
    ) {
        return ApiResponse.onSuccess(problemSubmissionCommandService.submit(request));
    }
}