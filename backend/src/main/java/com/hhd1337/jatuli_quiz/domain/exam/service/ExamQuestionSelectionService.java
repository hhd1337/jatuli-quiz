package com.hhd1337.jatuli_quiz.domain.exam.service;

import com.hhd1337.jatuli_quiz.domain.exam.dto.ExamAnswerRequest;
import com.hhd1337.jatuli_quiz.domain.exam.dto.ExamAnswerResponse;
import com.hhd1337.jatuli_quiz.domain.exam.dto.ExamAnswerResponse.ExamAnswerProblemResponse;
import com.hhd1337.jatuli_quiz.domain.exam.dto.ExamFolderSelectionRequest;
import com.hhd1337.jatuli_quiz.domain.exam.dto.ExamProblemResponse;
import com.hhd1337.jatuli_quiz.domain.exam.dto.ExamQuestionCreateRequest;
import com.hhd1337.jatuli_quiz.domain.exam.dto.ExamQuestionCreateResponse;
import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import com.hhd1337.jatuli_quiz.domain.folder.repository.FolderRepository;
import com.hhd1337.jatuli_quiz.domain.problem.entity.Problem;
import com.hhd1337.jatuli_quiz.domain.problem.repository.ProblemRepository;
import com.hhd1337.jatuli_quiz.domain.problemsubmission.entity.ProblemSubmission;
import com.hhd1337.jatuli_quiz.domain.problemsubmission.repository.ProblemSubmissionRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExamQuestionSelectionService {

    private static final int SECONDS_PER_PROBLEM = 4 * 60;

    private final FolderRepository folderRepository;
    private final ProblemRepository problemRepository;
    private final ProblemSubmissionRepository problemSubmissionRepository;

    /**
     * 사용자가 선택한 리프 폴더별로 시험 문제를 출제한다.
     * <p>
     * 출제 규칙: 1. 북마크된 문제만 출제한다. 2. solvedCount가 낮은 문제를 우선한다. 3. solvedCount가 같으면 해당 그룹 안에서 무작위로 출제한다.
     */
    public ExamQuestionCreateResponse createQuestions(
            ExamQuestionCreateRequest request
    ) {
        validateQuestionCreateRequest(request);
        validateDuplicateFolderSelections(request.folderSelections());

        int totalProblemCount =
                calculateTotalProblemCount(request.folderSelections());

        List<ExamProblemResponse> problemResponses =
                new ArrayList<>(totalProblemCount);

        int orderNumber = 1;

        for (ExamFolderSelectionRequest selection
                : request.folderSelections()) {

            Folder folder = getFolder(selection.folderId());

            validateLeafFolder(folder);

            List<Problem> selectedProblems = selectProblems(
                    folder,
                    selection.problemCount()
            );

            for (Problem problem : selectedProblems) {
                problemResponses.add(
                        toExamProblemResponse(
                                problem,
                                orderNumber
                        )
                );

                orderNumber++;
            }
        }

        int timeLimitSeconds = Math.multiplyExact(
                totalProblemCount,
                SECONDS_PER_PROBLEM
        );

        return new ExamQuestionCreateResponse(
                totalProblemCount,
                timeLimitSeconds,
                problemResponses
        );
    }

    /**
     * 시험에 포함된 모든 문제를 ProblemSubmission으로 저장한다.
     * <p>
     * 아직 AI 채점이나 사용자 자기평가를 하지 않으므로 isCorrect는 null로 저장한다.
     */
    @Transactional
    public ExamAnswerResponse submitExam(
            ExamAnswerRequest request
    ) {
        validateSubmissionRequest(request);
        validateDuplicateProblemIds(request.problemIds());

        List<Long> requestedProblemIds = request.problemIds();

        List<Problem> foundProblems =
                problemRepository.findAllWithFolderByProblemIdIn(
                        requestedProblemIds
                );

        Map<Long, Problem> problemMap = new HashMap<>();

        for (Problem problem : foundProblems) {
            problemMap.put(
                    problem.getProblemId(),
                    problem
            );
        }

        List<Problem> orderedProblems =
                restoreRequestedProblemOrder(
                        requestedProblemIds,
                        problemMap
                );

        List<Integer> elapsedSecondsPerProblem =
                distributeElapsedSeconds(
                        request.totalElapsedSeconds(),
                        orderedProblems.size()
                );

        LocalDateTime submittedAt = LocalDateTime.now();

        List<ProblemSubmission> submissions =
                new ArrayList<>(orderedProblems.size());

        for (int index = 0;
             index < orderedProblems.size();
             index++) {

            Problem problem = orderedProblems.get(index);

            int problemElapsedSeconds =
                    elapsedSecondsPerProblem.get(index);

            problem.increaseSolvedCount();

            submissions.add(
                    new ProblemSubmission(
                            problem,
                            null,
                            problemElapsedSeconds,
                            submittedAt
                    )
            );
        }

        /*
         * 하나의 트랜잭션 안에서 전체 제출 기록을 저장한다.
         *
         * 중간에 예외가 발생하면 ProblemSubmission 저장과
         * solvedCount 증가가 모두 롤백된다.
         */
        problemSubmissionRepository.saveAll(submissions);

        List<ExamAnswerProblemResponse> answerResponses =
                createAnswerResponses(
                        orderedProblems,
                        elapsedSecondsPerProblem
                );

        return new ExamAnswerResponse(
                orderedProblems.size(),
                request.totalElapsedSeconds(),
                submittedAt,
                answerResponses
        );
    }

    private List<Problem> selectProblems(
            Folder folder,
            int requestedProblemCount
    ) {
        List<Problem> candidates =
                problemRepository.findBookmarkedExamCandidates(
                        folder.getFolderId()
                );

        if (candidates.size() < requestedProblemCount) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    String.format(
                            "'%s' 폴더의 북마크 문제가 부족합니다. 요청=%d, 출제 가능=%d",
                            folder.getName(),
                            requestedProblemCount,
                            candidates.size()
                    )
            );
        }

        return selectByLowestSolvedCount(
                candidates,
                requestedProblemCount
        );
    }

    /**
     * solvedCount가 낮은 그룹부터 선택한다.
     * <p>
     * 같은 solvedCount를 가진 문제끼리는 무작위로 섞는다.
     */
    private List<Problem> selectByLowestSolvedCount(
            List<Problem> candidates,
            int requestedProblemCount
    ) {
        List<Problem> selectedProblems =
                new ArrayList<>(requestedProblemCount);

        int startIndex = 0;

        while (startIndex < candidates.size()
                && selectedProblems.size() < requestedProblemCount) {

            int currentSolvedCount = normalizeSolvedCount(
                    candidates.get(startIndex).getSolvedCount()
            );

            int endIndex = startIndex + 1;

            while (endIndex < candidates.size()) {
                int nextSolvedCount = normalizeSolvedCount(
                        candidates.get(endIndex).getSolvedCount()
                );

                if (nextSolvedCount != currentSolvedCount) {
                    break;
                }

                endIndex++;
            }

            List<Problem> sameSolvedCountProblems =
                    new ArrayList<>(
                            candidates.subList(
                                    startIndex,
                                    endIndex
                            )
                    );

            Collections.shuffle(sameSolvedCountProblems);

            int remainingCount =
                    requestedProblemCount
                            - selectedProblems.size();

            int addCount = Math.min(
                    remainingCount,
                    sameSolvedCountProblems.size()
            );

            selectedProblems.addAll(
                    sameSolvedCountProblems.subList(
                            0,
                            addCount
                    )
            );

            startIndex = endIndex;
        }

        return selectedProblems;
    }

    private List<Problem> restoreRequestedProblemOrder(
            List<Long> requestedProblemIds,
            Map<Long, Problem> problemMap
    ) {
        List<Problem> orderedProblems =
                new ArrayList<>(requestedProblemIds.size());

        for (Long problemId : requestedProblemIds) {
            Problem problem = problemMap.get(problemId);

            if (problem == null) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "존재하지 않는 문제입니다. problemId="
                                + problemId
                );
            }

            orderedProblems.add(problem);
        }

        return orderedProblems;
    }

    /**
     * 시험 전체 소요 시간을 문제 수로 나눈다.
     * <p>
     * 나머지 초는 앞 문제부터 1초씩 추가하여 문제별 elapsedSeconds 합계가 전체 시간과 정확히 일치하도록 한다.
     */
    private List<Integer> distributeElapsedSeconds(
            int totalElapsedSeconds,
            int problemCount
    ) {
        if (problemCount <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "제출할 문제가 하나 이상 필요합니다."
            );
        }

        int baseElapsedSeconds =
                totalElapsedSeconds / problemCount;

        int remainder =
                totalElapsedSeconds % problemCount;

        List<Integer> distributed =
                new ArrayList<>(problemCount);

        for (int index = 0;
             index < problemCount;
             index++) {

            int elapsedSeconds =
                    baseElapsedSeconds
                            + (index < remainder ? 1 : 0);

            distributed.add(elapsedSeconds);
        }

        return distributed;
    }

    private List<ExamAnswerProblemResponse> createAnswerResponses(
            List<Problem> orderedProblems,
            List<Integer> elapsedSecondsPerProblem
    ) {
        List<ExamAnswerProblemResponse> responses =
                new ArrayList<>(orderedProblems.size());

        for (int index = 0;
             index < orderedProblems.size();
             index++) {

            Problem problem = orderedProblems.get(index);
            Folder folder = problem.getFolder();

            responses.add(
                    new ExamAnswerProblemResponse(
                            problem.getProblemId(),
                            index + 1,
                            problem.getProblemNum(),
                            folder.getFolderId(),
                            folder.getName(),
                            folder.getFullPath(),
                            problem.getQuestionText(),
                            problem.getAnswerText(),
                            problem.getExplanationText(),
                            elapsedSecondsPerProblem.get(index)
                    )
            );
        }

        return responses;
    }

    private ExamProblemResponse toExamProblemResponse(
            Problem problem,
            int orderNumber
    ) {
        Folder folder = problem.getFolder();

        return new ExamProblemResponse(
                problem.getProblemId(),
                orderNumber,
                problem.getProblemNum(),
                folder.getFolderId(),
                folder.getName(),
                folder.getFullPath(),
                problem.getQuestionText()
        );
    }

    private Folder getFolder(Long folderId) {
        return folderRepository.findById(folderId)
                .orElseThrow(
                        () -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "존재하지 않는 폴더입니다. folderId="
                                        + folderId
                        )
                );
    }

    private void validateLeafFolder(Folder folder) {
        boolean hasChildFolder =
                folderRepository.existsByParentFolder_FolderId(
                        folder.getFolderId()
                );

        if (hasChildFolder) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    String.format(
                            "'%s' 폴더는 리프 폴더가 아닙니다.",
                            folder.getName()
                    )
            );
        }
    }

    private void validateQuestionCreateRequest(
            ExamQuestionCreateRequest request
    ) {
        if (request == null
                || request.folderSelections() == null
                || request.folderSelections().isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "시험 범위 폴더를 하나 이상 선택해야 합니다."
            );
        }

        for (ExamFolderSelectionRequest selection
                : request.folderSelections()) {

            if (selection == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "폴더 선택 정보는 null일 수 없습니다."
                );
            }

            if (selection.folderId() == null
                    || selection.folderId() <= 0) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "올바른 폴더 ID를 입력해야 합니다."
                );
            }

            if (selection.problemCount() == null
                    || selection.problemCount() <= 0) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "폴더별 출제 문제 수는 1개 이상이어야 합니다."
                );
            }
        }
    }

    private void validateSubmissionRequest(
            ExamAnswerRequest request
    ) {
        if (request == null
                || request.problemIds() == null
                || request.problemIds().isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "제출할 문제 ID가 하나 이상 필요합니다."
            );
        }

        if (request.totalElapsedSeconds() == null
                || request.totalElapsedSeconds() < 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "시험 전체 소요 시간은 0초 이상이어야 합니다."
            );
        }

        for (Long problemId : request.problemIds()) {
            if (problemId == null || problemId <= 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "올바른 문제 ID를 입력해야 합니다."
                );
            }
        }
    }

    private void validateDuplicateFolderSelections(
            List<ExamFolderSelectionRequest> selections
    ) {
        Set<Long> folderIds = new HashSet<>();

        for (ExamFolderSelectionRequest selection : selections) {
            if (!folderIds.add(selection.folderId())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "동일한 폴더를 중복 선택할 수 없습니다. folderId="
                                + selection.folderId()
                );
            }
        }
    }

    private void validateDuplicateProblemIds(
            List<Long> problemIds
    ) {
        Set<Long> uniqueProblemIds =
                new LinkedHashSet<>(problemIds);

        if (uniqueProblemIds.size() != problemIds.size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "동일한 문제를 중복 제출할 수 없습니다."
            );
        }
    }

    private int calculateTotalProblemCount(
            List<ExamFolderSelectionRequest> selections
    ) {
        long totalProblemCount = 0;

        for (ExamFolderSelectionRequest selection : selections) {
            totalProblemCount += selection.problemCount();
        }

        long maximumSafeProblemCount =
                Integer.MAX_VALUE / SECONDS_PER_PROBLEM;

        if (totalProblemCount > maximumSafeProblemCount) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "요청한 시험 문제 수가 너무 많습니다."
            );
        }

        return Math.toIntExact(totalProblemCount);
    }

    private int normalizeSolvedCount(
            Integer solvedCount
    ) {
        return Objects.requireNonNullElse(
                solvedCount,
                0
        );
    }
}