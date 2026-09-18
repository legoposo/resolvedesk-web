import { useEffect, useState, type ReactNode } from "react";
import { apiFetch } from "../api/client";
import "./AppLayout.css";

type User = {
    id: number;
    name: string;
    email: string;
    role: "USER" | "SUPPORT" | "ADMIN";
};

type Page =
    | "dashboard"
    | "tickets"
    | "ticket-details"
    | "new-ticket";

type AppLayoutProps = {
    page: Page;
    onNavigate: (page: Page) => void;
    onLogout: () => void;
    children: ReactNode;
};

export default function AppLayout({
    page,
    onNavigate,
    onLogout,
    children,
}: AppLayoutProps) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        async function loadUser() {
            try {
                const data: User = await apiFetch("/auth/me");
                setUser(data);
            } catch {
                localStorage.removeItem("resolvedesk_token");
                onLogout();
            }
        }

        loadUser();
    }, [onLogout]);

    function handleLogout() {
        localStorage.removeItem("resolvedesk_token");
        onLogout();
    }

    return (
        <div className="app-layout">
            <aside className="app-sidebar">
                <div className="app-sidebar-top">
                    <div className="app-brand">
                        <div className="app-logo">R</div>

                        <div>
                            <strong>ResolveDesk</strong>
                            <span>Central de atendimento</span>
                        </div>
                    </div>

                    <nav className="app-nav">
                        <button
                            className={`app-nav-item ${page === "dashboard" ? "active" : ""
                                }`}
                            onClick={() => onNavigate("dashboard")}
                        >
                            Dashboard
                        </button>

                        <button
                            className={`app-nav-item ${page === "tickets" ? "active" : ""
                                }`}
                            onClick={() => onNavigate("tickets")}
                        >
                            Chamados
                        </button>

                        <button
                            className={`app-nav-item ${page === "new-ticket"
                                    ? "active"
                                    : ""
                                }`}
                            onClick={() => onNavigate("new-ticket")}
                        >
                            Novo chamado
                        </button>

                        <button
                            className={`app-nav-item ${page === "categories" ? "active" : ""
                                }`}
                            onClick={() => onNavigate("categories")}
                        >
                            Categorias
                        </button>

                        {user?.role === "ADMIN" && (
                            <button
                                className={`app-nav-item ${page === "users" ? "active" : ""
                                    }`}
                                onClick={() => onNavigate("users")}
                            >
                                Usuários
                            </button>
                        )}
                    </nav>
                </div>

                <div className="app-user">
                    {user && (
                        <>
                            <div className="app-user-info">
                                <strong>{user.name}</strong>
                                <span>{user.email}</span>
                                <span className="app-user-role">
                                    {user.role}
                                </span>
                            </div>

                            <button
                                className="app-logout"
                                onClick={handleLogout}
                            >
                                Sair
                            </button>
                        </>
                    )}
                </div>
            </aside>

            <main className="app-content">
                {children}
            </main>
        </div>
    );
}