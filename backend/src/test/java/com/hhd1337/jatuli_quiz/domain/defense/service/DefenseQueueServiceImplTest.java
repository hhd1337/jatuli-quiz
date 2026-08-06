package com.hhd1337.jatuli_quiz.domain.defense.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

import com.hhd1337.jatuli_quiz.common.exception.GeneralException;
import com.hhd1337.jatuli_quiz.common.exception.code.status.ErrorStatus;
import com.hhd1337.jatuli_quiz.domain.defense.dto.DefenseQueueRequest;
import com.hhd1337.jatuli_quiz.domain.defense.dto.DefenseQueueResponse;
import com.hhd1337.jatuli_quiz.domain.defense.entity.DefenseQueueEntry;
import com.hhd1337.jatuli_quiz.domain.defense.repository.DefenseQueueEntryRepository;
import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import com.hhd1337.jatuli_quiz.domain.folder.repository.FolderRepository;
import com.hhd1337.jatuli_quiz.domain.problem.repository.ProblemRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.util.ReflectionTestUtils;

class DefenseQueueServiceImplTest {

    @Mock
    private DefenseQueueEntryRepository defenseQueueEntryRepository;

    @Mock
    private FolderRepository folderRepository;

    @Mock
    private ProblemRepository problemRepository;

    @InjectMocks
    private DefenseQueueServiceImpl defenseQueueService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    private Folder createFolder(long folderId, String name) {
        Folder folder = new Folder("/" + name, 1, name, 0, null, 0);
        ReflectionTestUtils.setField(folder, "folderId", folderId);
        return folder;
    }

    @Test
    @DisplayName("리프 폴더를 큐 마지막 순서로 추가한다")
    void addToQueue_appendsAtLastQueueOrder() {
        // given
        Folder folder = createFolder(1L, "자바 기본");

        given(folderRepository.findById(1L)).willReturn(Optional.of(folder));
        given(folderRepository.existsByParentFolder_FolderId(1L)).willReturn(false);
        given(problemRepository.countByFolder(folder)).willReturn(10);
        given(defenseQueueEntryRepository.existsByFolder(folder)).willReturn(false);
        given(defenseQueueEntryRepository.findMaxQueueOrder()).willReturn(2);
        given(defenseQueueEntryRepository.findAllOrderByQueueOrderAsc()).willReturn(List.of());

        // when
        defenseQueueService.addToQueue(new DefenseQueueRequest.AddDefenseQueueEntryRequest(1L));

        // then
        ArgumentCaptor<DefenseQueueEntry> captor = ArgumentCaptor.forClass(DefenseQueueEntry.class);
        verify(defenseQueueEntryRepository).save(captor.capture());

        assertThat(captor.getValue().getFolder()).isEqualTo(folder);
        assertThat(captor.getValue().getQueueOrder()).isEqualTo(3);
    }

    @Test
    @DisplayName("존재하지 않는 폴더를 추가하려 하면 예외가 발생한다")
    void addToQueue_throwsException_whenFolderNotFound() {
        // given
        given(folderRepository.findById(999L)).willReturn(Optional.empty());

        // when
        Throwable throwable = catchThrowable(() ->
                defenseQueueService.addToQueue(new DefenseQueueRequest.AddDefenseQueueEntryRequest(999L))
        );

        // then
        assertThat(throwable).isInstanceOf(GeneralException.class);
        assertThat(((GeneralException) throwable).getCode()).isEqualTo(ErrorStatus.FOLDER_NOT_FOUND);
    }

    @Test
    @DisplayName("리프 폴더가 아니면 큐 등록을 거부한다")
    void addToQueue_throwsException_whenFolderIsNotLeaf() {
        // given
        Folder folder = createFolder(2L, "자바");

        given(folderRepository.findById(2L)).willReturn(Optional.of(folder));
        given(folderRepository.existsByParentFolder_FolderId(2L)).willReturn(true);

        // when
        Throwable throwable = catchThrowable(() ->
                defenseQueueService.addToQueue(new DefenseQueueRequest.AddDefenseQueueEntryRequest(2L))
        );

        // then
        assertThat(throwable).isInstanceOf(GeneralException.class);
        assertThat(((GeneralException) throwable).getCode()).isEqualTo(ErrorStatus.DEFENSE_QUEUE_FOLDER_NOT_LEAF);
    }

    @Test
    @DisplayName("문제가 없는 리프 폴더는 큐 등록을 거부한다")
    void addToQueue_throwsException_whenFolderHasNoProblems() {
        // given
        Folder folder = createFolder(3L, "빈폴더");

        given(folderRepository.findById(3L)).willReturn(Optional.of(folder));
        given(folderRepository.existsByParentFolder_FolderId(3L)).willReturn(false);
        given(problemRepository.countByFolder(folder)).willReturn(0);

        // when
        Throwable throwable = catchThrowable(() ->
                defenseQueueService.addToQueue(new DefenseQueueRequest.AddDefenseQueueEntryRequest(3L))
        );

        // then
        assertThat(throwable).isInstanceOf(GeneralException.class);
        assertThat(((GeneralException) throwable).getCode()).isEqualTo(ErrorStatus.DEFENSE_QUEUE_FOLDER_EMPTY);
    }

