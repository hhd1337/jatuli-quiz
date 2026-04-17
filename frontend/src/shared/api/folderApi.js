import { apiClient } from "./client";

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
                    solvedCount: folder.solved ?? 0,
                    totalCount: folder.total ?? 0,
                    isLeaf: !folder.hasChildren,
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

function normalizePracticeResponse(raw, folderId) {
    return {
        folderId: Number(folderId),
        titlePath: "",
        selectionRule: raw?.selectionRule ?? "ALL",
        problems: Array.isArray(raw?.problems)
            ? raw.problems.map((problem) => ({
                problemId: problem?.problemId ?? null,
                questionNo: problem?.problemNum ?? 0,
                questionText: problem?.question ?? "",
                questionImages: [],
                answerText: problem?.answer ?? "",
                explanationBlocks: normalizeExplanationToBlocks(problem?.explanation),
                meta: {
                    attemptCount: problem?.meta?.attemptCount ?? 0,
                    isBookmarked: problem?.meta?.isBookmarked ?? false,
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
    return normalizePracticeResponse(response.data.result, folderId);
}