package com.hhd1337.jatuli_quiz.domain.problem.service;

import com.hhd1337.jatuli_quiz.common.exception.GeneralException;
import com.hhd1337.jatuli_quiz.common.exception.code.status.ErrorStatus;
import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import com.hhd1337.jatuli_quiz.domain.folder.repository.FolderRepository;
import com.hhd1337.jatuli_quiz.domain.problem.converter.ProblemConverter;
import com.hhd1337.jatuli_quiz.domain.problem.dto.ParsedProblemContent;
import com.hhd1337.jatuli_quiz.domain.problem.dto.ProblemBookmarkResponse;
import com.hhd1337.jatuli_quiz.domain.problem.dto.ProblemImportRequest;
import com.hhd1337.jatuli_quiz.domain.problem.dto.ProblemImportResponse;
import com.hhd1337.jatuli_quiz.domain.problem.entity.Problem;
import com.hhd1337.jatuli_quiz.domain.problem.repository.ProblemRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProblemCommandServiceImpl implements ProblemCommandService {

    private final ProblemRepository problemRepository;
    private final FolderRepository folderRepository;
    private final ProblemTextParser problemTextParser;

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
}