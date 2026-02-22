import React, { createContext, useState, useEffect } from "react";

const CartContext = createContext();

/**
 * Shopping Cart Context Provider
 * Manages cart state with localStorage persistence
 */
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // Load cart from localStorage on init
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  /**
   * Add item to cart or update quantity if already exists
   * @param {Object} product - Product to add
   * @param {number} quantity - Quantity to add (default: 1)
   * @returns {Object} { success: boolean, message: string }
   */
  const addToCart = (product, quantity = 1) => {
    let result = { success: false, message: "" };

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      const currentQuantity = existingItem ? existingItem.quantity : 0;
      const newTotalQuantity = currentQuantity + quantity;

      // Check if new total exceeds stock
      if (newTotalQuantity > product.stockQuantity) {
        result = {
          success: false,
          message:
            currentQuantity > 0
              ? `Cannot add more. You already have ${currentQuantity} in cart (max: ${product.stockQuantity})`
              : `Only ${product.stockQuantity} items available in stock`,
        };
        return prevItems; // Don't update cart
      }

      result = {
        success: true,
        message: existingItem
          ? `Updated ${product.name} quantity to ${newTotalQuantity}`
          : `${product.name} added to cart`,
      };

      if (existingItem) {
        // Update quantity if item already in cart
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: newTotalQuantity }
            : item,
        );
      } else {
        // Add new item to cart
        return [
          ...prevItems,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            stockQuantity: product.stockQuantity,
            quantity,
          },
        ];
      }
    });

    return result;
  };

  /**
   * Remove item from cart
   * @param {number} productId - Product ID to remove
   */
  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId),
    );
  };

  /**
   * Update item quantity in cart
   * @param {number} productId - Product ID
   * @param {number} quantity - New quantity
   */
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  /**
   * Clear entire cart
   */
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
  };

  /**
   * Get cart item count
   */
  const getItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  /**
   * Calculate cart subtotal
   */
  const getSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  /**
   * Check if product is in cart
   * @param {number} productId - Product ID to check
   */
  const isInCart = (productId) => {
    return cartItems.some((item) => item.id === productId);
  };

  /**
   * Get quantity of specific product in cart
   * @param {number} productId - Product ID
   */
  const getItemQuantity = (productId) => {
    const item = cartItems.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemCount,
    getSubtotal,
    isInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
