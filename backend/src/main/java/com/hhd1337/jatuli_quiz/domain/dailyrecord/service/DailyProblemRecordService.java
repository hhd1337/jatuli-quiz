package com.hhd1337.jatuli_quiz.domain.dailyrecord.service;

import com.hhd1337.jatuli_quiz.config.GithubDailyUploadProperties;
import com.hhd1337.jatuli_quiz.domain.dailyrecord.converter.DailyProblemMarkdownGenerator;
import com.hhd1337.jatuli_quiz.domain.dailyrecord.dto.DailySolvedProblemDto;
import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import com.hhd1337.jatuli_quiz.domain.problem.entity.Problem;
import com.hhd1337.jatuli_quiz.domain.problem.repository.ProblemRepository;
import com.hhd1337.jatuli_quiz.domain.problemsubmission.repository.ProblemSubmissionRepository;
import com.hhd1337.jatuli_quiz.infra.github.GithubContentsClient;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DailyProblemRecordService {

    private static final String KST_MIDNIGHT_TIME = "00:00:00";

    private final GithubDailyUploadProperties properties;
    private final ProblemSubmissionRepository problemSubmissionRepository;
    private final ProblemRepository problemRepository;
    private final DailyProblemMarkdownGenerator markdownGenerator;
    private final GithubContentsClient githubContentsClient;

    @Transactional(readOnly = true)
    public void uploadDailyRecord(LocalDate targetDate) {
        if (!properties.enabled()) {
            log.info("[GitHub Daily Upload] 기능이 비활성화되어 있습니다. targetDate={}", targetDate);
            return;
        }

        LocalDateTime startAt = targetDate.atStartOfDay();
        LocalDateTime endAt = targetDate.plusDays(1).atStartOfDay();

        List<Long> solvedProblemIds = problemSubmissionRepository
                .findDistinctProblemIdsSolvedBetween(startAt, endAt);

        if (solvedProblemIds.isEmpty()) {
            log.info("[GitHub Daily Upload] 업로드할 풀이 기록이 없습니다. targetDate={}", targetDate);
            return;
        }

        List<Problem> problems = problemRepository.findAllByProblemIdIn(solvedProblemIds);

        List<DailySolvedProblemDto> dailySolvedProblems = problems.stream()
                .map(problem -> new DailySolvedProblemDto(
                        problem.getProblemNum(),
                        resolveFolderPath(problem.getFolder()),
                        problem.getQuestionText(),
                        problem.getAnswerText(),
                        problem.getExplanationText(),
                        problemSubmissionRepository.countByProblemId(problem.getProblemId())
                ))
                .sorted(Comparator
                        .comparing(DailySolvedProblemDto::folderPath)
                        .thenComparing(DailySolvedProblemDto::problemNum))
                .toList();

        String markdown = markdownGenerator.generate(targetDate, dailySolvedProblems);
        String path = buildGithubFilePath(targetDate);
        String commitMessage = "docs(daily): " + targetDate + " 문제 풀이 기록 업로드";

        githubContentsClient.createOrUpdateFile(path, markdown, commitMessage);

        log.info(
                "[GitHub Daily Upload] 일일 문제 풀이 기록 업로드 완료 targetDate={}, problemCount={}, path={}",
                targetDate,
                dailySolvedProblems.size(),
                path
        );
    }

    private String buildGithubFilePath(LocalDate targetDate) {
        return "%s/%d/%02d/%s.md".formatted(
                properties.basePath(),
                targetDate.getYear(),
                targetDate.getMonthValue(),
                targetDate
        );
    }

    private String resolveFolderPath(Folder folder) {
        if (folder == null) {
            return "/미분류";
        }

        List<String> names = new ArrayList<>();
        Folder current = folder;

        while (current != null) {
            names.add(current.getName());
            current = current.getParentFolder();
        }

        Collections.reverse(names);

        return "/" + String.join("/", names);
    }
}