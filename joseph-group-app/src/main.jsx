import React from "react";
import ReactDOM from "react-dom/client";

// Must be imported before App so window.storage exists before any
// component's first render calls it.
import "./lib/storageShim.js";

import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
