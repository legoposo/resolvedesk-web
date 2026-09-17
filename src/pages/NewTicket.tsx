import { useEffect, useState } from "react";

import { apiFetch } from "../api/client";

import "./NewTicket.css";

type TicketPriority =
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "URGENT";

type Category = {
    id: number;
    name: string;
    description?: string | null;
};

type NewTicketProps = {
    onCreated: (ticketId: number) => void;
};

export default function NewTicket({
    onCreated,
}: NewTicketProps) {
    const [categories, setCategories] = useState<Category[]>([]);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [priority, setPriority] =
        useState<TicketPriority>("MEDIUM");

    const [loadingCategories, setLoadingCategories] =
        useState(true);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    useEffect(() => {
        async function loadCategories() {
            try {
                const data: Category[] = await apiFetch(
                    "/categories/"
                );

                setCategories(data);

                if (data.length > 0) {
                    setCategoryId(String(data[0].id));
                }
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError(
                        "Não foi possível carregar as categorias."
                    );
                }
            } finally {
                setLoadingCategories(false);
            }
        }

        loadCategories();
    }, []);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!categoryId) {
            setError("Selecione uma categoria.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const ticket = await apiFetch(
                "/tickets/",
                {
                    method: "POST",
                    body: JSON.stringify({
                        title,
                        description,
                        category_id: Number(categoryId),
                        priority,
                    }),
                }
            );

            onCreated(ticket.id);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(
                    "Não foi possível criar o chamado."
                );
            }
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="new-ticket-page">
            <header className="new-ticket-header">
                <div>
                    <span className="new-ticket-eyebrow">
                        Atendimento
                    </span>

                    <h1>Novo chamado</h1>

                    <p>
                        Registre uma nova solicitação de atendimento.
                    </p>
                </div>
            </header>

            <form
                className="new-ticket-form"
                onSubmit={handleSubmit}
            >
                <div className="new-ticket-section">
                    <span className="new-ticket-label">
                        Informações do chamado
                    </span>

                    <div className="new-ticket-field">
                        <label htmlFor="title">
                            Título
                        </label>

                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(event) =>
                                setTitle(event.target.value)
                            }
                            placeholder="Ex.: Computador não liga"
                            minLength={3}
                            maxLength={120}
                            required
                        />
                    </div>

                    <div className="new-ticket-field">
                        <label htmlFor="description">
                            Descrição
                        </label>

                        <textarea
                            id="description"
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                            placeholder="Descreva o problema com o máximo de detalhes possível."
                            minLength={5}
                            maxLength={2000}
                            required
                        />
                    </div>
                </div>

                <div className="new-ticket-section">
                    <span className="new-ticket-label">
                        Classificação
                    </span>

                    <div className="new-ticket-grid">
                        <div className="new-ticket-field">
                            <label htmlFor="category">
                                Categoria
                            </label>

                            <select
                                id="category"
                                value={categoryId}
                                onChange={(event) =>
                                    setCategoryId(event.target.value)
                                }
                                disabled={loadingCategories}
                                required
                            >
                                {categories.length === 0 && (
                                    <option value="">
                                        Nenhuma categoria disponível
                                    </option>
                                )}

                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="new-ticket-field">
                            <label htmlFor="priority">
                                Prioridade
                            </label>

                            <select
                                id="priority"
                                value={priority}
                                onChange={(event) =>
                                    setPriority(
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
                    </div>
                </div>

                {error && (
                    <div className="new-ticket-error">
                        {error}
                    </div>
                )}

                <div className="new-ticket-actions">
                    <button
                        className="new-ticket-submit"
                        type="submit"
                        disabled={
                            saving ||
                            loadingCategories ||
                            categories.length === 0
                        }
                    >
                        {saving
                            ? "Criando..."
                            : "Criar chamado"}
                    </button>
                </div>
            </form>
        </div>
    );
}