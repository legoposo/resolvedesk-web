import { useEffect, useState } from "react";

import { apiFetch } from "../api/client";

import "./TicketDetails.css";

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

type TicketDetailsProps = {
    ticketId: number;
    onBack: () => void;
};

type Category = {
    id: number;
    name: string;
    description?: string | null;
};

type Requester = {
    id: number;
    name: string;
    email: string;
    role: string;
};

export default function TicketDetails({
    ticketId,
    onBack,
}: TicketDetailsProps) {
    const [ticket, setTicket] = useState<Ticket | null>(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [categoryName, setCategoryName] = useState("");

    const [requesterName, setRequesterName] = useState("");

    const [statusValue, setStatusValue] =
        useState<TicketStatus | "">("");

    const [priorityValue, setPriorityValue] =
        useState<TicketPriority | "">("");

    const [saving, setSaving] = useState(false);

    const [success, setSuccess] = useState("");

    useEffect(() => {
        async function loadTicket() {
            try {
                const data: Ticket = await apiFetch(
                    `/tickets/${ticketId}`
                );

                setTicket(data);

                setStatusValue(data.status);

                setPriorityValue(data.priority);

                const categories: Category[] = await apiFetch(
                    "/categories/"
                );

                const category = categories.find(
                    (item) => item.id === data.category_id
                );

                setCategoryName(
                    category?.name ?? `#${data.category_id}`
                );

                const requester: Requester = await apiFetch(
                    `/users/${data.requester_id}`
                );

                setRequesterName(requester.name);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError(
                        "Não foi possível carregar o chamado."
                    );
                }
            } finally {
                setLoading(false);
            }
        }

        loadTicket();
    }, [ticketId]);

    async function handleSave() {
        if (!ticket || !statusValue || !priorityValue) {
            return;
        }

        setSaving(true);
        setSuccess("");
        setError("");

        try {
            const updatedTicket: Ticket = await apiFetch(
                `/tickets/${ticket.id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        status: statusValue,
                        priority: priorityValue,
                    }),
                }
            );

            setTicket(updatedTicket);

            setStatusValue(updatedTicket.status);

            setPriorityValue(updatedTicket.priority);

            setSuccess(
                "Chamado atualizado com sucesso."
            );
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(
                    "Não foi possível atualizar o chamado."
                );
            }
        } finally {
            setSaving(false);
        }
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
            <div className="ticket-details-loading">
                Carregando chamado...
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="ticket-details-page">
                <button
                    className="ticket-details-back"
                    onClick={onBack}
                >
                    Voltar
                </button>

                <div className="ticket-details-error">
                    {error || "Chamado não encontrado."}
                </div>
            </div>
        );
    }

    return (
        <div className="ticket-details-page">
            <header className="ticket-details-header">
                <div>
                    <span className="ticket-details-eyebrow">
                        Chamado #{ticket.id}
                    </span>

                    <h1>{ticket.title}</h1>

                    <p>
                        Consulte as informações completas deste chamado.
                    </p>
                </div>

                <button
                    className="ticket-details-back"
                    onClick={onBack}
                >
                    Voltar
                </button>
            </header>

            <section className="ticket-details-grid">
                <div className="ticket-details-main">
                    <div className="ticket-details-section">
                        <span className="ticket-details-label">
                            Descrição
                        </span>

                        <p className="ticket-description">
                            {ticket.description}
                        </p>
                    </div>

                    <div className="ticket-details-section">
                        <span className="ticket-details-label">
                            Informações
                        </span>

                        <div className="ticket-info-grid">
                            <div>
                                <span className={`ticket-badge status-${ticket.status.toLowerCase()}`}
                                >{getStatusLabel(ticket.status)}
                                </span>

                                <select
                                    className="ticket-details-select"
                                    value={statusValue}
                                    onChange={(event) =>
                                        setStatusValue(
                                            event.target.value as TicketStatus
                                        )
                                    }
                                >
                                    <option value="OPEN">
                                        Aberto
                                    </option>

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

                            <div>
                                <span className={`ticket-badge priority-${ticket.priority.toLowerCase()}`}
                                >
                                    {getPriorityLabel(ticket.priority)}
                                </span>

                                <select
                                    className="ticket-details-select"
                                    value={priorityValue}
                                    onChange={(event) =>
                                        setPriorityValue(
                                            event.target.value as TicketPriority
                                        )
                                    }
                                >
                                    <option value="LOW">
                                        Baixa
                                    </option>

                                    <option value="MEDIUM">
                                        Média
                                    </option>

                                    <option value="HIGH">
                                        Alta
                                    </option>

                                    <option value="URGENT">
                                        Urgente
                                    </option>
                                </select>
                            </div>

                            <div>
                                <span>Categoria</span>

                                <strong>
                                    {categoryName}
                                </strong>
                            </div>

                            <div>
                                <span>Solicitante</span>

                                <strong>
                                    {requesterName}
                                </strong>
                            </div>
                        </div>

                        <div className="ticket-details-actions">
                            <button
                                className="ticket-save-button"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving
                                    ? "Salvando..."
                                    : "Salvar alterações"}
                            </button>

                            {success && (
                                <span className="ticket-success">
                                    {success}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <aside className="ticket-details-side">
                    <div className="ticket-meta">
                        <span>Criado em</span>

                        <strong>
                            {formatDate(ticket.created_at)}
                        </strong>
                    </div>

                    <div className="ticket-meta">
                        <span>Atualizado em</span>

                        <strong>
                            {formatDate(ticket.updated_at)}
                        </strong>
                    </div>

                    <div className="ticket-meta">
                        <span>ID do chamado</span>

                        <strong>
                            #{ticket.id}
                        </strong>
                    </div>
                </aside>
            </section>
        </div>
    );
}