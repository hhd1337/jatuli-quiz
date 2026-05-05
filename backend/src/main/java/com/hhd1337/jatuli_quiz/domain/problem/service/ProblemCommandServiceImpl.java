package com.hhd1337.jatuli_quiz.domain.problem.service;

import com.hhd1337.jatuli_quiz.common.exception.GeneralException;
import com.hhd1337.jatuli_quiz.common.exception.code.status.ErrorStatus;
import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import com.hhd1337.jatuli_quiz.domain.folder.repository.FolderRepository;
import com.hhd1337.jatuli_quiz.domain.practice.dto.PracticeRequest;
import com.hhd1337.jatuli_quiz.domain.practice.dto.PracticeResponse;
import com.hhd1337.jatuli_quiz.domain.practice.entity.PracticeCursor;
import com.hhd1337.jatuli_quiz.domain.practice.entity.PracticeCursorType;
import com.hhd1337.jatuli_quiz.domain.practice.repository.PracticeCursorRepository;
import com.hhd1337.jatuli_quiz.domain.problem.converter.ProblemConverter;
import com.hhd1337.jatuli_quiz.domain.problem.dto.ParsedProblemContent;
import com.hhd1337.jatuli_quiz.domain.problem.dto.ProblemBookmarkResponse;
import com.hhd1337.jatuli_quiz.domain.problem.dto.ProblemImportRequest;
import com.hhd1337.jatuli_quiz.domain.problem.dto.ProblemImportResponse;
import com.hhd1337.jatuli_quiz.domain.problem.entity.Problem;
import com.hhd1337.jatuli_quiz.domain.problem.repository.ProblemRepository;
import com.hhd1337.jatuli_quiz.domain.progress.entity.LearningProgress;
import com.hhd1337.jatuli_quiz.domain.progress.repository.LearningProgressRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProblemCommandServiceImpl implements ProblemCommandService {

    private static final int FOLDER_PROBLEM_LIMIT = 2;

    private final ProblemRepository problemRepository;
    private final FolderRepository folderRepository;
    private final ProblemTextParser problemTextParser;
    private final PracticeCursorRepository practiceCursorRepository;
    private final LearningProgressRepository learningProgressRepository;

    @Override
    public ProblemBookmarkResponse.ToggleBookmarkResponse toggleBookmark(Long problemId) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new GeneralException(ErrorStatus.PROBLEM_NOT_FOUND));

        problem.toggleBookmark();

        return ProblemConverter.toToggleBookmarkResponse(problem);
    }

    @Override
    public ProblemImportResponse.ImportProblemsFromTextResponse importProblemsFromText(
            ProblemImportRequest.ImportProblemsFromTextRequest request
    ) {
        Folder folder = folderRepository.findById(request.getFolderId())
                .orElseThrow(() -> new GeneralException(ErrorStatus.FOLDER_NOT_FOUND));

        validateLeafFolderForProblemImport(folder);

        List<ParsedProblemContent> parsedProblems = problemTextParser.parse(request.getRawText());

        int startProblemNum = getNextProblemNum(folder.getFolderId());

        List<Problem> problemsToSave = new ArrayList<>();
        for (int i = 0; i < parsedProblems.size(); i++) {
            ParsedProblemContent parsed = parsedProblems.get(i);

            Problem problem = Problem.of(
                    startProblemNum + i,
                    parsed.getQuestionText(),
                    parsed.getExplanationText(),
                    parsed.getAnswerText(),
                    folder
            );
            problemsToSave.add(problem);
        }

        List<Problem> savedProblems = problemRepository.saveAll(problemsToSave);
        folder.increaseProblemCount(savedProblems.size());

        return ProblemConverter.toImportProblemsFromTextResponse(folder.getFolderId(), savedProblems);
    }

    private int getNextProblemNum(Long folderId) {
        return problemRepository.findTopByFolder_FolderIdOrderByProblemNumDesc(folderId)
                .map(problem -> problem.getProblemNum() + 1)
                .orElse(1);
    }

    private void validateLeafFolderForProblemImport(Folder folder) {
        boolean hasChildFolders = folderRepository.existsByParentFolder_FolderId(folder.getFolderId());

        if (hasChildFolders) {
            throw new GeneralException(ErrorStatus.PROBLEM_IMPORT_TARGET_NOT_LEAF);
        }
    }

    @Override
    public PracticeResponse.GetBookmarkedPracticeProblemsResponse getBookmarkedPracticeProblems(
            PracticeRequest.GetBookmarkedPracticeProblemsRequest request
    ) {
        int requestedProblemCount = normalizePracticeProblemCount(request.getProblemCount());

        LearningProgress learningProgress = getOrCreateSingleUserLearningProgress();
        Integer currentRoundNo = learningProgress.getCurrentBookmarkedRoundNo();

        PracticeCursor cursor = getOrCreateBookmarkedPracticeCursor();

        List<Folder> leafFolders = problemRepository
                .findLeafFoldersHavingUnpracticedBookmarkedProblemsInRound(currentRoundNo);

        if (leafFolders.isEmpty()) {
            throw new GeneralException(ErrorStatus.BOOKMARKED_PROBLEM_NOT_FOUND);
        }

        List<Folder> orderedLeafFolders = reorderLeafFoldersFromNextCursor(
                leafFolders,
                cursor.getLastLeafFolderId()
        );

        List<Problem> selectedProblems = new ArrayList<>();
        Long lastSelectedLeafFolderId = null;

        for (Folder leafFolder : orderedLeafFolders) {
            if (selectedProblems.size() >= requestedProblemCount) {
                break;
            }

            int remainingProblemCount = requestedProblemCount - selectedProblems.size();
            int limit = Math.min(FOLDER_PROBLEM_LIMIT, remainingProblemCount);

            List<Problem> problemsInFolder = problemRepository
                    .findUnpracticedBookmarkedProblemsByFolderIdForPractice(
                            leafFolder.getFolderId(),
                            currentRoundNo,
                            PageRequest.of(0, limit)
                    );

            if (!problemsInFolder.isEmpty()) {
                selectedProblems.addAll(problemsInFolder);
                lastSelectedLeafFolderId = leafFolder.getFolderId();
            }
        }

        if (selectedProblems.isEmpty()) {
            throw new GeneralException(ErrorStatus.BOOKMARKED_PROBLEM_NOT_FOUND);
        }

        cursor.updateLastLeafFolderId(lastSelectedLeafFolderId);

        return ProblemConverter.toBookmarkedPracticeProblemsResponse(
                requestedProblemCount,
                FOLDER_PROBLEM_LIMIT,
                lastSelectedLeafFolderId,
                selectedProblems
        );
    }

    private int normalizePracticeProblemCount(Integer problemCount) {
        if (problemCount == null) {
            return 10;
        }

        if (problemCount < 1) {
            return 10;
        }

        return Math.min(problemCount, 50);
    }

    private LearningProgress getOrCreateSingleUserLearningProgress() {
        return learningProgressRepository.findById(LearningProgress.SINGLE_USER_PROGRESS_KEY)
                .orElseGet(() -> learningProgressRepository.save(
                        LearningProgress.createSingleUserProgress()
                ));
    }

    private PracticeCursor getOrCreateBookmarkedPracticeCursor() {
        return practiceCursorRepository.findByCursorTypeWithLock(
                        PracticeCursorType.BOOKMARKED_LEAF_ROUND_ROBIN
                )
                .orElseGet(() -> practiceCursorRepository.save(
                        PracticeCursor.create(PracticeCursorType.BOOKMARKED_LEAF_ROUND_ROBIN)
                ));
    }

    private List<Folder> reorderLeafFoldersFromNextCursor(
            List<Folder> leafFolders,
            Long lastLeafFolderId
    ) {
        if (lastLeafFolderId == null) {
            return leafFolders;
        }

        int lastIndex = findFolderIndex(leafFolders, lastLeafFolderId);

        if (lastIndex == -1) {
            return leafFolders;
        }

        int nextIndex = (lastIndex + 1) % leafFolders.size();

        List<Folder> reordered = new ArrayList<>();

        for (int i = 0; i < leafFolders.size(); i++) {
            int index = (nextIndex + i) % leafFolders.size();
            reordered.add(leafFolders.get(index));
        }

        return reordered;
    }

    private int findFolderIndex(List<Folder> leafFolders, Long folderId) {
        for (int i = 0; i < leafFolders.size(); i++) {
            if (leafFolders.get(i).getFolderId().equals(folderId)) {
                return i;
            }
        }

        return -1;
    }
}