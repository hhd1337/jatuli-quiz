import { useEffect, useMemo, useRef, useState } from "react";

import {
    DndContext,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
    addToDefenseQueue,
    getDefenseQueue,
    removeFromDefenseQueue,
    reorderDefenseQueue,
    searchLeafFolders,
} from "../../shared/api/defenseQueueApi";

import "./defense.css";

const SEARCH_DEBOUNCE_MS = 300;

function getApiErrorMessage(error, fallbackMessage) {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.result?.message ||
        fallbackMessage
    );
}

function SortableQueueItem({ entry, index, onRemove, disabled }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: entry.folderId });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="defense-queue-popup__list-item"
        >
            <span
                className="defense-queue-popup__drag-handle"
                aria-label="순서 변경"
                {...attributes}
                {...listeners}
            >
                ⠿
            </span>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        fontWeight: 700,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {index + 1}. {entry.folderName}
                </div>
                <div
                    style={{
                        fontSize: 12,
                        color: "var(--color-text-muted)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {entry.folderFullPath}
                </div>
            </div>

            <button
                type="button"
                disabled={disabled}
                onClick={() => onRemove(entry.folderId)}
                style={{
                    flexShrink: 0,
                    border: "none",
                    background: "transparent",
                    color: "#fca5a5",
                    cursor: disabled ? "not-allowed" : "pointer",
                    fontSize: 13,
                }}
            >
                삭제
            </button>
        </div>
    );
}

