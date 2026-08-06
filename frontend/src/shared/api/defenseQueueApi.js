import { apiClient } from "./client";

function normalizeQueueEntry(raw) {
    return {
        folderId: raw?.folderId,
        folderName: raw?.folderName ?? "",
        folderFullPath: raw?.folderFullPath ?? "",
        totalProblemCount: Number(raw?.totalProblemCount) || 0,
        queueOrder: Number(raw?.queueOrder) || 0,
    };
}

function normalizeQueueResponse(raw) {
    const entries = Array.isArray(raw?.entries) ? raw.entries.map(normalizeQueueEntry) : [];

    return {
        totalCount: Number(raw?.totalCount) || entries.length,
        entries,
    };
}

export async function getDefenseQueue() {
    const response = await apiClient.get("/api/v1/defense-queue");
    return normalizeQueueResponse(response.data.result);
}

export async function addToDefenseQueue(folderId) {
    const response = await apiClient.post("/api/v1/defense-queue", { folderId });
    return normalizeQueueResponse(response.data.result);
}

export async function removeFromDefenseQueue(folderId) {
    const response = await apiClient.delete(`/api/v1/defense-queue/${folderId}`);
    return normalizeQueueResponse(response.data.result);
}

export async function reorderDefenseQueue(orderedFolderIds) {
    const response = await apiClient.patch("/api/v1/defense-queue/order", {
        orderedFolderIds,
    });
    return normalizeQueueResponse(response.data.result);
}

export async function searchLeafFolders(query) {
    const trimmed = (query ?? "").trim();

    if (!trimmed) {
        return [];
    }

    const response = await apiClient.get("/api/v1/folders/search", {
        params: { query: trimmed },
    });

    const folders = Array.isArray(response.data.result?.folders)
        ? response.data.result.folders
        : [];

    return folders.map((folder) => ({
        folderId: folder?.folderId,
        name: folder?.name ?? "",
        fullPath: folder?.fullPath ?? "",
        totalProblemCount: Number(folder?.totalProblemCount) || 0,
    }));
}
