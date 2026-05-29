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

export function normalizeProblem(rawProblem, index = 0) {
    const problem = rawProblem ?? {};

    const explanationText =
        problem.explanationText ??
        problem.explanation ??
        "";

    const answerText =
        problem.answerText ??
        problem.answer ??
        "";

    const questionText =
        problem.questionText ??
        problem.question ??
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

        questionText,
        answerText,
        explanationText,
        explanationBlocks,

        questionImages: Array.isArray(problem.questionImages)
            ? problem.questionImages
            : [],

        meta: {
            ...(problem.meta ?? {}),
            attemptCount: toNonNegativeNumber(
                problem.meta?.attemptCount ??
                problem.attemptCount ??
                problem.solvedCount,
                0
            ),
            isBookmarked:
                problem.meta?.isBookmarked ??
                problem.isBookmarked ??
                false,
        },
    };
}

export function normalizePracticeResponse(raw, fallbackTitlePath = "") {
    const problems = Array.isArray(raw?.problems) ? raw.problems : [];

    return {
        ...raw,
        titlePath:
            raw?.titlePath ??
            raw?.folderPath ??
            raw?.path ??
            fallbackTitlePath,
        selectionRule: raw?.selectionRule ?? "ALL",
        problems: problems.map((problem, index) =>
            normalizeProblem(problem, index)
        ),
    };
}