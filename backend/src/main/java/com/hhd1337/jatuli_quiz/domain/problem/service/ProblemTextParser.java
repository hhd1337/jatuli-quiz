package com.hhd1337.jatuli_quiz.domain.problem.service;

import com.hhd1337.jatuli_quiz.common.exception.GeneralException;
import com.hhd1337.jatuli_quiz.common.exception.code.status.ErrorStatus;
import com.hhd1337.jatuli_quiz.domain.problem.dto.ParsedProblemContent;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class ProblemTextParser {

    /**
     * 지원 포맷 예시 ### 문제 1 질문...
     * <p>
     * 해설 설명...
     * <p>
     * 정답 답...
     * <p>
     * ---
     */
    private static final Pattern PROBLEM_BLOCK_PATTERN = Pattern.compile(
            "###\\s*문제\\s*(\\d+)\\s*\\R" +          // 문제 번호
                    "(.*?)\\R+해설\\s*\\R" +                 // 질문 본문
                    "(.*?)\\R+정답\\s*\\R" +                 // 해설 본문
                    "(.*?)(?=\\R+---\\R*|\\z)",              // 정답 본문
            Pattern.DOTALL
    );

    public List<ParsedProblemContent> parse(String rawText) {
        if (rawText == null || rawText.isBlank()) {
            throw new GeneralException(ErrorStatus.INVALID_INPUT_VALUE);
        }

        String normalized = normalize(rawText);
        Matcher matcher = PROBLEM_BLOCK_PATTERN.matcher(normalized);

        List<ParsedProblemContent> results = new ArrayList<>();

        while (matcher.find()) {
            Integer originalProblemNum = Integer.parseInt(matcher.group(1).trim());
            String questionText = clean(matcher.group(2));
            String explanationText = clean(matcher.group(3));
            String answerText = clean(matcher.group(4));

            validateBlock(questionText, explanationText, answerText);

            results.add(ParsedProblemContent.builder()
                    .originalProblemNum(originalProblemNum)
                    .questionText(questionText)
                    .explanationText(explanationText)
                    .answerText(answerText)
                    .build());
        }

        if (results.isEmpty()) {
            throw new GeneralException(ErrorStatus.PROBLEM_TEXT_PARSE_FAILED);
        }

        return results;
    }

    private String normalize(String rawText) {
        return rawText.replace("\r\n", "\n")
                .replace("\r", "\n")
                .trim();
    }

    private String clean(String text) {
        if (text == null) {
            return "";
        }
        return text.trim();
    }

    private void validateBlock(String questionText, String explanationText, String answerText) {
        if (questionText.isBlank() || explanationText.isBlank() || answerText.isBlank()) {
            throw new GeneralException(ErrorStatus.PROBLEM_TEXT_PARSE_FAILED);
        }
    }
}