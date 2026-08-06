package com.hhd1337.jatuli_quiz.domain.problem.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

import com.hhd1337.jatuli_quiz.common.exception.GeneralException;
import com.hhd1337.jatuli_quiz.common.exception.code.status.ErrorStatus;
import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import com.hhd1337.jatuli_quiz.domain.folder.repository.FolderRepository;
import com.hhd1337.jatuli_quiz.domain.practice.entity.FolderPracticeCursor;
import com.hhd1337.jatuli_quiz.domain.practice.repository.FolderPracticeCursorRepository;
import com.hhd1337.jatuli_quiz.domain.practice.repository.PracticeCursorRepository;
import com.hhd1337.jatuli_quiz.domain.problem.dto.ProblemDeleteResponse;
import com.hhd1337.jatuli_quiz.domain.problem.entity.Problem;
import com.hhd1337.jatuli_quiz.domain.problem.repository.ProblemRepository;
import com.hhd1337.jatuli_quiz.domain.problemsubmission.repository.ProblemSubmissionRepository;
import com.hhd1337.jatuli_quiz.domain.progress.repository.LearningProgressRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.util.ReflectionTestUtils;

class ProblemCommandServiceImplTest {

    @Mock
    private ProblemRepository problemRepository;

    @Mock
    private FolderRepository folderRepository;

    @Mock
    private ProblemTextParser problemTextParser;

    @Mock
    private PracticeCursorRepository practiceCursorRepository;

    @Mock
    private LearningProgressRepository learningProgressRepository;

    @Mock
    private ProblemSubmissionRepository problemSubmissionRepository;

    @Mock
    private FolderPracticeCursorRepository folderPracticeCursorRepository;

    @InjectMocks
    private ProblemCommandServiceImpl problemCommandService;

    private Folder folder;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        folder = new Folder("/ROOT/자바", 1, "자바", 5, null, 0);
        ReflectionTestUtils.setField(folder, "folderId", 1L);
    }

    private Problem createProblem(long problemId) {
        Problem problem = new Problem(
                (int) problemId,
                "질문" + problemId,
                "해설" + problemId,
                "정답" + problemId,
                true,
                0,
                folder
        );

        ReflectionTestUtils.setField(problem, "problemId", problemId);
        return problem;
    }

    @Test
    @DisplayName("문제를 삭제하면 풀이 기록도 함께 삭제되고 폴더의 문제 수가 감소한다")
    void deleteProblem_deletesProblemAndSubmissions_andDecreasesFolderProblemCount() {
        // given
        Problem problem1 = createProblem(10L);
        Problem problem2 = createProblem(11L);
        Problem problem3 = createProblem(12L);

        given(problemRepository.findById(10L)).willReturn(Optional.of(problem1));
        given(problemRepository.findByFolder_FolderIdOrderByProblemIdAsc(1L))
                .willReturn(List.of(problem1, problem2, problem3));
        given(folderPracticeCursorRepository.findByFolder_FolderId(1L))
                .willReturn(Optional.empty());

        // when
        ProblemDeleteResponse.DeleteProblemResponse response =
                problemCommandService.deleteProblem(10L);

        // then
        verify(problemSubmissionRepository).deleteAllByProblem(problem1);
        verify(problemRepository).delete(problem1);

        assertThat(folder.getProblemCount()).isEqualTo(4);
        assertThat(response.getProblemId()).isEqualTo(10L);
        assertThat(response.getFolderId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("존재하지 않는 문제를 삭제하려 하면 예외가 발생한다")
    void deleteProblem_throwsException_whenProblemNotFound() {
        // given
        given(problemRepository.findById(999L)).willReturn(Optional.empty());

        // when
        Throwable throwable = catchThrowable(() -> problemCommandService.deleteProblem(999L));

        // then
        assertThat(throwable).isInstanceOf(GeneralException.class);
        assertThat(((GeneralException) throwable).getCode()).isEqualTo(ErrorStatus.PROBLEM_NOT_FOUND);
    }

    @Test
    @DisplayName("삭제한 문제가 커서의 다음 문제였다면 남은 문제 중 하나로 재조정된다")
    void deleteProblem_reassignsCursor_whenDeletedProblemWasNextProblem() {
        // given
        Problem problem1 = createProblem(10L);
        Problem problem2 = createProblem(11L);
        Problem problem3 = createProblem(12L);

        FolderPracticeCursor cursor = FolderPracticeCursor.create(folder, 11L);

        given(problemRepository.findById(11L)).willReturn(Optional.of(problem2));
        given(problemRepository.findByFolder_FolderIdOrderByProblemIdAsc(1L))
                .willReturn(List.of(problem1, problem2, problem3));
        given(folderPracticeCursorRepository.findByFolder_FolderId(1L))
                .willReturn(Optional.of(cursor));

        // when
        problemCommandService.deleteProblem(11L);

        // then
        assertThat(cursor.getNextProblemId()).isEqualTo(12L);
    }

    @Test
    @DisplayName("마지막 남은 문제를 삭제하면 커서의 다음 문제가 null로 재조정된다")
    void deleteProblem_reassignsCursorToNull_whenNoProblemsRemain() {
        // given
        Problem problem1 = createProblem(10L);

        FolderPracticeCursor cursor = FolderPracticeCursor.create(folder, 10L);

        given(problemRepository.findById(10L)).willReturn(Optional.of(problem1));
        given(problemRepository.findByFolder_FolderIdOrderByProblemIdAsc(1L))
                .willReturn(List.of(problem1));
        given(folderPracticeCursorRepository.findByFolder_FolderId(1L))
                .willReturn(Optional.of(cursor));

        // when
        problemCommandService.deleteProblem(10L);

        // then
        assertThat(cursor.getNextProblemId()).isNull();
    }

    @Test
    @DisplayName("삭제한 문제가 커서의 다음 문제가 아니면 커서를 건드리지 않는다")
    void deleteProblem_doesNotTouchCursor_whenDeletedProblemIsNotNextProblem() {
        // given
        Problem problem1 = createProblem(10L);
        Problem problem2 = createProblem(11L);

        FolderPracticeCursor cursor = FolderPracticeCursor.create(folder, 99L);

        given(problemRepository.findById(10L)).willReturn(Optional.of(problem1));
        given(problemRepository.findByFolder_FolderIdOrderByProblemIdAsc(1L))
                .willReturn(List.of(problem1, problem2));
        given(folderPracticeCursorRepository.findByFolder_FolderId(1L))
                .willReturn(Optional.of(cursor));

        // when
        problemCommandService.deleteProblem(10L);

        // then
        assertThat(cursor.getNextProblemId()).isEqualTo(99L);
    }
}
