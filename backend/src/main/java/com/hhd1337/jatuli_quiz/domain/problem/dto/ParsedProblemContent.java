package com.hhd1337.jatuli_quiz.domain.problem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ParsedProblemContent {
    private Integer originalProblemNum;
    private String questionText;
    private String explanationText;
    private String answerText;
}