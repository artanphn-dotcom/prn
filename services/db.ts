import { Apartment, Tenant, Transaction, DocumentFile, TransactionType, ExpenseCategory, PaymentFrequency, DocumentType } from '../types';

// Updated keys to v2 to ensure fresh start for the user
const STORAGE_KEYS = {
  APARTMENTS: 'vit_apartments_v2',
  TENANTS: 'vit_tenants_v2',
  TRANSACTIONS: 'vit_transactions_v2',
  DOCUMENTS: 'vit_documents_v2'
};

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock Seed Data - CLEARED as requested
const seedData = () => {
  // No seed data. App starts clean.
};

seedData();

// Generic CRUD helper
const getItems = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveItems = <T>(key: string, items: T[]) => {
  localStorage.setItem(key, JSON.stringify(items));
};

export const DB = {
  apartments: {
    getAll: () => getItems<Apartment>(STORAGE_KEYS.APARTMENTS),
    add: (item: Omit<Apartment, 'id'>) => {
      const items = getItems<Apartment>(STORAGE_KEYS.APARTMENTS);
      const newItem = { ...item, id: generateId() };
      saveItems(STORAGE_KEYS.APARTMENTS, [...items, newItem]);
      return newItem;
    },
    update: (id: string, updates: Partial<Apartment>) => {
      const items = getItems<Apartment>(STORAGE_KEYS.APARTMENTS);
      const updated = items.map(i => i.id === id ? { ...i, ...updates } : i);
      saveItems(STORAGE_KEYS.APARTMENTS, updated);
    },
    delete: (id: string) => {
      const items = getItems<Apartment>(STORAGE_KEYS.APARTMENTS);
      saveItems(STORAGE_KEYS.APARTMENTS, items.filter(i => i.id !== id));
    }
  },
  tenants: {
    getAll: () => getItems<Tenant>(STORAGE_KEYS.TENANTS),
    add: (item: Omit<Tenant, 'id'>) => {
      const items = getItems<Tenant>(STORAGE_KEYS.TENANTS);
      const newItem = { ...item, id: generateId() };
      saveItems(STORAGE_KEYS.TENANTS, [...items, newItem]);
      return newItem;
    },
    update: (id: string, updates: Partial<Tenant>) => {
      const items = getItems<Tenant>(STORAGE_KEYS.TENANTS);
      const updated = items.map(i => i.id === id ? { ...i, ...updates } : i);
      saveItems(STORAGE_KEYS.TENANTS, updated);
    },
    delete: (id: string) => {
      const items = getItems<Tenant>(STORAGE_KEYS.TENANTS);
      saveItems(STORAGE_KEYS.TENANTS, items.filter(i => i.id !== id));
    }
  },
  transactions: {
    getAll: () => getItems<Transaction>(STORAGE_KEYS.TRANSACTIONS),
    add: (item: Omit<Transaction, 'id'>) => {
      const items = getItems<Transaction>(STORAGE_KEYS.TRANSACTIONS);
      const newItem = { ...item, id: generateId() };
      saveItems(STORAGE_KEYS.TRANSACTIONS, [...items, newItem]);
      return newItem;
    },
    update: (id: string, updates: Partial<Transaction>) => {
      const items = getItems<Transaction>(STORAGE_KEYS.TRANSACTIONS);
      const updated = items.map(i => i.id === id ? { ...i, ...updates } : i);
      saveItems(STORAGE_KEYS.TRANSACTIONS, updated);
    },
    delete: (id: string) => {
      const items = getItems<Transaction>(STORAGE_KEYS.TRANSACTIONS);
      saveItems(STORAGE_KEYS.TRANSACTIONS, items.filter(i => i.id !== id));
    }
  },
  documents: {
    getAll: () => getItems<DocumentFile>(STORAGE_KEYS.DOCUMENTS),
    add: (item: Omit<DocumentFile, 'id'>) => {
      const items = getItems<DocumentFile>(STORAGE_KEYS.DOCUMENTS);
      const newItem = { ...item, id: generateId() };
      saveItems(STORAGE_KEYS.DOCUMENTS, [...items, newItem]);
      return newItem;
    },
    delete: (id: string) => {
      const items = getItems<DocumentFile>(STORAGE_KEYS.DOCUMENTS);
      saveItems(STORAGE_KEYS.DOCUMENTS, items.filter(i => i.id !== id));
    }
  }
};