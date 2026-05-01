import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { ExpenseProvider, useExpenses } from './context/ExpenseContext';
import { Dashboard } from './components/Dashboard';
import { AddExpense } from './components/AddExpense';
import { Analytics } from './components/Analytics';
import { SearchFilter } from './components/SearchFilter';
import { SettingsProfile } from './components/SettingsProfile';
import { LayoutDashboard, PlusCircle, BarChart3, Search, Settings, Wallet } from 'lucide-react';
import { Toaster } from './components/ui/sonner';

const Navigation = () => {
  const { t } = useExpenses();
  const navItems = [
    { icon: <LayoutDashboard className="h-5 w-5" />, label: t('dashboard'), path: '/' },
    { icon: <PlusCircle className="h-5 w-5" />, label: t('add_expense'), path: '/add' },
    { icon: <BarChart3 className="h-5 w-5" />, label: t('analytics'), path: '/analytics' },
    { icon: <Search className="h-5 w-5" />, label: t('search'), path: '/search' },
    { icon: <Settings className="h-5 w-5" />, label: t('settings'), path: '/settings' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 glass-nav h-screen sticky top-0 p-6 z-40">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Wallet className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            SpendWise
          </h1>
        </div>
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto p-4 bg-accent/50 rounded-2xl border border-border/50">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">PRO PLAN</p>
          <p className="text-sm font-bold mb-3">Unlimited Insights</p>
          <button className="w-full py-2 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity">
            Upgrade
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-nav px-4 py-2 flex justify-around items-center z-50">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 transition-all duration-200 ${
                isActive ? 'text-primary scale-110' : 'text-muted-foreground opacity-70'
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
};

const AppContent = () => {
  return (
    <Router>
      <div className="flex min-h-screen bg-background transition-colors duration-500">
        <Navigation />
        <main className="flex-1 w-full max-w-6xl mx-auto md:p-8 pb-24 md:pb-8">
          <div className="glass-card md:rounded-[2.5rem] min-h-full overflow-hidden transition-all duration-500">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/add" element={<AddExpense />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/search" element={<SearchFilter />} />
              <Route path="/settings" element={<SettingsProfile />} />
            </Routes>
          </div>
        </main>
        <Toaster position="top-center" />
      </div>
    </Router>
  );
};

export default function App() {
  return (
    <ExpenseProvider>
      <AppContent />
    </ExpenseProvider>
  );
}