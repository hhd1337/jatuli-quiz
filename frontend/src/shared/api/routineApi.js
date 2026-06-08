import { apiClient } from "./client";

export async function getDailyRoutine(date) {
    const response = await apiClient.get("/api/v1/routines/daily", {
        params: { date },
    });

    return response.data.result;
}

export async function saveDailyRoutine(payload) {
    const response = await apiClient.put("/api/v1/routines/daily", payload);

    return response.data.result;
}

export async function completeRoutinePeriod(periodId) {
    const response = await apiClient.patch(
        `/api/v1/routines/periods/${periodId}/complete`
    );

    return response.data.result;
}

export async function skipRoutinePeriod(periodId) {
    const response = await apiClient.patch(
        `/api/v1/routines/periods/${periodId}/skip`
    );

    return response.data.result;
}

export async function resetRoutinePeriod(periodId) {
    const response = await apiClient.patch(
        `/api/v1/routines/periods/${periodId}/pending`
    );

    return response.data.result;
}