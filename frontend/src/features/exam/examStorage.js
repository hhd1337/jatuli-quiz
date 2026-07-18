const ACTIVE_EXAM_STORAGE_KEY =
    "jatuli-active-exam-v1";

const COMPLETED_EXAM_STORAGE_KEY =
    "jatuli-completed-exam-v1";

function safeParse(rawValue) {
    if (!rawValue) {
        return null;
    }

    try {
        return JSON.parse(rawValue);
    } catch {
        return null;
    }
}

export function createActiveExam(examResponse) {
    const now = Date.now();

    const problems = Array.isArray(examResponse?.problems)
        ? examResponse.problems
        : [];

    const timeLimitSeconds = Math.max(
        0,
        Number(examResponse?.timeLimitSeconds ?? 0)
    );

    const answers = {};

    problems.forEach((problem) => {
        answers[String(problem.problemId)] = "";
    });

    return {
        status: "IN_PROGRESS",
        startedAt: now,
        deadlineAt: now + timeLimitSeconds * 1000,
        timeLimitSeconds,
        minutesPerProblem: Math.max(
            1,
            Math.min(
                10,
                Number(
                    examResponse?.minutesPerProblem ?? 4
                )
            )
        ),
        totalProblemCount: problems.length,
        problems,
        answers,
    };
}

export function saveActiveExam(exam) {
    localStorage.setItem(
        ACTIVE_EXAM_STORAGE_KEY,
        JSON.stringify(exam)
    );
}

export function loadActiveExam() {
    return safeParse(
        localStorage.getItem(
            ACTIVE_EXAM_STORAGE_KEY
        )
    );
}

export function clearActiveExam() {
    localStorage.removeItem(
        ACTIVE_EXAM_STORAGE_KEY
    );
}

export function saveCompletedExam(completedExam) {
    sessionStorage.setItem(
        COMPLETED_EXAM_STORAGE_KEY,
        JSON.stringify(completedExam)
    );
}

export function loadCompletedExam() {
    return safeParse(
        sessionStorage.getItem(
            COMPLETED_EXAM_STORAGE_KEY
        )
    );
}

export function clearCompletedExam() {
    sessionStorage.removeItem(
        COMPLETED_EXAM_STORAGE_KEY
    );
}