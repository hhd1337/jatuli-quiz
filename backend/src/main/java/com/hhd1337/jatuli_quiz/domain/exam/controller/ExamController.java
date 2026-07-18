package com.hhd1337.jatuli_quiz.domain.exam.controller;

import com.hhd1337.jatuli_quiz.domain.exam.dto.ExamAnswerRequest;
import com.hhd1337.jatuli_quiz.domain.exam.dto.ExamAnswerResponse;
import com.hhd1337.jatuli_quiz.domain.exam.dto.ExamQuestionCreateRequest;
import com.hhd1337.jatuli_quiz.domain.exam.dto.ExamQuestionCreateResponse;
import com.hhd1337.jatuli_quiz.domain.exam.service.ExamQuestionSelectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/exams")
@RequiredArgsConstructor
@Tag(
        name = "시험보기",
        description = "시험 문제 출제 및 시험 문제 일괄 제출 API"
)
public class ExamController {

    private final ExamQuestionSelectionService
            examQuestionSelectionService;

    @Operation(
            summary = "시험 문제 출제",
            description = """
                    사용자가 선택한 리프 폴더별 출제 문제 수를 기준으로
                    시험 문제를 생성합니다.
                    
                    각 폴더의 북마크된 문제 중 solvedCount가 낮은 문제를
                    우선 출제하며, solvedCount가 같은 문제들은 무작위로
                    선택합니다.
                    
                    문제당 제한 시간은 1분부터 10분 사이에서 선택할 수
                    있습니다. 총 제한 시간은 출제된 문제 수와 문제당
                    제한 시간을 기준으로 계산합니다.
                    
                    시험 진행 중 정답이 노출되지 않도록 문제 내용과
                    폴더 정보만 반환합니다.
                    """
    )
    @PostMapping("/questions")
    public ExamQuestionCreateResponse createQuestions(
            @Valid @RequestBody
            ExamQuestionCreateRequest request
    ) {
        return examQuestionSelectionService.createQuestions(
                request
        );
    }

    @Operation(
            summary = "시험 문제 일괄 제출",
            description = """
                    시험에 출제된 모든 문제를 한 번에 제출합니다.
                    
                    전달받은 모든 문제에 대해 ProblemSubmission을 생성하고,
                    각 문제의 solvedCount를 1씩 증가시킵니다.
                    
                    아직 정답 여부를 채점하지 않으므로 ProblemSubmission의
                    isCorrect 값은 null로 저장합니다.
                    
                    시험 전체 소요 시간은 문제 수에 맞게 분배하여 각 제출 기록의
                    elapsedSeconds에 저장합니다.
                    
                    저장이 완료되면 사용자가 자신의 답안과 비교할 수 있도록
                    각 문제의 정답과 해설을 반환합니다.
                    """
    )
    @PostMapping("/submissions")
    public ExamAnswerResponse submitExam(
            @Valid @RequestBody
            ExamAnswerRequest request
    ) {
        return examQuestionSelectionService.submitExam(
                request
        );
    }
}