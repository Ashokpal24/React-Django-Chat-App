import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./components/Auth/Auth.jsx";
import Chat from "./components/Main App/Chat.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div
              style={{
                width: "100%",
                height: "100vh",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <h1>Hello world 🥳</h1>
            </div>
          }
        />
        <Route path="/login" element={<AuthPage isSigned={true} />} />
        <Route path="/register" element={<AuthPage isSigned={false} />} />
        <Route path="/chat" Component={Chat} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
