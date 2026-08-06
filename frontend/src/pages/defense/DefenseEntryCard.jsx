import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getDefenseQueue } from "../../shared/api/defenseQueueApi";
import DefenseQueueManagePopup from "./DefenseQueueManagePopup";

import "./defense.css";

export default function DefenseEntryCard() {
    const navigate = useNavigate();

    const [nextFolder, setNextFolder] = useState(null);
    const [waitingCount, setWaitingCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const loadQueueSummary = async () => {
        try {
            setLoading(true);

            const queue = await getDefenseQueue();

            setNextFolder(queue.entries[0] ?? null);
            setWaitingCount(queue.totalCount);
        } catch (err) {
            console.error("디펜스 대기 큐 조회 실패:", err);
            setNextFolder(null);
            setWaitingCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadQueueSummary();
    }, []);

    const handleCardClick = () => {
        if (!nextFolder) {
            alert(
                "디펜스 대기 큐가 비어 있습니다. 먼저 복습할 폴더를 큐에 추가해주세요."
            );
            return;
        }

        navigate(
            `/quiz/play?mode=folder&folderId=${nextFolder.folderId}&defense=true`,
            {
                state: {
                    titlePath: nextFolder.folderFullPath,
                },
            }
        );
    };

    const handleCardKeyDown = (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleCardClick();
        }
    };

    const handleManageClick = (event) => {
        event.stopPropagation();
        setIsPopupOpen(true);
    };

    const handleClosePopup = (didChange) => {
        setIsPopupOpen(false);

        if (didChange) {
            loadQueueSummary();
        }
    };

    const description = loading
        ? "불러오는 중..."
        : nextFolder
            ? `다음 방어 대상: ${nextFolder.folderName} · 대기 ${waitingCount}개`
            : "대기 중인 폴더가 없습니다";

    return (
        <>
            <div
                className="defense-entry-card"
                role="button"
                tabIndex={0}
                onClick={handleCardClick}
                onKeyDown={handleCardKeyDown}
            >
                <div className="defense-entry-card__icon">🛡️</div>

                <div className="defense-entry-card__content">
                    <strong className="defense-entry-card__title">
                        문제 디펜스
                    </strong>

                    <p className="defense-entry-card__description">
                        {description}
                    </p>
                </div>

                <button
                    type="button"
                    className="defense-entry-card__manage-button"
                    onClick={handleManageClick}
                >
                    대기 큐 관리
                </button>
            </div>

            {isPopupOpen && (
                <DefenseQueueManagePopup onClose={handleClosePopup} />
            )}
        </>
    );
}
