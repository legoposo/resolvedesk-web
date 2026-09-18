import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import "./Categories.css";

type Category = {
    id: number;
    name: string;
    description?: string | null;
};

type User = {
    id: number;
    name: string;
    email: string;
    role: "USER" | "SUPPORT" | "ADMIN";
};

export default function Categories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [user, setUser] = useState<User | null>(null);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function loadCategories() {
        const data: Category[] = await apiFetch("/categories/");
        setCategories(data);
    }

    useEffect(() => {
        async function loadPage() {
            try {
                const [categoriesData, userData] = await Promise.all([
                    apiFetch("/categories/"),
                    apiFetch("/auth/me"),
                ]);

                setCategories(categoriesData);
                setUser(userData);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        }

        loadPage();
    }, []);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            await apiFetch("/categories/", {
                method: "POST",
                body: JSON.stringify({
                    name,
                    description,
                }),
            });

            setName("");
            setDescription("");

            await loadCategories();

            setSuccess("Categoria criada com sucesso.");
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            }
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <div className="categories-loading">Carregando...</div>;
    }

    return (
        <div className="categories-page">
            <header className="categories-header">
                <div>
                    <span className="categories-eyebrow">
                        Configuração
                    </span>

                    <h1>Categorias</h1>

                    <p>
                        Organize os tipos de atendimento do ResolveDesk.
                    </p>
                </div>
            </header>

            {user?.role === "ADMIN" && (
                <form
                    className="category-form"
                    onSubmit={handleSubmit}
                >
                    <span className="categories-section-label">
                        Nova categoria
                    </span>

                    <div className="category-form-grid">
                        <div className="category-field">
                            <label>Nome</label>

                            <input
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                placeholder="Ex.: Rede"
                                required
                            />
                        </div>

                        <div className="category-field">
                            <label>Descrição</label>

                            <input
                                value={description}
                                onChange={(event) =>
                                    setDescription(event.target.value)
                                }
                                placeholder="Problemas de rede e conectividade"
                            />
                        </div>
                    </div>

                    <div className="category-actions">
                        <button disabled={saving}>
                            {saving ? "Criando..." : "Criar categoria"}
                        </button>

                        {success && (
                            <span className="category-success">
                                {success}
                            </span>
                        )}
                    </div>
                </form>
            )}

            {error && (
                <div className="category-error">
                    {error}
                </div>
            )}

            <section className="categories-list">
                <div className="categories-list-header">
                    <span>ID</span>
                    <span>Categoria</span>
                    <span>Descrição</span>
                </div>

                {categories.map((category) => (
                    <div
                        className="categories-list-row"
                        key={category.id}
                    >
                        <span>#{category.id}</span>

                        <strong>{category.name}</strong>

                        <span>
                            {category.description || "—"}
                        </span>
                    </div>
                ))}
            </section>
        </div>
    );
}