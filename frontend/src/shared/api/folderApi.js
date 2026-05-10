import { apiClient } from "./client";

function toNonNegativeNumber(value, fallback = 0) {
    const numberValue = Number(value);

    if (!Number.isFinite(numberValue)) {
        return fallback;
    }

    return Math.max(0, Math.floor(numberValue));
}

function normalizeFolderChildren(raw) {
    const breadcrumb = Array.isArray(raw?.breadcrumb) ? raw.breadcrumb : [];
    const folders = Array.isArray(raw?.folders) ? raw.folders : [];

    const titlePath =
        breadcrumb.length > 0
            ? "/" + breadcrumb.map((item) => item.name).filter(Boolean).join("/")
            : "/";

    return {
        folderId: breadcrumb[breadcrumb.length - 1]?.folderId ?? null,
        titlePath,
        depth: breadcrumb.length,
        sections: [
            {
                sectionId: "children",
                title: "하위 폴더",
                children: folders.map((folder) => ({
                    folderId: folder.folderId,
                    name: folder.name ?? "",
                    solvedCount: toNonNegativeNumber(
                        folder.solvedProblemCount ?? folder.solved,
                        0
                    ),
                    totalCount: toNonNegativeNumber(
                        folder.totalProblemCount ?? folder.total,
                        0
                    ),
                    isLeaf: folder.isLeaf ?? !folder.hasChildren,
                })),
            },
        ],
    };
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

function normalizePracticeProblem(problem, index) {
    const explanation =
        problem?.explanation ??
        problem?.explanationText ??
        "";

    return {
        problemId: problem?.problemId ?? null,
        questionNo: problem?.questionNo ?? problem?.problemNum ?? index + 1,
        questionText: problem?.question ?? problem?.questionText ?? "",
        questionImages: Array.isArray(problem?.questionImages)
            ? problem.questionImages
            : [],
        answerText: problem?.answer ?? problem?.answerText ?? "",
        explanationBlocks: Array.isArray(problem?.explanationBlocks)
            ? problem.explanationBlocks
            : normalizeExplanationToBlocks(explanation),
        meta: {
            attemptCount: toNonNegativeNumber(
                problem?.meta?.attemptCount ?? problem?.solvedCount,
                0
            ),
            isBookmarked:
                problem?.meta?.isBookmarked ??
                problem?.isBookmarked ??
                false,
        },
    };
}

function normalizePracticeResponse(raw, folderId) {
    const problems = Array.isArray(raw?.problems) ? raw.problems : [];

    return {
        folderId: Number(folderId),
        titlePath: raw?.titlePath ?? raw?.folderPath ?? "",
        selectionRule: raw?.selectionRule ?? "ALL",
        problems: problems.map((problem, index) =>
            normalizePracticeProblem(problem, index)
        ),
    };
}

export async function getFolderChildren(folderId) {
    const response = await apiClient.get(`/api/v1/folders/${folderId}/children`);
    return normalizeFolderChildren(response.data.result);
}

export async function getFolderPractice(folderId) {
    const response = await apiClient.get(`/api/v1/folders/${folderId}/practice`);
    return normalizePracticeResponse(response.data.result, folderId);
}