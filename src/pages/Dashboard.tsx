import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/client";
import "./Dashboard.css";

type User = {
    id: number;
    name: string;
    email: string;
    role: "USER" | "SUPPORT" | "ADMIN";
};

type TicketStatus =
    | "OPEN"
    | "IN_PROGRESS"
    | "RESOLVED"
    | "CLOSED";

type TicketPriority =
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "URGENT";

type Ticket = {
    id: number;
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    requester_id: number;
    category_id: number;
    created_at: string;
    updated_at: string;
};

type DashboardProps = {
    onLogout: () => void;
    onOpenTickets: () => void;
};

export default function Dashboard({
    onLogout,
    onOpenTickets,
}: DashboardProps) {
    const [user, setUser] = useState<User | null>(null);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadDashboard() {
            try {
                const [userData, ticketsData] = await Promise.all([
                    apiFetch("/auth/me"),
                    apiFetch("/tickets/?skip=0&limit=100"),
                ]);

                setUser(userData);
                setTickets(ticketsData);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError(
                        "Não foi possível carregar o dashboard."
                    );
                }
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, []);

    const summary = useMemo(() => {
        return {
            open: tickets.filter(
                (ticket) => ticket.status === "OPEN"
            ).length,

            inProgress: tickets.filter(
                (ticket) =>
                    ticket.status === "IN_PROGRESS"
            ).length,

            resolved: tickets.filter(
                (ticket) =>
                    ticket.status === "RESOLVED"
            ).length,

            total: tickets.length,
        };
    }, [tickets]);

    const recentTickets = useMemo(() => {
        return [...tickets]
            .sort((a, b) => {
                return (
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                );
            })
            .slice(0, 5);
    }, [tickets]);

    function handleLogout() {
        localStorage.removeItem("resolvedesk_token");
        onLogout();
    }

    function formatDate(date: string) {
        return new Intl.DateTimeFormat("pt-BR", {
            dateStyle: "short",
            timeStyle: "short",
        }).format(new Date(date));
    }

    function getStatusLabel(status: TicketStatus) {
        const labels: Record<TicketStatus, string> = {
            OPEN: "Aberto",
            IN_PROGRESS: "Em andamento",
            RESOLVED: "Resolvido",
            CLOSED: "Fechado",
        };

        return labels[status];
    }

    function getPriorityLabel(
        priority: TicketPriority
    ) {
        const labels: Record<
            TicketPriority,
            string
        > = {
            LOW: "Baixa",
            MEDIUM: "Média",
            HIGH: "Alta",
            URGENT: "Urgente",
        };

        return labels[priority];
    }

    if (loading) {
        return (
            <div className="dashboard-loading">
                Carregando dashboard...
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="dashboard-loading">
                <p>
                    {error || "Usuário não encontrado."}
                </p>

                <button onClick={handleLogout}>
                    Voltar ao login
                </button>
            </div>
        );
    }

    return (
        
          

            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div>
                        <span className="dashboard-eyebrow">
                            Visão geral
                        </span>

                        <h1>Dashboard</h1>

                        <p>
                            Bem-vindo, {user.name}.
                        </p>
                    </div>

                    <div className="dashboard-user-badge">
                        {user.role}
                    </div>
                </header>

                <section className="dashboard-section">
                    <div className="dashboard-section-header">
                        <div>
                            <h2>Resumo</h2>

                            <p>
                                Visão rápida do atendimento.
                            </p>
                        </div>
                    </div>

                    <div className="summary-grid">
                        <div className="summary-item">
                            <span>Chamados abertos</span>
                            <strong>{summary.open}</strong>
                        </div>

                        <div className="summary-item">
                            <span>Em andamento</span>
                            <strong>
                                {summary.inProgress}
                            </strong>
                        </div>

                        <div className="summary-item">
                            <span>Resolvidos</span>
                            <strong>
                                {summary.resolved}
                            </strong>
                        </div>

                        <div className="summary-item">
                            <span>Total</span>
                            <strong>{summary.total}</strong>
                        </div>
                    </div>
                </section>

                <section className="dashboard-section">
                    <div className="dashboard-section-header">
                        <div>
                            <h2>Chamados recentes</h2>

                            <p>
                                Últimos chamados registrados.
                            </p>
                        </div>
                    </div>

                    {recentTickets.length === 0 ? (
                        <div className="empty-state">
                            Nenhum chamado encontrado.
                        </div>
                    ) : (
                        <div className="tickets-table">
                            <div className="tickets-table-header">
                                <span>Chamado</span>
                                <span>Status</span>
                                <span>Prioridade</span>
                                <span>Data</span>
                            </div>

                            {recentTickets.map((ticket) => (
                                <div
                                    className="tickets-table-row"
                                    key={ticket.id}
                                >
                                    <div className="ticket-title">
                                        <strong>
                                            #{ticket.id}
                                        </strong>

                                        <span>
                                            {ticket.title}
                                        </span>
                                    </div>

                                    <span
                                        className={`status status-${ticket.status.toLowerCase()}`}
                                    >
                                        {getStatusLabel(
                                            ticket.status
                                        )}
                                    </span>

                                    <span>
                                        {getPriorityLabel(
                                            ticket.priority
                                        )}
                                    </span>

                                    <span className="ticket-date">
                                        {formatDate(
                                            ticket.created_at
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        
    );
}