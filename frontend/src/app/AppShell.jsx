import { Outlet } from "react-router-dom";
import useBackgroundAudio from "../features/fab/useBackgroundAudio.js";

export default function AppShell() {
    const backgroundAudio = useBackgroundAudio();

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
            <Outlet context={backgroundAudio} />
        </div>
    );
}