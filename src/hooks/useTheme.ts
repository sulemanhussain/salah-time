import { useState, useEffect } from "react";

export type Theme = "light" | "dark";

const THEME_KEY = "salah_time_theme";

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(() => {
        return (localStorage.getItem(THEME_KEY) as Theme) ?? "light";
    });

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        localStorage.setItem(THEME_KEY, theme);
    }, [theme]);

    function toggle() {
        setTheme((t) => (t === "light" ? "dark" : "light"));
    }

    return { theme, isDark: theme === "dark", toggle };
}
