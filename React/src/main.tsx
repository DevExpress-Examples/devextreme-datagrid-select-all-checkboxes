import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GroupRowSelectionProvider } from "./GroupRowSelection/context/GroupRowSelectionContext.tsx";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <GroupRowSelectionProvider>
      <App />
    </GroupRowSelectionProvider>
  </StrictMode>
);
