import { apiClient } from "./client.js";
import {
    normalizePracticeResponse,
    normalizeProblem,
} from "./problemNormalizer.js";

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

export async function importProblemsText({ folderId, rawText }) {
    const response = await apiClient.post(
        "/api/v1/problems/import/text",
        rawText,
        {
            params: {
                folderId,
            },
            headers: {
                "Content-Type": "text/plain",
            },
        }
    );

    const result = response.data.result ?? {};

    return {
        ...result,
        folderId: result.folderId ?? folderId,
        savedCount: result.savedCount ?? 0,
        problems: Array.isArray(result.problems)
            ? result.problems.map((problem, index) =>
                normalizeProblem(problem, index)
            )
            : [],
    };
}

export async function toggleProblemBookmark(problemId) {
    if (!problemId) {
        throw new Error("problemId is required");
    }

    const response = await apiClient.post(
        `/api/v1/problems/${problemId}/bookmark`
    );

    const result = response.data.result ?? {};

    return {
        problemId: result.problemId ?? problemId,
        isBookmarked: !!result.isBookmarked,
    };
}