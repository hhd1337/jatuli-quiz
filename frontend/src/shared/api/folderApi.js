import { apiClient } from "./client";
import { normalizePracticeResponse } from "./problemNormalizer";

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
            ? breadcrumb.map((item) => item.name).filter(Boolean).join("/")
            : "/";

    return {
        folderId: breadcrumb[breadcrumb.length - 1]?.folderId ?? null,
        titlePath,
        depth: breadcrumb.length,
        sections: [
            {
                sectionId: "children",
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

export async function getFolderChildren(folderId) {
    const response = await apiClient.get(`/api/v1/folders/${folderId}/children`);
    return normalizeFolderChildren(response.data.result);
}

export async function getFolderPractice(folderId) {
    const response = await apiClient.get(`/api/v1/folders/${folderId}/practice`);

    return normalizePracticeResponse(
        response.data.result,
        ""
    );
}