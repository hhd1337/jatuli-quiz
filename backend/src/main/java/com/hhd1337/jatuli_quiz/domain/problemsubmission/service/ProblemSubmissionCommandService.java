package com.hhd1337.jatuli_quiz.domain.problemsubmission.service;

import com.hhd1337.jatuli_quiz.domain.problemsubmission.dto.ProblemSubmissionRequest;
import com.hhd1337.jatuli_quiz.domain.problemsubmission.dto.ProblemSubmissionResponse;

public interface ProblemSubmissionCommandService {

    ProblemSubmissionResponse.CreateProblemSubmissionResponse submit(
            ProblemSubmissionRequest.CreateProblemSubmissionRequest request
    );
}
