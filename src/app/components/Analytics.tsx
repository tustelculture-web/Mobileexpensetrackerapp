import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Lightbulb, Target, AlertTriangle, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { startOfMonth, endOfMonth, subMonths, isWithinInterval, format } from 'date-fns';

export function Analytics() {
  const { expenses, budget, categories, t, formatCurrency } = useExpenses();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Time-based calculations
  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  // Current vs Last Month Expenses
  const thisMonthExpenses = useMemo(() => 
    expenses.filter(e => isWithinInterval(new Date(e.date), { start: thisMonthStart, end: thisMonthEnd })),
  [expenses]);

  const lastMonthExpenses = useMemo(() => 
    expenses.filter(e => isWithinInterval(new Date(e.date), { start: lastMonthStart, end: lastMonthEnd })),
  [expenses]);

  const thisMonthTotal = thisMonthExpenses.reduce((a, b) => a + b.amount, 0);
  const lastMonthTotal = lastMonthExpenses.reduce((a, b) => a + b.amount, 0);

  // Category Breakdown with Comparison
  const categoryComparison = useMemo(() => {
    return categories.map(cat => {
      const current = thisMonthExpenses.filter(e => e.category === cat.id).reduce((a, b) => a + b.amount, 0);
      const previous = lastMonthExpenses.filter(e => e.category === cat.id).reduce((a, b) => a + b.amount, 0);
      const diff = previous > 0 ? ((current - previous) / previous) * 100 : 0;
      return {
        id: cat.id,
        name: cat.name,
        color: cat.color,
        current,
        previous,
        diff
      };
    }).filter(c => c.current > 0 || c.previous > 0);
  }, [categories, thisMonthExpenses, lastMonthExpenses]);

  // Insight Cards Data
  const bestCategory = useMemo(() => {
    const list = categoryComparison.filter(c => c.diff < 0).sort((a, b) => a.diff - b.diff);
    return list[0] || null;
  }, [categoryComparison]);

  const needsAttention = useMemo(() => {
    const list = categoryComparison.filter(c => c.diff > 0).sort((a, b) => b.diff - a.diff);
    return list[0] || null;
  }, [categoryComparison]);

  // Chart Data
  const chartData = useMemo(() => {
    const days = Array.from({ length: 15 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (14 - i));
      const ds = format(d, 'yyyy-MM-dd');
      return {
        name: format(d, 'dd MMM'),
        amount: expenses.filter(e => e.date === ds).reduce((a, b) => a + b.amount, 0)
      };
    });
    return days;
  }, [expenses]);

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('analytics')}</h1>
          <p className="text-muted-foreground font-medium">Deep insights into your spending.</p>
        </div>
        <div className="flex bg-accent/20 p-1 rounded-xl border border-border/50">
          <button onClick={() => setSelectedPeriod('month')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${selectedPeriod === 'month' ? 'bg-background shadow-md' : 'opacity-50'}`}>MONTH</button>
          <button onClick={() => setSelectedPeriod('year')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${selectedPeriod === 'year' ? 'bg-background shadow-md' : 'opacity-50'}`}>YEAR</button>
        </div>
      </div>

      {/* AI-Powered Insights - Matches Image 3 */}
      <Card className="rounded-[2.5rem] border-border/50 bg-card overflow-hidden">
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <div className="p-2 bg-yellow-400/20 rounded-xl">
             <Lightbulb className="h-5 w-5 text-yellow-500" />
          </div>
          <CardTitle className="text-lg font-bold">AI-Powered Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {needsAttention && (
            <div className="p-5 rounded-2xl border border-orange-500/20 bg-orange-500/5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="font-bold text-orange-600">High Spending Alert</p>
                <p className="text-sm font-medium opacity-80">You spent {needsAttention.diff.toFixed(0)}% more on {needsAttention.name} this month.</p>
                <p className="text-[10px] font-black text-orange-600 uppercase mt-2">Consider meal planning to reduce expenses.</p>
              </div>
            </div>
          )}

          {bestCategory && (
            <div className="p-5 rounded-2xl border border-green-500/20 bg-green-500/5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <TrendingDown className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="font-bold text-green-600">Great Progress!</p>
                <p className="text-sm font-medium opacity-80">{bestCategory.name} costs decreased by {Math.abs(bestCategory.diff).toFixed(0)}%.</p>
                <p className="text-[10px] font-black text-green-600 uppercase mt-2">Keep using public transport.</p>
              </div>
            </div>
          )}

          <div className="p-5 rounded-2xl border border-purple-500/20 bg-purple-500/5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <Target className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="font-bold text-purple-600">Budget Goal</p>
              <p className="text-sm font-medium opacity-80">You're {((thisMonthTotal / budget) * 100).toFixed(0)}% towards your monthly goal.</p>
              <p className="text-[10px] font-black text-purple-600 uppercase mt-2">You can spend {formatCurrency(Math.max(budget - thisMonthTotal, 0))} more this month.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Category Breakdown - Matches Image 2 */}
        <Card className="rounded-[2.5rem] border-border/50 bg-card overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {categoryComparison.map((item) => (
              <div key={item.id} className="space-y-3">
                <div className="flex justify-between items-end">
                  <p className="font-bold text-lg">{item.name}</p>
                  <p className="font-black text-lg">{formatCurrency(item.current)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="h-4 bg-accent/20 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ backgroundColor: item.color, width: `${Math.min((item.current / Math.max(item.current, item.previous)) * 100, 100)}%` }} />
                    </div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">This Month</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-4 bg-accent/20 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400/30 rounded-full transition-all duration-1000" style={{ width: `${Math.min((item.previous / Math.max(item.current, item.previous)) * 100, 100)}%` }} />
                    </div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Last Month</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Comparison Cards - Matches Image 2 Bottom */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="rounded-[2rem] border-border/50 p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <ArrowDownRight className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Best Category</p>
                <p className="text-xl font-black">{bestCategory?.name || 'N/A'}</p>
                <p className="text-xs font-bold text-green-500 mt-1">{bestCategory ? `${bestCategory.diff.toFixed(0)}% saved` : '0% saved'}</p>
              </div>
            </Card>
            <Card className="rounded-[2rem] border-border/50 p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <ArrowUpRight className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Needs Attention</p>
                <p className="text-xl font-black">{needsAttention?.name || 'N/A'}</p>
                <p className="text-xs font-bold text-red-500 mt-1">{needsAttention ? `+${needsAttention.diff.toFixed(0)}% over` : '0% over'}</p>
              </div>
            </Card>
          </div>

          {/* Spending Trend Chart */}
          <Card className="rounded-[2.5rem] border-border/50 bg-card p-6">
             <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold">Monthly Spending Trend</CardTitle>
                <Sparkles className="h-5 w-5 text-primary opacity-50" />
             </CardHeader>
             <div className="h-64 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: 'var(--muted-foreground)' }} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={4} dot={{ r: 4, fill: 'var(--primary)', stroke: '#fff' }} />
                  </LineChart>
                </ResponsiveContainer>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}