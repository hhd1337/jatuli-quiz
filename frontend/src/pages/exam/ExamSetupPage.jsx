import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
    createExamQuestions,
    getExamFolderTree,
} from "../../shared/api/examApi.js";
import {
    clearCompletedExam,
    createActiveExam,
    loadActiveExam,
    saveActiveExam,
} from "../../features/exam/examStorage.js";
import "./exam.css";

function formatExamTime(
    problemCount,
    minutesPerProblem
) {
    const totalMinutes =
        problemCount * minutesPerProblem;

    if (totalMinutes <= 0) {
        return "0분";
    }

    if (totalMinutes < 60) {
        return `${totalMinutes}분`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (minutes === 0) {
        return `${hours}시간`;
    }

    return `${hours}시간 ${minutes}분`;
}

function getDescendantLeafFolders(folder) {
    const children = Array.isArray(folder?.children)
        ? folder.children
        : [];

    if (children.length === 0) {
        return [folder];
    }

    return children.flatMap((child) =>
        getDescendantLeafFolders(child)
    );
}

function flattenLeafFolders(folders = []) {
    return folders.flatMap((folder) =>
        getDescendantLeafFolders(folder)
    );
}

function getFolderTotalProblemCount(folder) {
    return getDescendantLeafFolders(folder).reduce(
        (sum, leafFolder) =>
            sum +
            Math.max(
                0,
                Number(
                    leafFolder.totalProblemCount ?? 0
                )
            ),
        0
    );
}

function getSelectableLeafFolders(folder) {
    return getDescendantLeafFolders(folder).filter(
        (leafFolder) =>
            Number(
                leafFolder.totalProblemCount ?? 0
            ) > 0
    );
}

function TreeCheckbox({
                          checked,
                          indeterminate,
                          disabled,
                          onChange,
                          ariaLabel,
                      }) {
    const inputRef = useRef(null);

    useEffect(() => {
        if (!inputRef.current) {
            return;
        }

        inputRef.current.indeterminate =
            Boolean(indeterminate);
    }, [indeterminate]);

    return (
        <input
            ref={inputRef}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onClick={(event) => {
                event.stopPropagation();
            }}
            onChange={onChange}
            aria-label={ariaLabel}
        />
    );
}

function ExamFolderTreeItem({
                                folder,
                                depth,
                                selections,
                                collapsedFolderIds,
                                onToggleCollapsed,
                                onToggleSelection,
                                onProblemCountChange,
                            }) {
    const children = Array.isArray(folder.children)
        ? folder.children
        : [];

    const hasChildren = children.length > 0;

    const isCollapsed =
        collapsedFolderIds.has(folder.folderId);

    const selectableLeafFolders =
        getSelectableLeafFolders(folder);

    const selectedLeafFolders =
        selectableLeafFolders.filter(
            (leafFolder) =>
                selections[
                    String(leafFolder.folderId)
                    ]?.selected
        );

    const isFullySelected =
        selectableLeafFolders.length > 0 &&
        selectedLeafFolders.length ===
        selectableLeafFolders.length;

    const isPartiallySelected =
        selectedLeafFolders.length > 0 &&
        !isFullySelected;

    const isDisabled =
        selectableLeafFolders.length === 0;

    const isLeaf = !hasChildren;

    const leafSelection =
        selections[String(folder.folderId)];

    const descendantProblemCount =
        getFolderTotalProblemCount(folder);

    return (
        <div className="exam-tree-node">
            <div
                className={[
                    "exam-tree-row",
                    isLeaf ? "is-leaf" : "is-folder",
                    isFullySelected
                        ? "is-selected"
                        : "",
                ]
                    .filter(Boolean)
                    .join(" ")}
                style={{
                    paddingLeft: `${12 + depth * 22}px`,
                }}
            >
                <TreeCheckbox
                    checked={isFullySelected}
                    indeterminate={
                        isPartiallySelected
                    }
                    disabled={isDisabled}
                    onChange={() =>
                        onToggleSelection(folder)
                    }
                    ariaLabel={`${folder.name} 시험 범위 선택`}
                />

                {hasChildren ? (
                    <button
                        type="button"
                        className="exam-tree-folder-button"
                        onClick={() =>
                            onToggleCollapsed(
                                folder.folderId
                            )
                        }
                        aria-expanded={!isCollapsed}
                        aria-label={`${folder.name} 폴더 ${
                            isCollapsed ? "펼치기" : "접기"
                        }`}
                    >
                        <span className="exam-tree-folder-icon">
                            🗂️
                        </span>

                                        <span className="exam-tree-folder-text">
                            <strong>{folder.name}</strong>
                        </span>
                    </button>
                ) : (
                    <div
                        className="
                            exam-tree-folder-button
                            exam-tree-folder-button--leaf
                        "
                    >
                        <span className="exam-tree-folder-icon">
                            🔘
                        </span>

                        <span className="exam-tree-folder-text">
                            <strong>{folder.name}</strong>
                        </span>
                    </div>
                )}

                <div className="exam-tree-folder-meta">
                    {hasChildren ? (
                        <span>
                            전체 {descendantProblemCount}
                            문제
                        </span>
                    ) : (
                        <>
                            <span>
                                전체{" "}
                                {
                                    folder.totalProblemCount
                                }
                                문제
                            </span>

                            <input
                                type="number"
                                min="1"
                                max={Math.max(
                                    1,
                                    folder.totalProblemCount
                                )}
                                disabled={
                                    !leafSelection?.selected
                                }
                                value={
                                    leafSelection
                                        ?.problemCount ?? 1
                                }
                                onChange={(event) =>
                                    onProblemCountChange(
                                        folder,
                                        event.target.value
                                    )
                                }
                                aria-label={`${folder.name} 출제 문제 수`}
                            />
                        </>
                    )}
                </div>
            </div>

            {hasChildren && !isCollapsed && (
                <div className="exam-tree-children">
                    {children.map((child) => (
                        <ExamFolderTreeItem
                            key={child.folderId}
                            folder={child}
                            depth={depth + 1}
                            selections={selections}
                            collapsedFolderIds={
                                collapsedFolderIds
                            }
                            onToggleCollapsed={
                                onToggleCollapsed
                            }
                            onToggleSelection={
                                onToggleSelection
                            }
                            onProblemCountChange={
                                onProblemCountChange
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ExamSetupPage() {
    const navigate = useNavigate();

    const [folderTree, setFolderTree] = useState([]);

    const [collapsedFolderIds, setCollapsedFolderIds] = useState(() => new Set());
    const [selections, setSelections] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isStarting, setIsStarting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [minutesPerProblem, setMinutesPerProblem] = useState(4);

    const leafFolders = useMemo(
        () => flattenLeafFolders(folderTree),
        [folderTree]
    );

    useEffect(() => {
        let isMounted = true;

        async function loadFolders() {
            try {
                const folders =
                    await getExamFolderTree(1);

                if (!isMounted) {
                    return;
                }

                setFolderTree(folders);
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                setErrorMessage(
                    error.message ||
                    "폴더를 불러오지 못했습니다."
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadFolders();

        return () => {
            isMounted = false;
        };
    }, []);

    const selectedFolderCount = useMemo(
        () =>
            Object.values(selections).filter(
                (selection) => selection.selected
            ).length,
        [selections]
    );

    const totalProblemCount = useMemo(
        () =>
            Object.values(selections)
                .filter(
                    (selection) =>
                        selection.selected
                )
                .reduce(
                    (sum, selection) =>
                        sum +
                        Number(
                            selection.problemCount ?? 0
                        ),
                    0
                ),
        [selections]
    );

    function handleFolderToggle(folder) {
        const selectableLeafFolders =
            getSelectableLeafFolders(folder);

        if (selectableLeafFolders.length === 0) {
            return;
        }

        const hasChildren =
            Array.isArray(folder.children) &&
            folder.children.length > 0;

        const areAllSelected =
            selectableLeafFolders.every(
                (leafFolder) =>
                    selections[
                        String(leafFolder.folderId)
                        ]?.selected
            );

        const shouldSelect = !areAllSelected;

        setSelections((previous) => {
            const next = {
                ...previous,
            };

            selectableLeafFolders.forEach(
                (leafFolder) => {
                    const key = String(
                        leafFolder.folderId
                    );

                    const current = next[key];

                    next[key] = {
                        selected: shouldSelect,

                        problemCount: shouldSelect
                            ? hasChildren
                                ? Math.max(
                                    1,
                                    Number(
                                        leafFolder.totalProblemCount ??
                                        0
                                    )
                                )
                                : current?.problemCount ??
                                1
                            : current?.problemCount ?? 1,
                    };
                }
            );

            return next;
        });
    }

    function handleProblemCountChange(
        folder,
        nextValue
    ) {
        const parsedValue = Number(nextValue);

        const safeValue = Number.isFinite(parsedValue)
            ? Math.max(
                1,
                Math.min(
                    Math.floor(parsedValue),
                    Math.max(
                        1,
                        folder.totalProblemCount
                    )
                )
            )
            : 1;

        setSelections((previous) => ({
            ...previous,
            [String(folder.folderId)]: {
                selected: true,
                problemCount: safeValue,
            },
        }));
    }

    function handleToggleCollapsed(folderId) {
        setCollapsedFolderIds((previous) => {
            const next = new Set(previous);

            if (next.has(folderId)) {
                next.delete(folderId);
            } else {
                next.add(folderId);
            }

            return next;
        });
    }

    async function handleStartExam() {
        if (isStarting) {
            return;
        }

        const folderSelections = leafFolders
            .filter(
                (folder) =>
                    selections[String(folder.folderId)]
                        ?.selected
            )
            .map((folder) => ({
                folderId: folder.folderId,
                problemCount:
                selections[
                    String(folder.folderId)
                    ].problemCount,
            }));

        if (folderSelections.length === 0) {
            setErrorMessage(
                "시험 범위 폴더를 하나 이상 선택해주세요."
            );
            return;
        }

        const existingExam = loadActiveExam();

        if (
            existingExam?.status === "IN_PROGRESS"
        ) {
            const shouldReplace = window.confirm(
                "진행 중인 시험이 있습니다. 기존 시험을 삭제하고 새 시험을 시작할까요?"
            );

            if (!shouldReplace) {
                navigate("/exam/play");
                return;
            }
        }

        setIsStarting(true);
        setErrorMessage("");

        try {
            const examResponse =
                await createExamQuestions({
                    folderSelections,
                    minutesPerProblem,
                });

            const activeExam =
                createActiveExam(examResponse);

            clearCompletedExam();
            saveActiveExam(activeExam);

            navigate("/exam/play");
        } catch (error) {
            setErrorMessage(
                error.message ||
                "시험을 시작하지 못했습니다."
            );
        } finally {
            setIsStarting(false);
        }
    }

    if (isLoading) {
        return (
            <main className="exam-page">
                <div className="exam-status-card">
                    시험 범위 폴더를 불러오는 중입니다.
                </div>
            </main>
        );
    }

    return (
        <main className="exam-page">
            <header className="exam-page-header">
                <button
                    type="button"
                    className="exam-back-button"
                    onClick={() => navigate("/")}
                >
                    ← 홈
                </button>

                <div>
                    <h1>시험 설정</h1>
                    <p>
                        시험에 포함할 폴더와 문제 수를
                        선택하세요.
                    </p>
                </div>
            </header>

            {errorMessage && (
                <div
                    className="exam-error-message"
                    role="alert"
                >
                    {errorMessage}
                </div>
            )}

            <section className="exam-guide-card exam-guide-card--yellow">
                <div className="exam-guide-card__header">
                    <div>
                        <strong>출제 기준</strong>

                        <p>
                            북마크된 문제 중 풀이 횟수가 낮은
                            문제부터 출제됩니다.
                        </p>
                    </div>

                    <label className="exam-time-setting">
                        <span>문제당 제한 시간</span>

                        <select
                            value={minutesPerProblem}
                            onChange={(event) =>
                                setMinutesPerProblem(
                                    Number(event.target.value)
                                )
                            }
                        >
                            {Array.from(
                                { length: 10 },
                                (_, index) => index + 1
                            ).map((minute) => (
                                <option
                                    key={minute}
                                    value={minute}
                                >
                                    {minute}분
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </section>

            <section className="exam-folder-tree">
                {folderTree.length === 0 ? (
                    <div className="exam-empty-card">
                        시험에 사용할 수 있는 폴더가
                        없습니다.
                    </div>
                ) : (
                    folderTree.map((folder) => (
                        <ExamFolderTreeItem
                            key={folder.folderId}
                            folder={folder}
                            depth={0}
                            selections={selections}
                            collapsedFolderIds={
                                collapsedFolderIds
                            }
                            onToggleCollapsed={
                                handleToggleCollapsed
                            }
                            onToggleSelection={
                                handleFolderToggle
                            }
                            onProblemCountChange={
                                handleProblemCountChange
                            }
                        />
                    ))
                )}
            </section>

            <div className="exam-setup-footer">
                <div className="exam-summary">
                    <span>
                        선택 폴더{" "}
                        <strong>
                            {selectedFolderCount}
                        </strong>
                        개
                    </span>

                    <span>
                        총{" "}
                        <strong>
                            {totalProblemCount}
                        </strong>
                        문제
                    </span>

                    <span>
                        제한 시간{" "}
                        <strong>
                            {formatExamTime(
                                totalProblemCount,
                                minutesPerProblem
                            )}
                        </strong>
                    </span>
                </div>

                <button
                    type="button"
                    className="exam-primary-button"
                    disabled={
                        totalProblemCount <= 0 ||
                        isStarting
                    }
                    onClick={handleStartExam}
                >
                    {isStarting
                        ? "시험 생성 중..."
                        : "시험 시작"}
                </button>
            </div>
        </main>
    );
}