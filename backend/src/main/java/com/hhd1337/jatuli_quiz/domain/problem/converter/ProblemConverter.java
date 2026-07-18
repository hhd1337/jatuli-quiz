package com.hhd1337.jatuli_quiz.domain.problem.converter;

import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import com.hhd1337.jatuli_quiz.domain.practice.dto.PracticeResponse;
import com.hhd1337.jatuli_quiz.domain.problem.dto.ProblemBookmarkResponse;
import com.hhd1337.jatuli_quiz.domain.problem.dto.ProblemCopyResponse;
import com.hhd1337.jatuli_quiz.domain.problem.dto.ProblemImportResponse;
import com.hhd1337.jatuli_quiz.domain.problem.dto.ProblemUpdateResponse;
import com.hhd1337.jatuli_quiz.domain.problem.entity.Problem;
import java.util.List;

public class ProblemConverter {

    private ProblemConverter() {
    }

    public static ProblemBookmarkResponse.ToggleBookmarkResponse toToggleBookmarkResponse(Problem problem) {
        return ProblemBookmarkResponse.ToggleBookmarkResponse.builder()
                .problemId(problem.getProblemId())
                .isBookmarked(problem.getIsBookmarked())
                .build();
    }

    public static ProblemImportResponse.ImportedProblemItem toImportedProblemItem(Problem problem) {
        return ProblemImportResponse.ImportedProblemItem.builder()
                .problemId(problem.getProblemId())
                .problemNum(problem.getProblemNum())
                .questionText(problem.getQuestionText())
                .build();
    }

    public static ProblemImportResponse.ImportProblemsFromTextResponse toImportProblemsFromTextResponse(
            Long folderId,
            List<Problem> savedProblems
    ) {
        return ProblemImportResponse.ImportProblemsFromTextResponse.builder()
                .folderId(folderId)
                .savedCount(savedProblems.size())
                .problems(savedProblems.stream()
                        .map(ProblemConverter::toImportedProblemItem)
                        .toList())
                .build();
    }

    public static PracticeResponse.BookmarkedPracticeProblemItem toBookmarkedPracticeProblemItem(
            Problem problem
    ) {
        Folder folder = problem.getFolder();

        return PracticeResponse.BookmarkedPracticeProblemItem.builder()
                .problemId(problem.getProblemId())
                .problemNum(problem.getProblemNum())
                .questionText(problem.getQuestionText())
                .explanationText(problem.getExplanationText())
                .answerText(problem.getAnswerText())
                .isBookmarked(problem.getIsBookmarked())
                .solvedCount(problem.getSolvedCount())
                .folderId(folder.getFolderId())
                .folderName(folder.getName())
                .folderPath(folder.getFullPath())
                .build();
    }

    public static PracticeResponse.GetBookmarkedPracticeProblemsResponse toBookmarkedPracticeProblemsResponse(
            Integer requestedSize,
            Integer folderProblemLimit,
            Long nextStartLeafFolderId,
            List<Problem> problems
    ) {
        return PracticeResponse.GetBookmarkedPracticeProblemsResponse.builder()
                .selectionRule("BOOKMARKED_LEAF_ROUND_ROBIN")
                .requestedSize(requestedSize)
                .returnedSize(problems.size())
                .folderProblemLimit(folderProblemLimit)
                .nextStartLeafFolderId(nextStartLeafFolderId)
                .problems(problems.stream()
                        .map(ProblemConverter::toBookmarkedPracticeProblemItem)
                        .toList())
                .build();
    }

    public static ProblemCopyResponse.CopyProblemsResponse toCopyProblemsResponse(
            Long folderId,
            List<Problem> problems
    ) {
        List<ProblemCopyResponse.CopyProblemItem> problemItems = problems.stream()
                .map(ProblemConverter::toCopyProblemItem)
                .toList();

        return ProblemCopyResponse.CopyProblemsResponse.builder()
                .folderId(folderId)
                .totalCount(problemItems.size())
                .problems(problemItems)
                .build();
    }

    private static ProblemCopyResponse.CopyProblemItem toCopyProblemItem(Problem problem) {
        return ProblemCopyResponse.CopyProblemItem.builder()
                .problemId(problem.getProblemId())
                .problemNum(problem.getProblemNum())
                .questionText(problem.getQuestionText())
                .explanationText(problem.getExplanationText())
                .answerText(problem.getAnswerText())
                .build();
    }

    public static ProblemUpdateResponse.UpdateProblemResponse toUpdateProblemResponse(
            Problem problem
    ) {
        Folder folder = problem.getFolder();

        return ProblemUpdateResponse.UpdateProblemResponse.builder()
                .problemId(problem.getProblemId())
                .problemNum(problem.getProblemNum())
                .questionText(problem.getQuestionText())
                .explanationText(problem.getExplanationText())
                .answerText(problem.getAnswerText())
                .isBookmarked(problem.getIsBookmarked())
                .solvedCount(problem.getSolvedCount())
                .folderId(folder.getFolderId())
                .folderName(folder.getName())
                .folderPath(folder.getFullPath())
                .build();
    }
}