import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/client";
import "./Tickets.css";

type TicketsProps = {
    onOpenTicket: (ticketId: number) => void;
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

export default function Tickets({
    onOpenTicket,
}:   TicketsProps) {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [statusFilter, setStatusFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");

    useEffect(() => {
        async function loadTickets() {
            try {
                const data: Ticket[] = await apiFetch(
                    "/tickets/?skip=0&limit=100"
                );

                setTickets(data);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Não foi possível carregar os chamados.");
                }
            } finally {
                setLoading(false);
            }
        }

        loadTickets();
    }, []);

    const filteredTickets = useMemo(() => {
        return tickets.filter((ticket) => {
            if (
                statusFilter &&
                ticket.status !== statusFilter
            ) {
                return false;
            }

            if (
                priorityFilter &&
                ticket.priority !== priorityFilter
            ) {
                return false;
            }

            return true;
        });
    }, [tickets, statusFilter, priorityFilter]);

    function getStatusLabel(status: TicketStatus) {
        const labels: Record<TicketStatus, string> = {
            OPEN: "Aberto",
            IN_PROGRESS: "Em andamento",
            RESOLVED: "Resolvido",
            CLOSED: "Fechado",
        };

        return labels[status];
    }

    function getPriorityLabel(priority: TicketPriority) {
        const labels: Record<TicketPriority, string> = {
            LOW: "Baixa",
            MEDIUM: "Média",
            HIGH: "Alta",
            URGENT: "Urgente",
        };

        return labels[priority];
    }

    function formatDate(date: string) {
        return new Intl.DateTimeFormat("pt-BR", {
            dateStyle: "short",
            timeStyle: "short",
        }).format(new Date(date));
    }

    if (loading) {
        return (
            <div className="tickets-loading">
                Carregando chamados...
            </div>
        );
    }

    return (
        <div className="tickets-page">
            <header className="tickets-header">
                <div>
                    <span className="tickets-eyebrow">
                        Atendimento
                    </span>

                    <h1>Chamados</h1>

                    <p>
                        Consulte e acompanhe os chamados cadastrados.
                    </p>
                </div>

               
            </header>

            <section className="tickets-filters">
                <div className="filter-group">
                    <label>Status</label>

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                    >
                        <option value="">Todos</option>
                        <option value="OPEN">Aberto</option>
                        <option value="IN_PROGRESS">
                            Em andamento
                        </option>
                        <option value="RESOLVED">
                            Resolvido
                        </option>
                        <option value="CLOSED">
                            Fechado
                        </option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Prioridade</label>

                    <select
                        value={priorityFilter}
                        onChange={(event) =>
                            setPriorityFilter(event.target.value)
                        }
                    >
                        <option value="">Todas</option>
                        <option value="LOW">Baixa</option>
                        <option value="MEDIUM">Média</option>
                        <option value="HIGH">Alta</option>
                        <option value="URGENT">Urgente</option>
                    </select>
                </div>

                <div className="tickets-count">
                    {filteredTickets.length} chamado(s)
                </div>
            </section>

            {error && (
                <div className="tickets-error">
                    {error}
                </div>
            )}

            <section className="tickets-list">
                <div className="tickets-list-header">
                    <span>Chamado</span>
                    <span>Status</span>
                    <span>Prioridade</span>
                    <span>Categoria</span>
                    <span>Data</span>
                </div>

                {filteredTickets.length === 0 ? (
                    <div className="tickets-empty">
                        Nenhum chamado encontrado.
                    </div>
                ) : (
                    filteredTickets.map((ticket) => (
                        <button
                            key={ticket.id}
                            className="tickets-list-row"
                            type="button"
                            onClick={() => onOpenTicket(ticket.id)}
                        >
                            <div className="tickets-title">
                                <strong>#{ticket.id}</strong>
                                <span>{ticket.title}</span>
                            </div>

                            <span>
                                {getStatusLabel(ticket.status)}
                            </span>

                            <span>
                                {getPriorityLabel(ticket.priority)}
                            </span>

                            <span>
                                #{ticket.category_id}
                            </span>

                            <span>
                                {formatDate(ticket.created_at)}
                            </span>
                        </button>
                    ))
                )}
            </section>
        </div>
    );
}