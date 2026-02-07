export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum ExpenseCategory {
  RENT = 'RENT', // Used for Income
  WATER = 'WATER',
  ELECTRICITY = 'ELECTRICITY',
  TRASH = 'TRASH',
  MAINTENANCE = 'MAINTENANCE',
  FAMILY_SUPPORT = 'FAMILY_SUPPORT',
  PERSONAL = 'PERSONAL',
  TAX = 'TAX',
  OTHER = 'OTHER'
}

export enum PaymentFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY'
}

export enum DocumentType {
  CONTRACT = 'CONTRACT',
  BILL = 'BILL',
  OTHER = 'OTHER'
}

export interface Apartment {
  id: string;
  name: string;
  address: string;
  size: number; // m2
  rooms: number;
  floor: number;
  notes?: string;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  apartmentId?: string; // Assigned apartment
  moveInDate: string; // ISO Date
  moveOutDate?: string; // ISO Date
  rentAmount: number;
  paymentFrequency: PaymentFrequency;
}

export interface Transaction {
  id: string;
  date: string; // ISO Date
  amount: number;
  type: TransactionType;
  category: ExpenseCategory;
  description: string;
  apartmentId?: string;
  isRecurring: boolean;
  isPaid: boolean;
}

export interface DocumentFile {
  id: string;
  name: string;
  type: DocumentType;
  apartmentId?: string;
  uploadDate: string;
  size: number; // bytes
  // In a real app, this would be a URL. For demo, we might store a small dataURI or just mock the link.
  url?: string; 
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  occupancyRate: number;
}