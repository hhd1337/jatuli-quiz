import { apiClient } from "./client";

export async function saveMentorPlan(type, payload) {
    const response = await apiClient.put(`/api/v1/mentor/plans/${type}`, payload);

    return response.data.result;
}

export async function getCurrentMentorPlans() {
    const response = await apiClient.get("/api/v1/mentor/plans/current");

    return response.data.result;
}

export async function getDailyRoutineSummary(date) {
    const response = await apiClient.get("/api/v1/mentor/routine-summary/daily", {
        params: { date },
    });

    return response.data.result;
}

export async function saveDailyReflection(payload) {
    const response = await apiClient.put("/api/v1/mentor/reflections/daily", payload);

    return response.data.result;
}

export async function getDailyReflection(date) {
    const response = await apiClient.get("/api/v1/mentor/reflections/daily", {
        params: { date },
    });

    return response.data.result;
}

export async function generateDailyMentorFeedback(date) {
    const response = await apiClient.post("/api/v1/mentor/feedbacks/daily", null, {
        params: { date },
        timeout: 180000,
    });

    return response.data.result;
}

export async function getDailyMentorFeedback(date) {
    const response = await apiClient.get("/api/v1/mentor/feedbacks/daily", {
        params: { date },
    });

    return response.data.result;
}