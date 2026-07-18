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

export async function getFolderPracticeCursor(folderId) {
    if (!folderId) {
        throw new Error("folderId is required");
    }

    const response = await apiClient.get(
        `/api/v1/folders/${folderId}/practice-cursor`
    );

    const result = response.data.result ?? {};

    return {
        hasCursor: !!result.hasCursor,
        nextProblemId: result.nextProblemId ?? null,
        nextProblemIndex: Number.isFinite(Number(result.nextProblemIndex))
            ? Number(result.nextProblemIndex)
            : 0,
        nextProblemNumber: Number.isFinite(Number(result.nextProblemNumber))
            ? Number(result.nextProblemNumber)
            : 1,
        totalProblemCount: Number.isFinite(Number(result.totalProblemCount))
            ? Number(result.totalProblemCount)
            : 0,
    };
}

export async function submitProblemSubmission({
                                                  problemId,
                                                  isCorrect,
                                                  elapsedSeconds,
                                                  practiceMode,
                                                  folderId,
                                              }) {
    const payload = {
        problemId,
        isCorrect,
        elapsedSeconds,
    };

    if (practiceMode) {
        payload.practiceMode = practiceMode;
    }

    if (folderId) {
        payload.folderId = folderId;
    }

    const response = await apiClient.post("/api/v1/problem-submissions", payload);

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

export async function getFolderProblemsForCopy(folderId) {
    const response = await apiClient.get(
        `/api/v1/problems/folders/${folderId}/copy`
    );

    return response.data.result;
}

export async function updateProblem({
                                        problemId,
                                        questionText,
                                        explanationText,
                                        answerText,
                                    }) {
    if (!problemId) {
        throw new Error("problemId is required");
    }

    const response = await apiClient.put(
        `/api/v1/problems/${problemId}`,
        {
            questionText,
            explanationText,
            answerText,
        }
    );

    const result = response.data.result ?? {};

    return {
        problemId: result.problemId ?? problemId,
        questionText: result.questionText ?? questionText,
        explanationText:
            result.explanationText ?? explanationText,
        answerText: result.answerText ?? answerText,
    };
}