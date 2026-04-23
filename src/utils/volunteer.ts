const VOLUNTEER_KEY = "salah_time_volunteer";
const DISPLAY_NAME_KEY = "salah_time_display_name";

export function isVolunteer(): boolean {
    return sessionStorage.getItem(VOLUNTEER_KEY) === "true";
}

export function setVolunteerLocal(value: boolean): void {
    sessionStorage.setItem(VOLUNTEER_KEY, String(value));
}

export function setDisplayName(fullName: string | null | undefined): void {
    if (fullName) sessionStorage.setItem(DISPLAY_NAME_KEY, fullName);
    else sessionStorage.removeItem(DISPLAY_NAME_KEY);
}

export function getDisplayName(emailFallback?: string): string {
    const stored = sessionStorage.getItem(DISPLAY_NAME_KEY);
    if (stored) return stored;
    if (emailFallback) return emailFallback.split("@")[0];
    return "User";
}
