const AUTH_COOKIE_NAME = "salah_auth_user";
const DEFAULT_COOKIE_DAYS = 7;

export interface AuthUser {
    email: string;
    userId?: string;
    loggedInAt: string;
}

export const setAuthCookie = (user: AuthUser, days: number = DEFAULT_COOKIE_DAYS): void => {
    const expires = new Date();
    expires.setDate(expires.getDate() + days);

    const value = encodeURIComponent(JSON.stringify(user));
    document.cookie = `${AUTH_COOKIE_NAME}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
};

export const getAuthCookie = (): AuthUser | null => {
    const cookies = document.cookie ? document.cookie.split("; ") : [];
    const target = cookies.find((cookie) => cookie.startsWith(`${AUTH_COOKIE_NAME}=`));

    if (!target) return null;

    const rawValue = target.substring(AUTH_COOKIE_NAME.length + 1);
    try {
        const parsed = JSON.parse(decodeURIComponent(rawValue));
        if (!parsed?.email) return null;
        return parsed as AuthUser;
    } catch {
        return null;
    }
};

export const clearAuthCookie = (): void => {
    document.cookie = `${AUTH_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
};

export const isAuthenticated = (): boolean => Boolean(getAuthCookie());
