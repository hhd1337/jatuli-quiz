package com.hhd1337.jatuli_quiz.domain.practice.service;

import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import com.hhd1337.jatuli_quiz.domain.folder.repository.FolderRepository;
import com.hhd1337.jatuli_quiz.domain.practice.dto.FolderPracticeCursorResponse;
import com.hhd1337.jatuli_quiz.domain.practice.entity.FolderPracticeCursor;
import com.hhd1337.jatuli_quiz.domain.practice.repository.FolderPracticeCursorRepository;
import com.hhd1337.jatuli_quiz.domain.problem.entity.Problem;
import com.hhd1337.jatuli_quiz.domain.problem.repository.ProblemRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FolderPracticeCursorService {

    private final FolderPracticeCursorRepository folderPracticeCursorRepository;
    private final FolderRepository folderRepository;
    private final ProblemRepository problemRepository;

    @Transactional(readOnly = true)
    public FolderPracticeCursorResponse getCursor(Long folderId) {
        List<Problem> problems = problemRepository.findByFolder_FolderIdOrderByProblemIdAsc(folderId);

        if (problems.isEmpty()) {
            return FolderPracticeCursorResponse.noCursor(0);
        }

        Optional<FolderPracticeCursor> cursorOptional =
                folderPracticeCursorRepository.findByFolder_FolderId(folderId);

        if (cursorOptional.isEmpty()) {
            return FolderPracticeCursorResponse.noCursor(problems.size());
        }

        FolderPracticeCursor cursor = cursorOptional.get();

        if (cursor.getNextProblemId() == null) {
            return FolderPracticeCursorResponse.noCursor(problems.size());
        }

        int nextProblemIndex = findProblemIndex(problems, cursor.getNextProblemId());

        if (nextProblemIndex == -1) {
            return FolderPracticeCursorResponse.noCursor(problems.size());
        }

        return FolderPracticeCursorResponse.of(
                cursor.getNextProblemId(),
                nextProblemIndex,
                problems.size()
        );
    }

    @Transactional
    public void updateAfterSubmit(Long folderId, Long submittedProblemId) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new IllegalArgumentException("폴더를 찾을 수 없습니다. folderId=" + folderId));

        List<Problem> problems = problemRepository.findByFolder_FolderIdOrderByProblemIdAsc(folderId);

        if (problems.isEmpty()) {
            return;
        }

        int submittedProblemIndex = findProblemIndex(problems, submittedProblemId);

        if (submittedProblemIndex == -1) {
            return;
        }

        int nextProblemIndex = submittedProblemIndex + 1;

        if (nextProblemIndex >= problems.size()) {
            nextProblemIndex = 0;
        }

        Long nextProblemId = problems.get(nextProblemIndex).getProblemId();

        FolderPracticeCursor cursor = folderPracticeCursorRepository
                .findByFolder_FolderId(folderId)
                .orElseGet(() -> FolderPracticeCursor.create(folder, nextProblemId));

        cursor.updateCursor(submittedProblemId, nextProblemId);
    }

    private int findProblemIndex(List<Problem> problems, Long problemId) {
        for (int i = 0; i < problems.size(); i++) {
            if (problems.get(i).getProblemId().equals(problemId)) {
                return i;
            }
        }

        return -1;
    }
}