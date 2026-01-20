import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { VoyageProvider } from "./context/VoyageContext";
import { AlertProvider } from "./context/AlertContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AlertProvider>
        <VoyageProvider>
        <App />
        </VoyageProvider>
      </AlertProvider>
    </BrowserRouter>
  </React.StrictMode>
);
