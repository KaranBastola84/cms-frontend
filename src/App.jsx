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
                background: "#1A1A1A",
                color: "#FFFFFF",
                padding: "16px",
                borderRadius: "12px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
                border: "1px solid rgba(198, 163, 106, 0.2)",
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                fontWeight: "500",
              },
              success: {
                iconTheme: {
                  primary: "#C6A36A",
                  secondary: "#1A1A1A",
                },
                style: {
                  background: "#1A1A1A",
                  color: "#FFFFFF",
                  border: "1px solid rgba(198, 163, 106, 0.4)",
                },
              },
              error: {
                iconTheme: {
                  primary: "#C62828",
                  secondary: "#FFFFFF",
                },
                style: {
                  background: "#1A1A1A",
                  color: "#FFFFFF",
                  border: "1px solid rgba(198, 40, 40, 0.4)",
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
