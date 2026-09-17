import { FormEvent, useState } from "react";
import { apiFetch } from "../api/client";
import "./Login.css";

type LoginResponse = {
    access_token: string;
    token_type: string;
};

type LoginProps = {
    onLogin: () => void;
};

export default function Login({ onLogin }: LoginProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const data: LoginResponse = await apiFetch("/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            localStorage.setItem(
                "resolvedesk_token",
                data.access_token
            );

            onLogin();
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Não foi possível entrar.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page">
            <div className="login-shell">
                <header className="login-brand">
                    <div className="login-logo">R</div>

                    <div>
                        <h1>ResolveDesk</h1>
                        <p>Central de atendimento</p>
                    </div>
                </header>

                <main className="login-content">
                    <div className="login-heading">
                        <span className="login-eyebrow">Acesso ao sistema</span>

                        <h2>Entrar na sua conta</h2>

                        <p>
                            Use suas credenciais para acessar o painel do
                            ResolveDesk.
                        </p>
                    </div>

                    <form
                        className="login-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="form-field">
                            <label htmlFor="email">E-mail</label>

                            <input
                                id="email"
                                type="email"
                                placeholder="voce@empresa.com"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="password">Senha</label>

                            <input
                                id="password"
                                type="password"
                                placeholder="Digite sua senha"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        {error && (
                            <div className="login-error">
                                {error}
                            </div>
                        )}

                        <button
                            className="login-button"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Entrando..." : "Entrar"}
                        </button>
                    </form>
                </main>

                <footer className="login-footer">
                    <span>ResolveDesk</span>
                    <span>API online</span>
                </footer>
            </div>
        </div>
    );
}