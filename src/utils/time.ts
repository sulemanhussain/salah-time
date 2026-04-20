export function addMinutesToTime(timeString: string, minutes: number): string {
    if (!timeString) return "";
    const [hours, mins] = timeString.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(mins)) return "";

    let totalMinutes = hours * 60 + mins + minutes;
    while (totalMinutes < 0) totalMinutes += 24 * 60;
    totalMinutes = totalMinutes % (24 * 60);

    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${String(newHours).padStart(2, "0")}:${String(newMins).padStart(2, "0")}`;
}

export function parseTimeToMinutes(timeString: string): number | null {
    const match = timeString.match(/(\d{1,2}):(\d{2})/);
    if (!match) return null;

    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    if (Number.isNaN(hours) || Number.isNaN(minutes) || hours > 23 || minutes > 59) {
        return null;
    }

    return hours * 60 + minutes;
}

export function calculateMinuteGap(startMinutes: number, endMinutes: number): number {
    return (endMinutes - startMinutes + 1440) % 1440;
}

export function formatTimeUntil(minutesAway: number): string {
    if (minutesAway <= 0) return "Now";
    const hours = Math.floor(minutesAway / 60);
    const minutes = minutesAway % 60;
    if (hours === 0) return `in ${minutes}m`;
    if (minutes === 0) return `in ${hours}h`;
    return `in ${hours}h ${minutes}m`;
}
