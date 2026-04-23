const VOLUNTEER_KEY = "salah_time_volunteer";

export function isVolunteer(): boolean {
    return localStorage.getItem(VOLUNTEER_KEY) === "true";
}

export function setVolunteerLocal(value: boolean): void {
    localStorage.setItem(VOLUNTEER_KEY, String(value));
}
