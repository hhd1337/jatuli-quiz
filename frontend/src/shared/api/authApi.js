import { apiClient, refreshCsrfToken } from "./client";

export async function login({ username, password }) {
    await refreshCsrfToken();

    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const response = await apiClient.post("/api/auth/login", formData, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });

    // 로그인 성공 후 Spring Security가 CSRF 토큰을 새로 만들 수 있으므로 다시 갱신한다.
    await refreshCsrfToken();

    return response.data.result;
}

export async function logout() {
    await refreshCsrfToken();

    const response = await apiClient.post("/api/auth/logout");

    return response.data.result;
}

export async function getAuthStatus() {
    const response = await apiClient.get("/api/auth/me");

    return response.data.result;
}