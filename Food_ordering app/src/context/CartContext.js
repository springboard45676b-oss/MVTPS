import React, { createContext, useContext, useReducer } from 'react';

const CartStateContext = createContext();
const CartDispatchContext = createContext();

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const item = action.payload;
      const exists = state.items.find(i => i.id === item.id);
      if (exists) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === item.id ? { ...i, qty: i.qty + item.qty } : i
          )
        };
      }
      return { ...state, items: [...state.items, item] };
    }
    case 'UPDATE_QTY': {
      const { id, qty } = action.payload;
      return {
        ...state,
        items: state.items.map(i =>
          i.id === id ? { ...i, qty } : i
        )
      };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.payload) };
    case 'CLEAR':
      return { ...state, items: [] };
    default:
      throw new Error('Unknown action ' + action.type);
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  return (
    <CartDispatchContext.Provider value={dispatch}>
      <CartStateContext.Provider value={state}>
        {children}
      </CartStateContext.Provider>
    </CartDispatchContext.Provider>
  );
}

export function useCart() {
  return useContext(CartStateContext);
}

export function useDispatchCart() {
  return useContext(CartDispatchContext);
}
