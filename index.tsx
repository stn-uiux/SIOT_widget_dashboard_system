import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import QueryStorageReset from "./components/app/QueryStorageReset";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const Root: React.FC = () => {
  const [urlReset] = useState(
    () => typeof window !== "undefined" && window.location.search.includes("reset=true"),
  );
  if (urlReset) {
    return <QueryStorageReset />;
  }
  return <App />;
};

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
