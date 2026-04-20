export function getUserDisplayName(email: string | undefined): string {
    return email?.split("@")[0] ?? "User";
}

export function getInitials(displayName: string): string {
    return displayName.slice(0, 2).toUpperCase();
}
