import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import AppRoutes from "./routes";

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#fff",
                color: "#1A1A1A",
                padding: "16px",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(74, 47, 25, 0.15)",
                border: "1px solid rgba(200, 162, 123, 0.2)",
                fontWeight: "600",
              },
              success: {
                iconTheme: {
                  primary: "#4A2F19",
                  secondary: "#fff",
                },
                style: {
                  background: "#EFE7D3",
                  color: "#1A1A1A",
                  border: "1px solid rgba(74, 47, 25, 0.2)",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
                style: {
                  background: "#fee",
                  color: "#1A1A1A",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                },
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
