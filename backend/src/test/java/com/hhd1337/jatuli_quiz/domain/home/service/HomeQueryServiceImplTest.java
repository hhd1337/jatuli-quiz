package com.hhd1337.jatuli_quiz.domain.home.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import com.hhd1337.jatuli_quiz.domain.dailystat.repository.DailyStatRepository;
import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import com.hhd1337.jatuli_quiz.domain.folder.repository.FolderRepository;
import com.hhd1337.jatuli_quiz.domain.home.dto.HomeResponse;
import com.hhd1337.jatuli_quiz.domain.problem.repository.ProblemRepository;
import com.hhd1337.jatuli_quiz.domain.progress.repository.LearningProgressRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.util.ReflectionTestUtils;

class HomeQueryServiceImplTest {

    private static final Long ROOT_FOLDER_ID = 1L;

    @Mock
    private DailyStatRepository dailyStatRepository;

    @Mock
    private FolderRepository folderRepository;

    @Mock
    private ProblemRepository problemRepository;

    @Mock
    private LearningProgressRepository learningProgressRepository;

    @InjectMocks
    private HomeQueryServiceImpl homeQueryService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        given(dailyStatRepository.findByStatDate(any(LocalDate.class))).willReturn(Optional.empty());
        given(learningProgressRepository.findById(any())).willReturn(Optional.empty());
        given(problemRepository.sumSolvedCount()).willReturn(0);
        given(problemRepository.countByIsBookmarkedTrue()).willReturn(0);
        given(problemRepository.countByIsBookmarkedTrueAndLastPracticedBookmarkedRoundNoGreaterThanEqual(anyInt()))
                .willReturn(0);
    }

    private Folder createFolder(long folderId, String name) {
        Folder folder = new Folder("/" + name, 1, name, 0, null, 0);
        ReflectionTestUtils.setField(folder, "folderId", folderId);
        return folder;
    }

    private void stubLeafFolder(
            Folder folder,
            int totalCount,
            int solvedCount,
            int minSolvedCount
    ) {
        given(folderRepository.findAllByParentFolder_FolderIdOrderBySortOrderAscFolderIdAsc(folder.getFolderId()))
                .willReturn(List.of());
        given(problemRepository.countByFolder(folder)).willReturn(totalCount);
        given(problemRepository.countByFolderAndSolvedCountGreaterThan(folder, 0)).willReturn(solvedCount);
        given(problemRepository.findMinSolvedCountByFolder(folder)).willReturn(minSolvedCount);
    }

    @Test
    @DisplayName("문제가 없는 빈 리프 폴더는 completedRoundCount가 0이다")
    void getHome_emptyLeafFolder_hasZeroCompletedRoundCount() {
        // given
        Folder emptyLeaf = createFolder(10L, "빈폴더");
        given(folderRepository.findAllByParentFolder_FolderIdOrderBySortOrderAscFolderIdAsc(ROOT_FOLDER_ID))
                .willReturn(List.of(emptyLeaf));
        stubLeafFolder(emptyLeaf, 0, 0, 0);

        // when
        HomeResponse.RootFolderItem result = homeQueryService.getHome().getRootFolders().get(0);

        // then
        assertThat(result.getTotalProblemCount()).isZero();
        assertThat(result.getCompletedRoundCount()).isZero();
    }

    @Test
    @DisplayName("아무 문제도 풀지 않은 리프 폴더는 completedRoundCount가 0이다")
    void getHome_notStartedLeafFolder_hasZeroCompletedRoundCount() {
        // given
        Folder folder = createFolder(11L, "미풀이폴더");
        given(folderRepository.findAllByParentFolder_FolderIdOrderBySortOrderAscFolderIdAsc(ROOT_FOLDER_ID))
                .willReturn(List.of(folder));
        stubLeafFolder(folder, 10, 0, 0);

        // when
        HomeResponse.RootFolderItem result = homeQueryService.getHome().getRootFolders().get(0);

        // then
        assertThat(result.getSolvedProblemCount()).isZero();
        assertThat(result.getCompletedRoundCount()).isZero();
    }

    @Test
    @DisplayName("일부만 풀린 리프 폴더는 완주하지 않았으므로 completedRoundCount가 0이다")
    void getHome_inProgressLeafFolder_hasZeroCompletedRoundCount() {
        // given
        Folder folder = createFolder(12L, "풀이중폴더");
        given(folderRepository.findAllByParentFolder_FolderIdOrderBySortOrderAscFolderIdAsc(ROOT_FOLDER_ID))
                .willReturn(List.of(folder));
        stubLeafFolder(folder, 10, 4, 0);

        // when
        HomeResponse.RootFolderItem result = homeQueryService.getHome().getRootFolders().get(0);

        // then
        assertThat(result.getSolvedProblemCount()).isEqualTo(4);
        assertThat(result.getCompletedRoundCount()).isZero();
    }

    @Test
    @DisplayName("모든 문제를 2회 이상 푼 리프 폴더는 completedRoundCount가 최솟값과 같다")
    void getHome_completedLeafFolder_hasMinSolvedCountAsCompletedRoundCount() {
        // given
        Folder folder = createFolder(13L, "완료폴더");
        given(folderRepository.findAllByParentFolder_FolderIdOrderBySortOrderAscFolderIdAsc(ROOT_FOLDER_ID))
                .willReturn(List.of(folder));
        stubLeafFolder(folder, 10, 10, 2);

        // when
        HomeResponse.RootFolderItem result = homeQueryService.getHome().getRootFolders().get(0);

        // then
        assertThat(result.getCompletedRoundCount()).isEqualTo(2);
    }

    @Test
    @DisplayName("리프가 아닌 폴더는 completedRoundCount 계산 쿼리를 호출하지 않는다")
    void getHome_nonLeafFolder_doesNotQueryMinSolvedCount() {
        // given
        Folder parent = createFolder(20L, "상위폴더");
        Folder child = createFolder(21L, "하위폴더");

        given(folderRepository.findAllByParentFolder_FolderIdOrderBySortOrderAscFolderIdAsc(ROOT_FOLDER_ID))
                .willReturn(List.of(parent));
        given(folderRepository.findAllByParentFolder_FolderIdOrderBySortOrderAscFolderIdAsc(parent.getFolderId()))
                .willReturn(List.of(child));
        given(problemRepository.countByFolder(parent)).willReturn(0);
        given(problemRepository.countByFolderAndSolvedCountGreaterThan(parent, 0)).willReturn(0);
        stubLeafFolder(child, 5, 5, 1);

        // when
        HomeResponse.RootFolderItem result = homeQueryService.getHome().getRootFolders().get(0);

        // then
        assertThat(result.getLeaf()).isFalse();
        assertThat(result.getCompletedRoundCount()).isZero();
        verify(problemRepository, never()).findMinSolvedCountByFolder(parent);
    }
}
