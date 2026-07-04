import { Theme } from "@astryxdesign/core/theme";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import { theme } from "./theme.js";
import { ThemeProvider, useTheme } from "./context/ThemeContext.jsx";

import "./main.css";

function ThemedApp() {
    const { mode } = useTheme();
    return (
        <Theme theme={theme} mode={mode}>
            <App />
        </Theme>
    );
}

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <ThemeProvider>
            <ThemedApp />
        </ThemeProvider>
    </StrictMode>,
);
