import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Plus, TrendingUp, CreditCard, ChevronRight, Wallet, Edit2, Check, X } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { toast } from 'sonner';

export function Dashboard() {
  const { expenses, budget, updateBudget, categories, formatCurrency, t, language, currency } = useExpenses();
  const navigate = useNavigate();
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(budget.toString());

  // Get current date info
  const now = new Date();
  const monthName = format(now, 'MMMM yyyy');
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - now.getDate();

  // Filter expenses for CURRENT MONTH ONLY
  const currentMonthExpenses = useMemo(() => {
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    return expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return isWithinInterval(expenseDate, { start, end });
    });
  }, [expenses]);

  const totalSpent = useMemo(() => {
    return currentMonthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [currentMonthExpenses]);

  const remainingBudget = Math.max(budget - totalSpent, 0);
  const budgetProgress = Math.min((totalSpent / budget) * 100, 100);

  const categorySpending = useMemo(() => {
    const data = categories.map(cat => {
      const amount = currentMonthExpenses
        .filter(e => e.category === cat.id)
        .reduce((acc, curr) => acc + curr.amount, 0);
      return {
        id: cat.id,
        name: cat.name,
        color: cat.color,
        amount,
        value: totalSpent > 0 ? (amount / totalSpent) * 100 : 0
      };
    }).filter(cat => cat.amount > 0);

    return data.sort((a, b) => b.amount - a.amount);
  }, [currentMonthExpenses, categories, totalSpent]);

  const handleSaveBudget = () => {
    const num = parseFloat(tempBudget);
    if (!isNaN(num) && num > 0) {
      updateBudget(num);
      setIsEditingBudget(false);
    } else {
      toast.error('Please enter a valid budget amount');
    }
  };

  const recentTransactions = currentMonthExpenses.slice(0, 5);

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('dashboard')}</h1>
          <p className="text-muted-foreground font-medium">{t('welcome')}</p>
        </div>
        <Button 
          onClick={() => navigate('/add')}
          className="bg-primary rounded-xl px-6 py-6 shadow-lg shadow-primary/20 hover:opacity-90 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">{t('add_expense')}</span>
        </Button>
      </div>

      {/* Hero Card - With Budget Allocation Feature */}
      <Card className="bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#a855f7] text-white shadow-2xl border-none rounded-[2rem] overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <CardContent className="p-8 md:p-10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-white/80 text-sm font-bold uppercase tracking-wider mb-2">{t('total_spent')}</p>
              <p className="text-6xl font-black tracking-tighter">
                {formatCurrency(totalSpent)}
              </p>
            </div>
            <div className="p-5 bg-white/20 backdrop-blur-xl rounded-3xl border border-white/20 shadow-inner">
              <Wallet className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <div className="flex items-center gap-2 group/btn">
                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest">{t('budget')}</p>
                  {!isEditingBudget && (
                    <button onClick={() => setIsEditingBudget(true)} className="p-1 hover:bg-white/20 rounded-lg transition-colors opacity-0 group-hover/btn:opacity-100">
                      <Edit2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
                {isEditingBudget ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      value={tempBudget} 
                      onChange={(e) => setTempBudget(e.target.value)}
                      className="h-10 w-32 bg-white/10 border-white/20 text-white font-black text-xl rounded-xl focus-visible:ring-white/30"
                      autoFocus
                    />
                    <Button onClick={handleSaveBudget} size="icon" className="h-10 w-10 bg-white text-primary hover:bg-white/90 rounded-xl">
                      <Check className="h-5 w-5" />
                    </Button>
                    <Button onClick={() => { setIsEditingBudget(false); setTempBudget(budget.toString()); }} size="icon" variant="ghost" className="h-10 w-10 text-white hover:bg-white/10 rounded-xl">
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-2xl font-black cursor-pointer hover:text-white/90" onClick={() => setIsEditingBudget(true)}>
                    {formatCurrency(budget)}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Remaining</p>
                <p className="text-xl font-black">{formatCurrency(remainingBudget)}</p>
              </div>
            </div>
            
            <div className="relative h-4 bg-white/10 rounded-full overflow-hidden border border-white/5 shadow-inner">
              <div 
                className="absolute top-0 left-0 h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out rounded-full"
                style={{ width: `${budgetProgress}%` }}
              />
            </div>
            
            <div className="flex justify-between items-center text-xs font-bold text-white/70 uppercase tracking-widest">
              <span>{budgetProgress.toFixed(1)}% used</span>
              <span className="flex items-center gap-1">
                <Badge className="bg-white/20 text-white border-none rounded-lg px-2 py-0.5">{daysLeft}</Badge> 
                days left
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spending Breakdown */}
      <Card className="rounded-[2.5rem] border border-border/50 bg-card shadow-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold tracking-tight">Spending by Category</CardTitle>
          <Badge variant="secondary" className="bg-accent/50 text-muted-foreground font-bold px-3 py-1 rounded-xl">
            {monthName}
          </Badge>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">
            <div className="relative w-64 h-64 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySpending.length > 0 ? categorySpending : [{ value: 1, color: '#e2e8f0', amount: 0 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="amount"
                    stroke="none"
                  >
                    {categorySpending.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total</p>
                 <p className="text-2xl font-black">{formatCurrency(totalSpent)}</p>
              </div>
            </div>

            <div className="flex-1 w-full space-y-6">
              {categorySpending.length > 0 ? categorySpending.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-4 h-4 rounded-full shadow-sm group-hover:scale-125 transition-transform" 
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-base font-bold text-foreground/80">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black leading-none mb-1">{formatCurrency(cat.amount)}</p>
                    <p className="text-xs font-bold text-muted-foreground">{cat.value.toFixed(0)}%</p>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-10 opacity-20">
                   <Wallet className="h-12 w-12 mb-2" />
                   <p className="font-bold">No expenses this month</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats and Activity Grid */}
      <div className="grid md:grid-cols-2 gap-6">
         <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-accent/20 rounded-[2rem] border border-border/50 flex flex-col gap-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center"><TrendingUp className="h-5 w-5 text-green-500" /></div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Daily Avg</p>
                <p className="text-xl font-black">{formatCurrency(totalSpent / Math.max(now.getDate(), 1))}</p>
              </div>
            </div>
            <div className="p-6 bg-accent/20 rounded-[2rem] border border-border/50 flex flex-col gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center"><CreditCard className="h-5 w-5 text-blue-500" /></div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Transactions</p>
                <p className="text-xl font-black">{currentMonthExpenses.length}</p>
              </div>
            </div>
         </div>

         <Card className="rounded-[2.5rem] border border-border/50 bg-card overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">{t('recent_activities')}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/search')} className="text-primary font-bold">
                  {t('history')} <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/20">
                {recentTransactions.map((tx) => {
                  const cat = categories.find(c => c.id === tx.category);
                  return (
                    <div key={tx.id} className="flex items-center gap-4 p-4 hover:bg-accent/10 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-accent/30 flex items-center justify-center text-lg">{cat?.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{tx.description}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{tx.date}</p>
                      </div>
                      <p className="font-black text-red-500">-{formatCurrency(tx.amount)}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}