export function getTodayDateText() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const date = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${date}`;
}

export function parseTodayTime(timeText, baseDate = new Date()) {
    const [hour, minute, second = "0"] = String(timeText).split(":");

    const date = new Date(baseDate);
    date.setHours(Number(hour), Number(minute), Number(second), 0);

    return date;
}

export function findCurrentPeriod(periods = [], now = new Date()) {
    return periods.find((period) => {
        const start = parseTodayTime(period.startTime, now);
        const end = parseTodayTime(period.endTime, now);

        return start <= now && now < end;
    }) ?? null;
}

export function findNextPeriod(periods = [], now = new Date()) {
    return periods.find((period) => {
        const start = parseTodayTime(period.startTime, now);

        return now < start;
    }) ?? null;
}

export function getElapsedSeconds(period, now = new Date()) {
    if (!period) {
        return 0;
    }

    const start = parseTodayTime(period.startTime, now);

    return Math.max(0, Math.floor((now - start) / 1000));
}

export function getRemainingSeconds(period, now = new Date()) {
    if (!period) {
        return 0;
    }

    const end = parseTodayTime(period.endTime, now);

    return Math.max(0, Math.floor((end - now) / 1000));
}

export function formatClockTime(totalSeconds) {
    const safeSeconds = Math.max(0, Number(totalSeconds) || 0);

    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;

    return [
        String(hours).padStart(2, "0"),
        String(minutes).padStart(2, "0"),
        String(seconds).padStart(2, "0"),
    ].join(":");
}

export function sortPeriodsByTime(periods = []) {
    return [...periods].sort((a, b) => {
        if (a.startTime === b.startTime) {
            return Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0);
        }

        return String(a.startTime).localeCompare(String(b.startTime));
    });
}