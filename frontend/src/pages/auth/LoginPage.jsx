import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../shared/api/authApi";
import "./LoginPage.css";

export default function LoginPage() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        setErrorMessage("");

        try {
            await login({
                username,
                password,
            });

            navigate("/");
        } catch (error) {
            setErrorMessage("아이디 또는 비밀번호가 올바르지 않습니다.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="login-page">
            <form className="login-card" onSubmit={handleSubmit}>
                <h1 className="login-title">관리자 로그인</h1>

                <label className="login-field">
                    <span>아이디</span>
                    <input
                        type="text"
                        name="username"
                        value={username}
                        autoComplete="username"
                        placeholder="아이디를 입력하세요"
                        onChange={(event) => setUsername(event.target.value)}
                    />
                </label>

                <label className="login-field">
                    <span>비밀번호</span>
                    <input
                        type="password"
                        name="password"
                        value={password}
                        autoComplete="current-password"
                        placeholder="비밀번호를 입력하세요"
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </label>

                {errorMessage && (
                    <p className="login-error">{errorMessage}</p>
                )}

                <button
                    className="login-button"
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "로그인 중..." : "로그인"}
                </button>
            </form>
        </main>
    );
}