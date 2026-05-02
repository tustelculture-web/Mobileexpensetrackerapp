import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type Expense = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod: string;
  notes?: string;
};

type ExpenseContextType = {
  expenses: Expense[];
  categories: Category[];
  budget: number;
  currency: 'USD' | 'IDR';
  language: 'en' | 'id';
  theme: 'light' | 'dark';
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  updateBudget: (amount: number) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  setCurrency: (c: 'USD' | 'IDR') => void;
  setLanguage: (l: 'en' | 'id') => void;
  setTheme: (t: 'light' | 'dark') => void;
  syncUrl: string;
  setSyncUrl: (url: string) => void;
  syncData: (silent?: boolean) => Promise<void>;
  t: (key: string) => string;
  formatCurrency: (amount: number) => string;
};

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const initialCategories: Category[] = [
  { id: '1', name: 'Food & Dining', icon: '🍔', color: '#ef4444' },
  { id: '2', name: 'Transportation', icon: '🚗', color: '#06b6d4' },
  { id: '3', name: 'Shopping', icon: '🛍️', color: '#f59e0b' },
  { id: '4', name: 'Bills & Utilities', icon: '📄', color: '#10b981' },
  { id: '5', name: 'Entertainment', icon: '🎬', color: '#8b5cf6' },
  { id: '6', name: 'Health', icon: '🏥', color: '#ec4899' },
];

const translations = {
  en: {
    dashboard: 'Dashboard',
    analytics: 'Analytics',
    history: 'History',
    settings: 'Settings',
    add_expense: 'Add Expense',
    total_spent: 'Total Spent This Month',
    budget: 'Monthly Budget',
    recent_activities: 'Recent Activities',
    category: 'Category',
    amount: 'Amount',
    description: 'Description',
    date: 'Date',
    payment_method: 'Payment Method',
    theme: 'App Theme',
    welcome: 'Welcome back!',
    summary: 'Summary',
    Search: 'Search',
    search_results: 'Search Results',
  },
  id: {
    dashboard: 'Dasbor',
    analytics: 'Analisis',
    history: 'Riwayat',
    settings: 'Pengaturan',
    add_expense: 'Tambah Pengeluaran',
    total_spent: 'Total Pengeluaran Bulan Ini',
    budget: 'Anggaran Bulanan',
    recent_activities: 'Aktivitas Terbaru',
    category: 'Kategori',
    amount: 'Jumlah',
    description: 'Deskripsi',
    date: 'Tanggal',
    payment_method: 'Metode Pembayaran',
    theme: 'Tema Aplikasi',
    welcome: 'Selamat datang kembali!',
    summary: 'Ringkasan',
    Search: 'Cari',
    search_results: 'Hasil Pencarian',
  },
};

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [
      { id: '1', description: 'Dinner', amount: 50, category: '1', date: '2026-05-01', paymentMethod: 'Credit' },
      { id: '2', description: 'Uber Ride', amount: 18.75, category: '2', date: '2025-01-30', paymentMethod: 'Debit' },
      { id: '3', description: 'Netflix Subscription', amount: 15.99, category: '4', date: '2025-01-29', paymentMethod: 'Digital' },
    ];
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [budget, setBudget] = useState(() => {
    const saved = localStorage.getItem('budget');
    return saved ? Number(saved) : 4000;
  });

  const [currency, setCurrency] = useState<'USD' | 'IDR'>(() => {
    return (localStorage.getItem('currency') as 'USD' | 'IDR') || 'USD';
  });

  const [language, setLanguage] = useState<'en' | 'id'>(() => {
    return (localStorage.getItem('language') as 'en' | 'id') || 'en';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  const [syncUrl, setSyncUrl] = useState(() => {
    return localStorage.getItem('syncUrl') || '';
  });

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('budget', budget.toString());
    localStorage.setItem('currency', currency);
    localStorage.setItem('language', language);
    localStorage.setItem('theme', theme);
    localStorage.setItem('syncUrl', syncUrl);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [expenses, categories, budget, currency, language, theme, syncUrl]);

  const syncData = async (silent: boolean = false) => {
    if (!syncUrl) return;
    
    // Warn about /dev URLs (only if not silent)
    if (syncUrl.endsWith('/dev')) {
      if (!silent) toast.error('Sync failed: /dev URLs are not supported. Please use the /exec URL from a New Deployment.');
      return;
    }

    try {
      const response = await fetch(syncUrl, { redirect: 'follow' });
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      if (Array.isArray(data)) {
        // Merge data, avoiding duplicates based on ID
        setExpenses(prev => {
          const combined = [...data, ...prev];
          const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
          // Sort by date descending
          return unique.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });
        if (!silent) toast.success('Synced with Cloud');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      if (!silent) toast.error('Sync failed. Make sure your Deployment is set to "Anyone".');
    }
  };

  // Auto-sync polling every 15 seconds (silently)
  useEffect(() => {
    if (syncUrl) {
      // Initial sync on mount or URL change (visible)
      syncData(true); 
      
      const interval = setInterval(() => syncData(true), 15000);
      return () => clearInterval(interval);
    }
  }, [syncUrl]);

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: Math.random().toString(36).substr(2, 9) };
    setExpenses([newExpense, ...expenses]);
    toast.success('Expense added successfully');

    if (syncUrl && !syncUrl.endsWith('/dev')) {
      try {
        await fetch(syncUrl, {
          method: 'POST',
          mode: 'no-cors', // Google Apps Script POST often requires no-cors if not returning JSON headers
          body: JSON.stringify(newExpense),
          redirect: 'follow'
        });
      } catch (error) {
        console.error('Remote sync failed:', error);
      }
    }
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
    toast.success('Expense deleted');
  };

  const updateBudget = (amount: number) => {
    setBudget(amount);
    toast.success('Budget updated');
  };

  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat = { ...cat, id: Math.random().toString(36).substr(2, 9) };
    setCategories([...categories, newCat]);
    toast.success('Category added');
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(categories.map(c => c.id === id ? { ...c, ...updates } : c));
    toast.success('Category updated');
  };

  const deleteCategory = (id: string) => {
    if (expenses.some(e => e.category === id)) {
      toast.error('Cannot delete category with associated expenses');
      return;
    }
    setCategories(categories.filter(c => c.id !== id));
    toast.success('Category deleted');
  };

  const t = (key: string) => translations[language][key as keyof typeof translations['en']] || key;

  const formatCurrency = (amount: number) => {
    if (currency === 'IDR') {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <ExpenseContext.Provider value={{ 
      expenses, categories, budget, currency, language, theme, syncUrl,
      addExpense, deleteExpense, updateBudget,
      addCategory, updateCategory, deleteCategory,
      setCurrency, setLanguage, setTheme, setSyncUrl, syncData, t, formatCurrency 
    }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) throw new Error('useExpenses must be used within ExpenseProvider');
  return context;
};
