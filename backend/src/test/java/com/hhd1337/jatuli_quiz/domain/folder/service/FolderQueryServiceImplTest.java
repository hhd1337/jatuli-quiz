package com.hhd1337.jatuli_quiz.domain.folder.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;
import static org.mockito.BDDMockito.given;

import com.hhd1337.jatuli_quiz.common.exception.code.status.ErrorStatus;
import com.hhd1337.jatuli_quiz.common.exception.handler.FolderHandler;
import com.hhd1337.jatuli_quiz.domain.folder.dto.FolderResponse.FolderChildrenResponse;
import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import com.hhd1337.jatuli_quiz.domain.folder.repository.FolderRepository;
import com.hhd1337.jatuli_quiz.domain.problem.repository.ProblemRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class FolderQueryServiceImplTest {

    @Mock
    private FolderRepository folderRepository;

    @Mock
    private ProblemRepository problemRepository;

    @InjectMocks
    private FolderQueryServiceImpl folderQueryService;

    private Folder rootFolder;
    private Folder javaFolder;
    private Folder basicFolder;
    private Folder oopFolder;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        rootFolder = new Folder("/ROOT", 0, "ROOT", 0, null);
        javaFolder = new Folder("/ROOT/자바", 1, "자바", 120, rootFolder);
        basicFolder = new Folder("/ROOT/자바/기본", 2, "기본", 40, javaFolder);
        oopFolder = new Folder("/ROOT/자바/객체지향", 2, "객체지향", 35, javaFolder);
    }

    @Test
    @DisplayName("현재 폴더의 breadcrumb와 직계 하위 폴더 목록을 반환한다")
    void getChildren_success() {
        // given
        Long folderId = 2L;

        given(folderRepository.findById(folderId)).willReturn(Optional.of(javaFolder));
        given(folderRepository.findByParentFolder_FolderIdOrderByFolderIdAsc(folderId))
                .willReturn(List.of(basicFolder, oopFolder));

        given(problemRepository.countByFolder(basicFolder)).willReturn(40);
        given(problemRepository.countByFolderAndSolvedCountGreaterThan(basicFolder, 0)).willReturn(12);
        given(folderRepository.existsByParentFolder(basicFolder)).willReturn(true);

        given(problemRepository.countByFolder(oopFolder)).willReturn(35);
        given(problemRepository.countByFolderAndSolvedCountGreaterThan(oopFolder, 0)).willReturn(8);
        given(folderRepository.existsByParentFolder(oopFolder)).willReturn(false);

        // when
        FolderChildrenResponse response = folderQueryService.getChildren(folderId);

        // then
        assertThat(response).isNotNull();
        assertThat(response.getBreadcrumb()).hasSize(2);
        assertThat(response.getBreadcrumb().get(0).getName()).isEqualTo("ROOT");
        assertThat(response.getBreadcrumb().get(1).getName()).isEqualTo("자바");

        assertThat(response.getFolders()).hasSize(2);

        FolderChildrenResponse.FolderDTO first = response.getFolders().get(0);
        assertThat(first.getName()).isEqualTo("기본");
        assertThat(first.getSolved()).isEqualTo(12);
        assertThat(first.getTotal()).isEqualTo(40);
        assertThat(first.getHasChildren()).isTrue();

        FolderChildrenResponse.FolderDTO second = response.getFolders().get(1);
        assertThat(second.getName()).isEqualTo("객체지향");
        assertThat(second.getSolved()).isEqualTo(8);
        assertThat(second.getTotal()).isEqualTo(35);
        assertThat(second.getHasChildren()).isFalse();
    }

    @Test
    @DisplayName("존재하지 않는 폴더 ID로 조회하면 예외가 발생한다")
    void getChildren_fail_folderNotFound() {
        // given
        Long invalidFolderId = 999L;
        given(folderRepository.findById(invalidFolderId)).willReturn(Optional.empty());

        // when
        Throwable throwable = catchThrowable(() -> folderQueryService.getChildren(invalidFolderId));

        // then
        assertThat(throwable).isInstanceOf(FolderHandler.class);

        FolderHandler folderHandler = (FolderHandler) throwable;
        assertThat(folderHandler.getCode()).isEqualTo(ErrorStatus.FOLDER_NOT_FOUND);
    }
}