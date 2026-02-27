import { useContext } from "react";
import CartContext from "../contexts/CartContext";

/**
 * Custom hook to use cart context
 * @returns {Object} Cart context value with cart state and methods
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