    @Test
    @DisplayName("이미 등록된 폴더는 중복 등록을 거부한다")
    void addToQueue_throwsException_whenAlreadyRegistered() {
        // given
        Folder folder = createFolder(4L, "패키지");

        given(folderRepository.findById(4L)).willReturn(Optional.of(folder));
        given(folderRepository.existsByParentFolder_FolderId(4L)).willReturn(false);
        given(problemRepository.countByFolder(folder)).willReturn(5);
        given(defenseQueueEntryRepository.existsByFolder(folder)).willReturn(true);

        // when
        Throwable throwable = catchThrowable(() ->
                defenseQueueService.addToQueue(new DefenseQueueRequest.AddDefenseQueueEntryRequest(4L))
        );

        // then
        assertThat(throwable).isInstanceOf(GeneralException.class);
        assertThat(((GeneralException) throwable).getCode())
                .isEqualTo(ErrorStatus.DEFENSE_QUEUE_ALREADY_REGISTERED);
    }

    @Test
    @DisplayName("등록되지 않은 폴더를 삭제하려 하면 예외가 발생한다")
    void removeFromQueue_throwsException_whenEntryNotFound() {
        // given
        given(defenseQueueEntryRepository.findByFolder_FolderId(5L)).willReturn(Optional.empty());

        // when
        Throwable throwable = catchThrowable(() -> defenseQueueService.removeFromQueue(5L));

        // then
        assertThat(throwable).isInstanceOf(GeneralException.class);
        assertThat(((GeneralException) throwable).getCode())
                .isEqualTo(ErrorStatus.DEFENSE_QUEUE_ENTRY_NOT_FOUND);
    }

    @Test
    @DisplayName("등록된 폴더를 큐에서 정상적으로 삭제한다")
    void removeFromQueue_deletesEntry() {
        // given
        Folder folder = createFolder(6L, "삭제대상");
        DefenseQueueEntry entry = DefenseQueueEntry.create(folder, 1);

        given(defenseQueueEntryRepository.findByFolder_FolderId(6L)).willReturn(Optional.of(entry));
        given(defenseQueueEntryRepository.findAllOrderByQueueOrderAsc()).willReturn(List.of());

        // when
        defenseQueueService.removeFromQueue(6L);

        // then
        verify(defenseQueueEntryRepository).delete(entry);
    }

    @Test
    @DisplayName("전달받은 순서대로 큐 순서를 일괄 변경한다")
    void reorderQueue_appliesNewOrder() {
        // given
        Folder folderA = createFolder(10L, "A");
        Folder folderB = createFolder(11L, "B");
        Folder folderC = createFolder(12L, "C");

        DefenseQueueEntry entryA = DefenseQueueEntry.create(folderA, 1);
        DefenseQueueEntry entryB = DefenseQueueEntry.create(folderB, 2);
        DefenseQueueEntry entryC = DefenseQueueEntry.create(folderC, 3);

        given(defenseQueueEntryRepository.findAllOrderByQueueOrderAsc())
                .willReturn(List.of(entryA, entryB, entryC));

        // when
        defenseQueueService.reorderQueue(
                new DefenseQueueRequest.ReorderDefenseQueueRequest(List.of(12L, 10L, 11L))
        );

        // then
        assertThat(entryC.getQueueOrder()).isEqualTo(1);
        assertThat(entryA.getQueueOrder()).isEqualTo(2);
        assertThat(entryB.getQueueOrder()).isEqualTo(3);
    }

    @Test
    @DisplayName("큐에 없는 폴더 ID가 섞여 있으면 순서 변경을 거부한다")
    void reorderQueue_throwsException_whenOrderedIdsDoNotMatchExistingEntries() {
        // given
        Folder folderA = createFolder(20L, "A");
        DefenseQueueEntry entryA = DefenseQueueEntry.create(folderA, 1);

        given(defenseQueueEntryRepository.findAllOrderByQueueOrderAsc()).willReturn(List.of(entryA));

        // when
        Throwable throwable = catchThrowable(() ->
                defenseQueueService.reorderQueue(
                        new DefenseQueueRequest.ReorderDefenseQueueRequest(List.of(999L))
                )
        );

        // then
        assertThat(throwable).isInstanceOf(GeneralException.class);
        assertThat(((GeneralException) throwable).getCode()).isEqualTo(ErrorStatus.DEFENSE_QUEUE_INVALID_ORDER);
    }

    @Test
    @DisplayName("큐 조회 시 순서대로 폴더 정보와 문제 수를 반환한다")
    void getQueue_returnsEntriesInQueueOrderWithProblemCount() {
        // given
        Folder folder = createFolder(30L, "카프카");
        DefenseQueueEntry entry = DefenseQueueEntry.create(folder, 1);

        given(defenseQueueEntryRepository.findAllOrderByQueueOrderAsc()).willReturn(List.of(entry));
        given(problemRepository.countByFolder(folder)).willReturn(42);

        // when
        DefenseQueueResponse.GetDefenseQueueResponse response = defenseQueueService.getQueue();

        // then
        assertThat(response.getTotalCount()).isEqualTo(1);
        assertThat(response.getEntries().get(0).getFolderId()).isEqualTo(30L);
        assertThat(response.getEntries().get(0).getTotalProblemCount()).isEqualTo(42);
    }
}
