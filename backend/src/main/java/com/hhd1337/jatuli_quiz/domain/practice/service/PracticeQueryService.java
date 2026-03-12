package com.hhd1337.jatuli_quiz.domain.practice.service;

import com.hhd1337.jatuli_quiz.domain.practice.dto.PracticeResponse;

public interface PracticeQueryService {

    PracticeResponse.GetPracticeProblemsResponse getBookmarkedPracticeProblems();
}