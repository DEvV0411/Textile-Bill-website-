'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, AppAction, Customer, Invoice, Payment, Lot, Page } from './types';
import { INITIAL_CUSTOMERS, INITIAL_PRODUCTS, INITIAL_LOTS } from './mockData';

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState: AppState = {
  currentPage: 'dashboard',
  customers: INITIAL_CUSTOMERS,
  products: INITIAL_PRODUCTS,
  invoices: [],
  lots: INITIAL_LOTS,
  invoiceCounter: 1,
  recentCustomerIds: ['c1', 'c2', 'c3'],
  isAuthenticated: false,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };

    case 'ADD_CUSTOMER':
      return { ...state, customers: [...state.customers, action.payload] };

    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };

    case 'DELETE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.filter((c) => c.id !== action.payload),
      };

    case 'ADD_INVOICE':
      return {
        ...state,
        invoices: [...state.invoices, action.payload],
        invoiceCounter: state.invoiceCounter + 1,
      };

    case 'UPDATE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.map((inv) =>
          inv.id === action.payload.id ? action.payload : inv
        ),
      };

    case 'ADD_PAYMENT': {
      const { invoiceId, payment } = action.payload;
      return {
        ...state,
        invoices: state.invoices.map((inv) => {
          if (inv.id !== invoiceId) return inv;
          const newPayments = [...inv.payments, payment];
          const totalPaid = newPayments.reduce((s, p) => s + p.amount, 0);
          const newStatus = totalPaid >= inv.total ? 'PAID' : 'PART-PAID';
          return {
            ...inv,
            payments: newPayments,
            status: newStatus,
            paidAt: newStatus === 'PAID' ? new Date().toISOString() : inv.paidAt,
          };
        }),
      };
    }

    case 'ADD_LOT':
      return {
        ...state,
        lots: [...state.lots, action.payload],
        products: state.products.map((p) =>
          p.id === action.payload.productId
            ? { ...p, currentStock: p.currentStock + action.payload.quantity, lotCount: p.lotCount + 1 }
            : p
        ),
      };

    case 'SET_RECENT_CUSTOMER': {
      const id = action.payload;
      const filtered = state.recentCustomerIds.filter((i) => i !== id);
      return { ...state, recentCustomerIds: [id, ...filtered].slice(0, 5) };
    }

    case 'INCREMENT_INVOICE_COUNTER':
      return { ...state, invoiceCounter: state.invoiceCounter + 1 };
    
    case 'LOGIN':
      return { ...state, isAuthenticated: true };

    case 'LOGOUT':
      return { ...state, isAuthenticated: false, currentPage: 'dashboard' };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  navigate: (page: Page) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const navigate = (page: Page) => dispatch({ type: 'SET_PAGE', payload: page });

  return (
    <AppContext.Provider value={{ state, dispatch, navigate }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
