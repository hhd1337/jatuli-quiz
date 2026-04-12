import { useState } from "react";
import { getHealth } from "../../shared/api/healthApi";

export default function HealthCheckPage() {
    const [result, setResult] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleHealthCheck = async () => {
        try {
            setLoading(true);
            setError("");
            setResult("");

            const data = await getHealth();
            setResult(String(data));
        } catch (err) {
            console.error(err);
            setError("health API 호출에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
            <h1>백엔드 Health 체크 테스트</h1>
            <p>프론트 → 백엔드 연동이 정상인지 확인하는 임시 테스트 페이지입니다.</p>

            <button onClick={handleHealthCheck} disabled={loading}>
                {loading ? "확인 중..." : "health API 호출"}
            </button>

            {result && (
                <div style={{ marginTop: 16 }}>
                    <strong>응답:</strong> {result}
                </div>
            )}

            {error && (
                <div style={{ marginTop: 16, color: "red" }}>
                    <strong>에러:</strong> {error}
                </div>
            )}
        </div>
    );
}