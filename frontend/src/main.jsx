import { Theme } from "@astryxdesign/core/theme";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import { theme } from "./theme.js";

import "./main.css";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <Theme theme={theme} mode="light">
            <App />
        </Theme>
    </StrictMode>,
);
