import React, { createContext, useContext, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'pawmart_cart';

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
    case 'RESTORE':
      return action.payload;
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    AsyncStorage.getItem(CART_STORAGE_KEY)
      .then((saved) => {
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) dispatch({ type: 'RESTORE', payload: parsed });
        }
        setHydrated(true);
      })
      .catch(() => setHydrated(true));
  }, []);

  React.useEffect(() => {
    if (hydrated) AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)).catch(() => {});
  }, [cart, hydrated]);

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
