import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useExpenses } from '../context/ExpenseContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { IntegrationGuide } from './IntegrationGuide';

export function AddExpense() {
  const { categories, addExpense, formatCurrency, t, currency, syncUrl } = useExpenses();
  const navigate = useNavigate();
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const location = useLocation();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Credit');

  // URL Parameter Handling for iOS Shortcuts
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pAmount = params.get('amount');
    const pDesc = params.get('desc');
    const pCat = params.get('cat');
    const pAuto = params.get('auto');

    if (pAmount) setAmount(pAmount);
    if (pDesc) setDescription(pDesc);
    if (pCat) setCategory(pCat);

    // If auto=true, save immediately if at least amount and description are present
    if (pAuto === 'true' && pAmount && pDesc) {
      const numAmount = parseFloat(pAmount);
      if (!isNaN(numAmount)) {
        addExpense({
          description: pDesc,
          amount: numAmount,
          category: pCat || categories[0]?.id || '1',
          date: date,
          paymentMethod: 'Shortcut'
        });
        toast.success('Automatically Added!');
        setTimeout(() => navigate('/'), 1200);
      }
    }
  }, [location.search, addExpense, navigate, date]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category) {
      toast.error('Please fill all required fields');
      return;
    }
    addExpense({
      description,
      amount: parseFloat(amount),
      category,
      date,
      paymentMethod,
    });
    navigate('/');
  };

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-3xl font-bold">{t('add_expense')}</h1>
      </div>

      <Card className="rounded-[2.5rem] border border-border/50 bg-card shadow-2xl overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-border/50 p-8">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              New Transaction
            </CardTitle>
            <div className="px-4 py-2 bg-primary/10 rounded-xl text-primary font-black text-sm">
              {currency === 'USD' ? '$' : 'Rp'}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">What did you buy?</Label>
              <Input
                placeholder="Dinner with friends..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-14 rounded-2xl bg-accent/20 border-none text-lg font-bold placeholder:opacity-30 focus-visible:ring-primary/20"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Amount</Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground">
                    {currency === 'USD' ? '$' : 'Rp'}
                  </div>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-14 rounded-2xl bg-accent/20 border-none pl-12 text-lg font-black focus-visible:ring-primary/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-14 rounded-2xl bg-accent/20 border-none font-bold focus:ring-primary/20">
                    <SelectValue placeholder="Choose category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/50 shadow-2xl">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="rounded-xl font-bold py-3">
                        <span className="mr-2">{cat.icon}</span> {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-14 rounded-2xl bg-accent/20 border-none font-bold focus-visible:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="h-14 rounded-2xl bg-accent/20 border-none font-bold focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/50 shadow-2xl">
                    <SelectItem value="Credit" className="rounded-xl font-bold">Credit Card</SelectItem>
                    <SelectItem value="Debit" className="rounded-xl font-bold">Debit Card</SelectItem>
                    <SelectItem value="Cash" className="rounded-xl font-bold">Cash</SelectItem>
                    <SelectItem value="Digital" className="rounded-xl font-bold">Digital Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <Button type="submit" className="flex-1 h-16 rounded-2xl bg-primary text-lg font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
                <Save className="h-6 w-6" />
                {t('add_expense')}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsGuideOpen(true)}
                className="h-16 w-16 rounded-2xl border-border/50 flex flex-col items-center justify-center gap-1 hover:bg-primary/5 hover:text-primary transition-colors"
              >
                <Smartphone className="h-5 w-5 opacity-50" />
                <span className="text-[8px] font-black uppercase">iOS</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <IntegrationGuide 
        isOpen={isGuideOpen} 
        onOpenChange={setIsGuideOpen} 
        syncUrl={syncUrl} 
      />

      <p className="text-center text-xs font-bold text-muted-foreground opacity-50 uppercase tracking-[0.2em]">
        Safe & Secure • Local Storage
      </p>
    </div>
  );
}