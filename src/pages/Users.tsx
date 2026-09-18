import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import "./Users.css";

type UserRole = "USER" | "SUPPORT" | "ADMIN";

type User = {
    id: number;
    name: string;
    email: string;
    role: UserRole;
};

export default function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [savingId, setSavingId] =
        useState<number | null>(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        async function loadUsers() {
            try {
                const data: User[] = await apiFetch("/users/");
                setUsers(data);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                }
            }
        }

        loadUsers();
    }, []);

    async function changeRole(
        userId: number,
        role: UserRole
    ) {
        setSavingId(userId);
        setError("");
        setSuccess("");

        try {
            const updated: User = await apiFetch(
                `/users/${userId}`,
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        role,
                    }),
                }
            );

            setUsers((current) =>
                current.map((user) =>
                    user.id === userId ? updated : user
                )
            );

            setSuccess("Perfil atualizado com sucesso.");
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            }
        } finally {
            setSavingId(null);
        }
    }

    return (
        <div className="users-page">
            <header className="users-header">
                <div>
                    <span className="users-eyebrow">
                        Administração
                    </span>

                    <h1>Usuários</h1>

                    <p>
                        Gerencie os usuários e seus níveis de acesso.
                    </p>
                </div>
            </header>

            {error && (
                <div className="users-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="users-success">
                    {success}
                </div>
            )}

            <section className="users-table">
                <div className="users-table-header">
                    <span>ID</span>
                    <span>Nome</span>
                    <span>E-mail</span>
                    <span>Perfil</span>
                </div>

                {users.map((user) => (
                    <div
                        className="users-table-row"
                        key={user.id}
                    >
                        <span>#{user.id}</span>

                        <strong>{user.name}</strong>

                        <span>{user.email}</span>

                        <div>
                            <select
                                value={user.role}
                                disabled={savingId === user.id}
                                onChange={(event) =>
                                    changeRole(
                                        user.id,
                                        event.target.value as UserRole
                                    )
                                }
                            >
                                <option value="USER">
                                    USER
                                </option>

                                <option value="SUPPORT">
                                    SUPPORT
                                </option>

                                <option value="ADMIN">
                                    ADMIN
                                </option>
                            </select>
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
}