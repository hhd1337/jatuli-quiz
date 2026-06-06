import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL) {
    console.warn("VITE_API_BASE_URL이 설정되지 않았습니다.");
}

const unsafeMethods = new Set(["post", "put", "patch", "delete"]);

let cachedCsrfToken = null;

const csrfClient = axios.create({
    baseURL,
    timeout: 5000,
    withCredentials: true,
});

async function fetchCsrfToken() {
    const response = await csrfClient.get("/api/auth/csrf");

    const result = response.data?.result ?? response.data;

    cachedCsrfToken = result?.token ?? null;

    return cachedCsrfToken;
}

export async function refreshCsrfToken() {
    cachedCsrfToken = null;
    return fetchCsrfToken();
}

export function clearCsrfToken() {
    cachedCsrfToken = null;
}

export const apiClient = axios.create({
    baseURL,
    timeout: 5000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use(async (config) => {
    const method = config.method?.toLowerCase();

    if (!unsafeMethods.has(method)) {
        return config;
    }

    if (!cachedCsrfToken) {
        await fetchCsrfToken();
    }

    config.headers = config.headers ?? {};
    config.headers["X-XSRF-TOKEN"] = cachedCsrfToken;

    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;

        if (status === 403) {
            clearCsrfToken();
        }

        if (status === 401 || status === 403) {
            const currentPath = window.location.pathname;

            if (currentPath !== "/login") {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);