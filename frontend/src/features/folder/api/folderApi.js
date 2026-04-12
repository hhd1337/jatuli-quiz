import { apiClient } from "../../../shared/api/client";

export async function getFolderChildren(folderId) {
    const response = await apiClient.get(`/api/v1/folders/${folderId}/children`);
    return response.data;
}