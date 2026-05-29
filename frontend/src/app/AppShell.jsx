import { Outlet } from "react-router-dom";

export default function AppShell() {
    return (
        <div
            style={{
                minHeight: "100vh",
                padding: 50,
                background: "var(--color-bg)",
                color: "var(--color-text)",
            }}
        >
            <Outlet />
        </div>
    );
}