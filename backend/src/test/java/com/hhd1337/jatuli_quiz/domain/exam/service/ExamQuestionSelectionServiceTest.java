package com.hhd1337.jatuli_quiz.domain.exam.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import com.hhd1337.jatuli_quiz.domain.dailystat.service.DailyStatCommandService;
import com.hhd1337.jatuli_quiz.domain.exam.dto.ExamAnswerRequest;
import com.hhd1337.jatuli_quiz.domain.exam.dto.ExamAnswerResponse;
import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import com.hhd1337.jatuli_quiz.domain.folder.repository.FolderRepository;
import com.hhd1337.jatuli_quiz.domain.problem.entity.Problem;
import com.hhd1337.jatuli_quiz.domain.problem.repository.ProblemRepository;
import com.hhd1337.jatuli_quiz.domain.problemsubmission.entity.ProblemSubmission;
import com.hhd1337.jatuli_quiz.domain.problemsubmission.repository.ProblemSubmissionRepository;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.util.ReflectionTestUtils;

class ExamQuestionSelectionServiceTest {

    @Mock
    private FolderRepository folderRepository;

    @Mock
    private ProblemRepository problemRepository;

    @Mock
    private ProblemSubmissionRepository problemSubmissionRepository;

    @Mock
    private DailyStatCommandService dailyStatCommandService;

    @InjectMocks
    private ExamQuestionSelectionService examQuestionSelectionService;

    private Problem problem1;
    private Problem problem2;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        Folder folder = new Folder("/ROOT/자바", 1, "자바", 10, null, 1);
        ReflectionTestUtils.setField(folder, "folderId", 100L);

        problem1 = new Problem(1, "질문1", "해설1", "정답1", true, 0, folder);
        ReflectionTestUtils.setField(problem1, "problemId", 1L);

        problem2 = new Problem(2, "질문2", "해설2", "정답2", true, 0, folder);
        ReflectionTestUtils.setField(problem2, "problemId", 2L);
    }

    @Test
    @DisplayName("시험 제출 시 제출한 문제 수만큼 solvedCount와 daily_stat이 함께 증가한다")
    void submitExam_increasesSolvedCountAndDailyStat_forEverySubmittedProblem() {
        // given
        given(problemRepository.findAllWithFolderByProblemIdIn(List.of(1L, 2L)))
                .willReturn(List.of(problem1, problem2));

        ExamAnswerRequest request = new ExamAnswerRequest(List.of(1L, 2L), 100);

        // when
        ExamAnswerResponse response = examQuestionSelectionService.submitExam(request);

        // then
        assertThat(problem1.getSolvedCount()).isEqualTo(1);
        assertThat(problem2.getSolvedCount()).isEqualTo(1);
        assertThat(response.submittedProblemCount()).isEqualTo(2);

        verify(dailyStatCommandService, times(2)).updateDailyStat(anyInt());

        ArgumentCaptor<Integer> elapsedSecondsCaptor = ArgumentCaptor.forClass(Integer.class);
        verify(dailyStatCommandService, times(2)).updateDailyStat(elapsedSecondsCaptor.capture());

        int totalElapsedSecondsAppliedToDailyStat = elapsedSecondsCaptor.getAllValues().stream()
                .mapToInt(Integer::intValue)
                .sum();

        assertThat(totalElapsedSecondsAppliedToDailyStat).isEqualTo(100);
    }

    @Test
    @DisplayName("문제 1개만 제출해도 daily_stat 갱신이 정확히 1회 호출된다")
    void submitExam_callsDailyStatUpdateExactlyOnce_forSingleProblemSubmission() {
        // given
        given(problemRepository.findAllWithFolderByProblemIdIn(List.of(1L)))
                .willReturn(List.of(problem1));

        ExamAnswerRequest request = new ExamAnswerRequest(List.of(1L), 45);

        // when
        examQuestionSelectionService.submitExam(request);

        // then
        assertThat(problem1.getSolvedCount()).isEqualTo(1);
        verify(dailyStatCommandService, times(1)).updateDailyStat(45);
    }

    @Test
    @DisplayName("시험 제출로 생성되는 ProblemSubmission은 채점 전이므로 isCorrect가 null이다")
    void submitExam_savesProblemSubmissionsWithNullIsCorrect() {
        // given
        given(problemRepository.findAllWithFolderByProblemIdIn(List.of(1L, 2L)))
                .willReturn(List.of(problem1, problem2));

        ExamAnswerRequest request = new ExamAnswerRequest(List.of(1L, 2L), 100);

        // when
        examQuestionSelectionService.submitExam(request);

        // then
        ArgumentCaptor<List<ProblemSubmission>> submissionsCaptor = ArgumentCaptor.forClass(List.class);
        verify(problemSubmissionRepository).saveAll(submissionsCaptor.capture());

        List<ProblemSubmission> savedSubmissions = submissionsCaptor.getValue();
        assertThat(savedSubmissions).hasSize(2);
        assertThat(savedSubmissions).allSatisfy(submission ->
                assertThat(submission.getIsCorrect()).isNull()
        );
    }
}
