/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useEffect, useReducer } from 'react';

const CartContext = createContext();
const CART_STORAGE_KEY = 'pawmart_cart';

function getInitialCart() {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    const parsedCart = savedCart ? JSON.parse(savedCart) : [];
    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch {
    return [];
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.find(i => i.id === action.payload.id);
      if (existing) {
        return state.map(i =>
          i.id === action.payload.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...state, { ...action.payload, qty: 1 }];
    }
    case 'REMOVE_ITEM':
      return state.filter(i => i.id !== action.payload);
    case 'UPDATE_QTY':
      if (action.payload.qty <= 0) {
        return state.filter(i => i.id !== action.payload.id);
      }
      return state.map(i =>
        i.id === action.payload.id
          ? { ...i, qty: action.payload.qty }
          : i
      );
    case 'CLEAR_CART':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, undefined, getInitialCart);

  useEffect(() => {
    if (cart.length === 0) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return;
    }

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) =>
    dispatch({ type: 'ADD_ITEM', payload: product });

  const removeFromCart = (id) =>
    dispatch({ type: 'REMOVE_ITEM', payload: id });

  const updateQty = (id, qty) =>
    dispatch({ type: 'UPDATE_QTY', payload: { id, qty } });

  const clearCart = () =>
    dispatch({ type: 'CLEAR_CART' });

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}