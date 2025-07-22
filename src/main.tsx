import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./main.css";
import { init as initNostrLogin } from "nostr-login";

initNostrLogin({
  darkMode: false,
  title: "Calendar by Formstr",
  noBanner: true,
  description: "Login to manage your events",
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
