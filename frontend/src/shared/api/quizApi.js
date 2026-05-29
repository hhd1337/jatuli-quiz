import { apiClient } from "./client.js";
import { normalizePracticeResponse } from "./problemNormalizer.js";

export async function getBookmarkedPractice(problemCount = 10) {
    const response = await apiClient.post(
        "/api/v1/problems/bookmarked/practice",
        {
            problemCount,
        }
    );

    return normalizePracticeResponse(
        response.data.result,
        "북마크 문제 전체 순회"
    );
}

export async function submitProblemSubmission({
                                                  problemId,
                                                  isCorrect,
                                                  elapsedSeconds,
                                              }) {
    const response = await apiClient.post("/problem-submissions", {
        problemId,
        isCorrect,
        elapsedSeconds,
    });

    return response.data.result;
}