import React, { useState, useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Filter, X, SortAsc, SortDesc, Trash2, CalendarIcon, Wallet } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { format, subWeeks, subMonths, isAfter, startOfDay } from 'date-fns';
import { Label } from './ui/label';

export function SearchFilter() {
  const { expenses, categories, deleteExpense, t, formatCurrency } = useExpenses();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedQuickFilter, setSelectedQuickFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];
    if (searchQuery) filtered = filtered.filter(t => t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    if (selectedCategory !== 'all') filtered = filtered.filter(t => t.category === selectedCategory);
    if (selectedQuickFilter) {
      const now = startOfDay(new Date());
      let threshold = new Date(0);
      if (selectedQuickFilter === 'today') threshold = now;
      else if (selectedQuickFilter === 'week') threshold = subWeeks(now, 1);
      else if (selectedQuickFilter === 'month') threshold = subMonths(now, 1);
      filtered = filtered.filter(t => isAfter(new Date(t.date), threshold) || t.date === format(now, 'yyyy-MM-dd'));
    }
    filtered.sort((a, b) => {
      const da = new Date(a.date).getTime(), db = new Date(b.date).getTime();
      return sortOrder === 'desc' ? db - da : da - db;
    });
    return filtered;
  }, [expenses, searchQuery, selectedCategory, selectedQuickFilter, sortOrder]);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('history')}</h1>
          <p className="text-muted-foreground font-medium">Search and filter your transactions.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className={`rounded-xl border-border font-bold ${showFilters ? 'bg-accent' : ''}`}>
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? 'Hide' : 'Filters'}
        </Button>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          placeholder="Search descriptions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-14 bg-accent/10 border-none text-lg font-bold rounded-2xl focus-visible:ring-primary/20"
        />
        {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded-full"><X className="h-4 w-4" /></button>}
      </div>

      {showFilters && (
        <Card className="bg-accent/10 border-border/50 rounded-[2rem] p-6 space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 block">{t('category')}</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-12 rounded-xl bg-background border-border font-bold"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All</SelectItem>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 block">Quick Date</Label>
              <div className="flex gap-2">
                {['today', 'week', 'month'].map(v => (
                  <button key={v} onClick={() => setSelectedQuickFilter(selectedQuickFilter === v ? '' : v)} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase border transition-all ${selectedQuickFilter === v ? 'bg-primary text-white border-primary shadow-lg' : 'bg-background text-muted-foreground border-border hover:bg-accent'}`}>{v}</button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="py-20 text-center opacity-30"><Search className="h-16 w-16 mx-auto mb-4" /><p className="font-bold">No results found</p></div>
        ) : (
          filteredExpenses.map((expense) => {
            const category = categories.find(c => c.id === expense.category);
            return (
              <Card key={expense.id} className="group hover:bg-accent/10 transition-all border-border/30 rounded-2xl overflow-hidden">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/30 flex items-center justify-center text-xl">{category?.icon || '💰'}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{expense.description}</p>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase">
                      <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" />{expense.date}</span>
                      <span>•</span>
                      <span>{expense.paymentMethod}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-black text-red-500">-{formatCurrency(expense.amount)}</p>
                    <Button variant="ghost" size="icon" onClick={() => deleteExpense(expense.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {filteredExpenses.length > 0 && (
        <Card className="bg-primary text-white rounded-3xl border-none shadow-xl p-6 mt-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-1">{t('summary')}</p>
              <p className="text-3xl font-black">{formatCurrency(filteredExpenses.reduce((s, t) => s + t.amount, 0))}</p>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl"><Wallet className="h-6 w-6 text-white" /></div>
          </div>
        </Card>
      )}
    </div>
  );
}