export default function DefenseQueueManagePopup({ onClose }) {
    const [originalEntries, setOriginalEntries] = useState([]);
    const [stagedEntries, setStagedEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const searchDebounceRef = useRef(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        })
    );

    useEffect(() => {
        let ignore = false;

        async function loadQueue() {
            try {
                setLoading(true);
                setError("");

                const queue = await getDefenseQueue();

                if (ignore) return;

                setOriginalEntries(queue.entries);
                setStagedEntries(queue.entries);
            } catch (err) {
                if (ignore) return;

                console.error("디펜스 대기 큐 조회 실패:", err);
                setError(getApiErrorMessage(err, "대기 큐를 불러오지 못했습니다."));
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        loadQueue();

        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => {
        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current);
        }

        const trimmedQuery = searchQuery.trim();

        if (!trimmedQuery) {
            setSearchResults([]);
            setSearching(false);
            return undefined;
        }

        setSearching(true);

        searchDebounceRef.current = setTimeout(async () => {
            try {
                const results = await searchLeafFolders(trimmedQuery);
                setSearchResults(results);
            } catch (err) {
                console.error("폴더 검색 실패:", err);
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, SEARCH_DEBOUNCE_MS);

        return () => {
            if (searchDebounceRef.current) {
                clearTimeout(searchDebounceRef.current);
            }
        };
    }, [searchQuery]);

    const stagedFolderIds = useMemo(
        () => new Set(stagedEntries.map((entry) => entry.folderId)),
        [stagedEntries]
    );

    const handleAddFromSearch = (folder) => {
        if (stagedFolderIds.has(folder.folderId)) {
            return;
        }

        setStagedEntries((prev) => [
            ...prev,
            {
                folderId: folder.folderId,
                folderName: folder.name,
                folderFullPath: folder.fullPath,
                totalProblemCount: folder.totalProblemCount,
                queueOrder: prev.length + 1,
            },
        ]);

        setSearchQuery("");
        setSearchResults([]);
    };

    const handleRemove = (folderId) => {
        setStagedEntries((prev) =>
            prev.filter((entry) => entry.folderId !== folderId)
        );
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        setStagedEntries((prev) => {
            const oldIndex = prev.findIndex((entry) => entry.folderId === active.id);
            const newIndex = prev.findIndex((entry) => entry.folderId === over.id);

            if (oldIndex === -1 || newIndex === -1) {
                return prev;
            }

            return arrayMove(prev, oldIndex, newIndex);
        });
    };

    const handleSave = async () => {
        const originalIds = originalEntries.map((entry) => entry.folderId);
        const stagedIds = stagedEntries.map((entry) => entry.folderId);

        const removedIds = originalIds.filter((id) => !stagedIds.includes(id));
        const addedIds = stagedIds.filter((id) => !originalIds.includes(id));

        try {
            setSaving(true);
            setError("");

            for (const folderId of removedIds) {
                await removeFromDefenseQueue(folderId);
            }

            for (const folderId of addedIds) {
                await addToDefenseQueue(folderId);
            }

            if (stagedIds.length > 0) {
                await reorderDefenseQueue(stagedIds);
            }

            onClose(true);
        } catch (err) {
            console.error("디펜스 대기 큐 저장 실패:", err);
            setError(getApiErrorMessage(err, "저장에 실패했습니다. 다시 시도해주세요."));
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (saving) return;
        onClose(false);
    };

    return (
        <div className="defense-queue-popup-overlay" onClick={handleCancel}>
            <div
                className="defense-queue-popup"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="defense-queue-popup__header">
                    <strong style={{ fontSize: 18 }}>대기 큐 관리</strong>

                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={saving}
                        aria-label="닫기"
                        style={{
                            border: "none",
                            background: "transparent",
                            color: "var(--color-text-muted)",
                            fontSize: 20,
                            lineHeight: 1,
                            cursor: saving ? "not-allowed" : "pointer",
                        }}
                    >
                        ×
                    </button>
                </div>

                <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="리프 폴더 이름으로 검색"
                    className="defense-queue-popup__search-input"
                    aria-label="리프 폴더 검색"
                />

                {(searching || searchResults.length > 0) && (
                    <div className="defense-queue-popup__search-results">
                        {searching && (
                            <div
                                style={{
                                    padding: 10,
                                    fontSize: 13,
                                    color: "var(--color-text-muted)",
                                }}
                            >
                                검색 중...
                            </div>
                        )}

                        {!searching &&
                            searchResults.map((folder) => {
                                const alreadyAdded = stagedFolderIds.has(folder.folderId);

                                return (
                                    <button
                                        type="button"
                                        key={folder.folderId}
                                        disabled={alreadyAdded}
                                        onClick={() => handleAddFromSearch(folder)}
                                        className="defense-queue-popup__search-result-item"
                                    >
                                        <span>{folder.name}</span>
                                        <span
                                            style={{
                                                fontSize: 12,
                                                color: "var(--color-text-muted)",
                                            }}
                                        >
                                            {folder.fullPath}
                                            {alreadyAdded && " (이미 등록됨)"}
                                        </span>
                                    </button>
                                );
                            })}
                    </div>
                )}

                {error && (
                    <p
                        style={{
                            color: "var(--color-danger, #fca5a5)",
                            fontSize: 13,
                            margin: "8px 0 0",
                            flexShrink: 0,
                        }}
                    >
                        {error}
                    </p>
                )}

                {loading ? (
                    <p style={{ color: "var(--color-text-muted)", marginTop: 16 }}>
                        불러오는 중...
                    </p>
                ) : stagedEntries.length === 0 ? (
                    <p style={{ color: "var(--color-text-muted)", marginTop: 16 }}>
                        등록된 폴더가 없습니다. 위에서 검색해서 추가해보세요.
                    </p>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={stagedEntries.map((entry) => entry.folderId)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="defense-queue-popup__list">
                                {stagedEntries.map((entry, index) => (
                                    <SortableQueueItem
                                        key={entry.folderId}
                                        entry={entry}
                                        index={index}
                                        onRemove={handleRemove}
                                        disabled={saving}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}

                <div className="defense-queue-popup__decoration" aria-hidden="true">
                    🧑‍💻
                </div>

                <div className="defense-queue-popup__footer">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={saving}
                        style={{
                            padding: "8px 16px",
                            borderRadius: 8,
                            border: "1px solid var(--color-border)",
                            background: "transparent",
                            color: "var(--color-text)",
                            cursor: saving ? "not-allowed" : "pointer",
                        }}
                    >
                        취소
                    </button>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || loading}
                        style={{
                            padding: "8px 16px",
                            borderRadius: 8,
                            border: "none",
                            background: "var(--color-primary)",
                            color: "var(--color-bg)",
                            cursor: saving || loading ? "not-allowed" : "pointer",
                            fontWeight: 700,
                        }}
                    >
                        {saving ? "저장 중..." : "저장"}
                    </button>
                </div>
            </div>
        </div>
    );
}
