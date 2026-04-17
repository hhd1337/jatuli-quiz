import { apiClient } from "./client";

function normalizeFolderChildren(raw) {
    const breadcrumb = Array.isArray(raw?.breadcrumb) ? raw.breadcrumb : [];
    const folders = Array.isArray(raw?.folders) ? raw.folders : [];

    const titlePath =
        breadcrumb.length > 0
            ? "/" + breadcrumb.map((item) => item.name).join("/")
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
                    solvedCount: folder.solved ?? 0,
                    totalCount: folder.total ?? 0,
                    isLeaf: !folder.hasChildren,
                })),
            },
        ],
    };
}

function toExplanationBlocks(rawProblem) {
    if (Array.isArray(rawProblem?.explanationBlocks)) {
        return rawProblem.explanationBlocks;
    }

    if (typeof rawProblem?.explanationText === "string") {
        return rawProblem.explanationText
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .map((text) => ({
                type: "TEXT",
                text,
            }));
    }

    return [];
}

function normalizePracticeResponse(raw) {
    return {
        folderId: raw?.folderId ?? null,
        titlePath: raw?.titlePath ?? "",
        selectionRule: raw?.selectionRule ?? "FOLDER_ALL",
        problems: Array.isArray(raw?.problems)
            ? raw.problems.map((problem, index) => ({
                problemId: problem?.problemId ?? null,
                titlePath: problem?.titlePath ?? raw?.titlePath ?? "",
                questionNo:
                    problem?.questionNo ??
                    problem?.problemNo ??
                    problem?.problemNum ??
                    index + 1,
                questionText: problem?.questionText ?? "",
                questionImages: Array.isArray(problem?.questionImages)
                    ? problem.questionImages
                    : [],
                answerText: problem?.answerText ?? "",
                explanationBlocks: toExplanationBlocks(problem),
                meta: {
                    attemptCount:
                        problem?.meta?.attemptCount ?? problem?.attemptCount ?? 0,
                    isBookmarked:
                        problem?.meta?.isBookmarked ?? problem?.isBookmarked ?? false,
                },
            }))
            : [],
    };
}

export async function getFolderChildren(folderId) {
    const response = await apiClient.get(`/api/v1/folders/${folderId}/children`);
    return normalizeFolderChildren(response.data.result);
}

export async function getFolderPractice(folderId) {
    const response = await apiClient.get(`/api/v1/folders/${folderId}/practice`);
    return normalizePracticeResponse(response.data.result);
}