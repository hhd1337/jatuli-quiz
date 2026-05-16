import { apiClient } from "./client.js";

function toNonNegativeNumber(value, fallback = 0) {
    const numberValue = Number(value);

    if (!Number.isFinite(numberValue)) {
        return fallback;
    }

    return Math.max(0, Math.floor(numberValue));
}

function normalizeExplanationToBlocks(explanation) {
    if (!explanation || typeof explanation !== "string") {
        return [];
    }

    return explanation
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((text) => ({
            type: "TEXT",
            text,
        }));
}

function normalizeProblem(rawProblem, index) {
    const problem = rawProblem ?? {};

    const explanationText =
        problem.explanationText ??
        problem.explanation ??
        "";

    const explanationBlocks = Array.isArray(problem.explanationBlocks)
        ? problem.explanationBlocks
        : normalizeExplanationToBlocks(explanationText);

    return {
        ...problem,
        problemId: problem.problemId ?? null,
        questionNo:
            problem.questionNo ??
            problem.problemNum ??
            index + 1,
        questionText:
            problem.questionText ??
            problem.question ??
            "",
        answerText:
            problem.answerText ??
            problem.answer ??
            "",
        explanationText,
        explanationBlocks,
        questionImages: Array.isArray(problem.questionImages)
            ? problem.questionImages
            : [],
        meta: {
            ...(problem.meta ?? {}),
            isBookmarked:
                problem.meta?.isBookmarked ??
                problem.isBookmarked ??
                true,
            attemptCount: toNonNegativeNumber(
                problem.meta?.attemptCount ?? problem.solvedCount,
                0
            ),
        },
    };
}

function normalizePracticeResponse(raw, fallbackTitlePath) {
    const problems = Array.isArray(raw?.problems) ? raw.problems : [];

    return {
        ...raw,
        titlePath:
            raw?.titlePath ??
            raw?.folderPath ??
            raw?.path ??
            fallbackTitlePath,
        problems: problems.map((problem, index) =>
            normalizeProblem(problem, index)
        ),
    };
}

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