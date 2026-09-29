import { createContext, useContext } from "react";

// Keep in sync with the pre-paint script in index.html
export const THEME_STORAGE_KEY = "allox-theme";

export const ThemeContext = createContext({ theme: "light", setTheme: () => {} });

export const useTheme = () => useContext(ThemeContext);
