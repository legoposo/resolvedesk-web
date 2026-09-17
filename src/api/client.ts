const API_URL = "http://127.0.0.1:8000";

export async function apiFetch(
    path: string,
    options: RequestInit = {}
) {
    const token = localStorage.getItem("resolvedesk_token");

    const headers = new Headers(options.headers);

    headers.set("Content-Type", "application/json");

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => null);

        throw new Error(
            error?.detail ?? "Erro ao comunicar com a API"
        );
    }

    return response.json();
}
