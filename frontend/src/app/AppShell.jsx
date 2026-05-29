import { Outlet } from "react-router-dom";

export default function AppShell() {
    return (
        <div style={{ padding: 80 }}>
            <Outlet />
        </div>
    );
}