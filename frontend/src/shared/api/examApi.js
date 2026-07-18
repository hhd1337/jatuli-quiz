import { apiClient } from "./client.js";

function unwrapResult(data) {
    return data?.result ?? data;
}

function normalizeError(error, fallbackMessage) {
    const responseData = error?.response?.data;

    if (typeof responseData?.message === "string") {
        return new Error(responseData.message);
    }

    if (typeof responseData?.detail === "string") {
        return new Error(responseData.detail);
    }

    if (typeof error?.message === "string") {
        return new Error(error.message);
    }

    return new Error(fallbackMessage);
}

/**
 * 시험 문제 출제
 *
 * @param {{
 *   folderSelections: {
 *     folderId: number,
 *     problemCount: number
 *   }[],
 *   minutesPerProblem: number
 * }} request
 */
export async function createExamQuestions({
                                              folderSelections,
                                              minutesPerProblem,
                                          }) {
    try {
        const response = await apiClient.post(
            "/api/v1/exams/questions",
            {
                folderSelections,
                minutesPerProblem,
            }
        );

        return unwrapResult(response.data);
    } catch (error) {
        throw normalizeError(
            error,
            "시험 문제를 생성하지 못했습니다."
        );
    }
}

/**
 * 시험 문제 일괄 제출
 *
 * @param {{
 *   problemIds: number[],
 *   totalElapsedSeconds: number
 * }} request
 */
export async function submitExam({
                                     problemIds,
                                     totalElapsedSeconds,
                                 }) {
    try {
        const response = await apiClient.post(
            "/api/v1/exams/submissions",
            {
                problemIds,
                totalElapsedSeconds,
            }
        );

        return unwrapResult(response.data);
    } catch (error) {
        throw normalizeError(
            error,
            "시험을 제출하지 못했습니다."
        );
    }
}

/**
 * 시험 범위 선택용 폴더 트리를 조회한다.
 *
 * 백엔드의 폴더 children API를 재귀 호출하여
 * 부모-자식 관계가 유지된 트리를 생성한다.
 */
export async function getExamFolderTree(rootFolderId = 1) {
    async function loadChildren(parentFolderId, parentPath = "") {
        const response = await apiClient.get(
            `/api/v1/folders/${parentFolderId}/children`
        );

        const result = unwrapResult(response.data);

        const folders = Array.isArray(result?.folders)
            ? result.folders
            : [];

        return Promise.all(
            folders.map(async (folder) => {
                const folderId = Number(folder.folderId);

                const name =
                    folder.name ?? `폴더 ${folderId}`;

                const fullPath = parentPath
                    ? `${parentPath} / ${name}`
                    : name;

                const hasChildren = Boolean(
                    folder.hasChildren ??
                    folder.children?.length > 0
                );

                const children = hasChildren
                    ? await loadChildren(folderId, fullPath)
                    : [];

                return {
                    folderId,
                    name,
                    fullPath,
                    hasChildren,
                    leaf: !hasChildren,
                    totalProblemCount: Math.max(
                        0,
                        Number(
                            folder.total ??
                            folder.totalCount ??
                            folder.problemCount ??
                            0
                        )
                    ),
                    children,
                };
            })
        );
    }

    try {
        return await loadChildren(rootFolderId);
    } catch (error) {
        throw normalizeError(
            error,
            "시험 범위 폴더를 불러오지 못했습니다."
        );
    }
}