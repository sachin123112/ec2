import React, { createContext, useContext, useReducer } from 'react';

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const existing = state.find(item => item.id === action.payload.id);
      if (existing) {
        return state.map(item =>
          item.id === action.payload.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [...state, { ...action.payload, qty: 1 }];
    }
    case 'REMOVE':
      return state.filter(item => item.id !== action.payload);
    case 'UPDATE':
      return state.map(item =>
        item.id === action.payload.id
          ? { ...item, qty: action.payload.qty }
          : item
      ).filter(item => item.qty > 0);
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, []);

  const addToCart = (product) => dispatch({ type: 'ADD', payload: product });
  const removeFromCart = (id) => dispatch({ type: 'REMOVE', payload: id });
  const updateQty = (id, qty) => dispatch({ type: 'UPDATE', payload: { id, qty } });
  const clearCart = () => dispatch({ type: 'CLEAR' });

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.qty * (item.price || 0), 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQty, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
