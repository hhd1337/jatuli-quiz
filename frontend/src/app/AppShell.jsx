import { Outlet } from "react-router-dom";

export default function AppShell() {
    return (
        <div
            style={{
                width: "100%",
                minHeight: "100vh",
                margin: 0,
                padding: 0,
                background: "var(--color-bg)",
                color: "var(--color-text)",
                boxSizing: "border-box",
                overflowX: "hidden",
            }}
        >
            <Outlet />
        </div>
    );
}