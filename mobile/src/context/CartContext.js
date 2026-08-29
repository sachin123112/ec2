import React, { createContext, useContext, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'pawmart_cart';
const WISHLIST_STORAGE_KEY = 'pawmart_wishlist';

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

function wishlistReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE': {
      const item = action.payload;
      const exists = state.some(entry => entry.id === item.id);
      if (exists) {
        return state.filter(entry => entry.id !== item.id);
      }
      return [...state, { ...item }];
    }
    case 'REMOVE':
      return state.filter(item => item.id !== action.payload);
    case 'RESTORE':
      return Array.isArray(action.payload) ? action.payload : [];
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatchCart] = useReducer(cartReducer, []);
  const [wishlist, dispatchWishlist] = useReducer(wishlistReducer, []);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(CART_STORAGE_KEY),
      AsyncStorage.getItem(WISHLIST_STORAGE_KEY)
    ])
      .then(([savedCart, savedWishlist]) => {
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart)) dispatchCart({ type: 'RESTORE', payload: parsedCart });
        }
        if (savedWishlist) {
          const parsedWishlist = JSON.parse(savedWishlist);
          if (Array.isArray(parsedWishlist)) dispatchWishlist({ type: 'RESTORE', payload: parsedWishlist });
        }
        setHydrated(true);
      })
      .catch(() => setHydrated(true));
  }, []);

  React.useEffect(() => {
    if (hydrated) AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)).catch(() => {});
  }, [cart, hydrated]);

  React.useEffect(() => {
    if (hydrated) AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist)).catch(() => {});
  }, [wishlist, hydrated]);

  const addToCart = (product) => dispatchCart({ type: 'ADD', payload: product });
  const removeFromCart = (id) => dispatchCart({ type: 'REMOVE', payload: id });
  const updateQty = (id, qty) => dispatchCart({ type: 'UPDATE', payload: { id, qty } });
  const clearCart = () => dispatchCart({ type: 'CLEAR' });
  const toggleWishlist = (product) => dispatchWishlist({ type: 'TOGGLE', payload: product });
  const removeFromWishlist = (id) => dispatchWishlist({ type: 'REMOVE', payload: id });
  const clearWishlist = () => dispatchWishlist({ type: 'CLEAR' });

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.qty * (item.price || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
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
