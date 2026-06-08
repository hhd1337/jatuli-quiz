package com.hhd1337.jatuli_quiz.domain.dailyrecord.converter;

import com.hhd1337.jatuli_quiz.domain.dailyrecord.dto.DailySolvedProblemDto;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class DailyProblemMarkdownGenerator {

    public String generate(LocalDate targetDate, List<DailySolvedProblemDto> problems) {
        StringBuilder sb = new StringBuilder();

        appendHeader(sb, targetDate, problems.size());

        for (int i = 0; i < problems.size(); i++) {
            appendProblem(sb, problems.get(i));

            if (i < problems.size() - 1) {
                appendProblemSpacing(sb);
            }
        }

        //appendFooter(sb);

        return sb.toString();
    }

    private void appendHeader(StringBuilder sb, LocalDate targetDate, int problemCount) {
        sb.append("# ")
                .append(targetDate)
                .append(" 문제 풀이 기록\n\n");

        sb.append("> [!NOTE]\n");
        sb.append("> 오늘 풀이한 문제를 자동으로 정리한 기록입니다.  \n");
        sb.append("> 총 **")
                .append(problemCount)
                .append("문제**를 복습했습니다.\n\n");

        sb.append("---\n\n");
    }

    private void appendProblem(StringBuilder sb, DailySolvedProblemDto problem) {
        sb.append("## ◉ ")
                .append(normalizeFolderPath(problem.folderPath()))
                .append(" [")
                .append(problem.problemNum())
                .append("번] ")
                .append("<sub>누적 ")
                .append(problem.totalSolvedCount())
                .append("회</sub>")
                .append("\n\n");

        sb.append("**")
                .append(nullToEmpty(problem.question()))
                .append("**")
                .append("\n\n");

        appendSection(sb, "해설", problem.explanation());
        appendSection(sb, "정답", problem.answer());
    }

    private void appendSection(StringBuilder sb, String title, String content) {
        sb.append("> **")
                .append(title)
                .append("**\n");
        sb.append(">\n");

        appendBlockquoteContent(sb, nullToEmpty(content));

        sb.append("\n");
    }

    private void appendBlockquoteContent(StringBuilder sb, String content) {
        if (content.isBlank()) {
            sb.append("> _내용 없음_\n");
            return;
        }

        String[] lines = content.split("\\R", -1);

        for (String line : lines) {
            if (line.isBlank()) {
                sb.append(">\n");
            } else {
                sb.append("> ")
                        .append(line)
                        .append("\n");
            }
        }
    }

    private void appendProblemSpacing(StringBuilder sb) {
        sb.append("<br>\n\n");
    }

    private void appendFooter(StringBuilder sb) {
        sb.append("<br>\n\n");
        sb.append("## 🏁 오늘의 기록 끝\n\n");
        sb.append("");
    }

    private String normalizeFolderPath(String folderPath) {
        if (folderPath == null || folderPath.isBlank()) {
            return "미분류";
        }

        return folderPath.trim()
                .replaceAll("/{2,}", "/")
                .replaceAll("^/+", "")
                .replaceAll("/+$", "");
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}