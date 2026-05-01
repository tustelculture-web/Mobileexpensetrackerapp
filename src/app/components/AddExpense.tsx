import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Camera, Sparkles, DollarSign, ArrowLeft, Zap, Check } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useExpenses } from '../context/ExpenseContext';
import { useNavigate } from 'react-router-dom';

const paymentMethods = [
  { id: 'credit', name: 'Credit Card', icon: '💳' },
  { id: 'debit', name: 'Debit Card', icon: '💳' },
  { id: 'cash', name: 'Cash', icon: '💵' },
  { id: 'digital', name: 'Digital Wallet', icon: '📱' }
];

export function AddExpense() {
  const { addExpense, categories, currency, t } = useExpenses();
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    const val = value.toLowerCase();
    if (val.includes('coffee') || val.includes('restaurant') || val.includes('food')) setAiSuggestion('food');
    else if (val.includes('uber') || val.includes('gas') || val.includes('transport')) setAiSuggestion('transport');
    else if (val.includes('netflix') || val.includes('bill')) setAiSuggestion('bills');
    else if (val.includes('shopping')) setAiSuggestion('shopping');
    else setAiSuggestion(null);
  };

  const handleScanReceipt = () => {
    toast.success('Receipt scanned!');
    setAmount('23.45');
    setDescription('Target Store');
    setSelectedCategory('shopping');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !selectedCategory) {
      toast.error('Fill required fields.');
      return;
    }
    addExpense({
      amount: parseFloat(amount),
      description,
      category: selectedCategory,
      paymentMethod,
      date: format(date, 'yyyy-MM-dd'),
      notes
    });
    toast.success('Expense added!');
    navigate('/');
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-3xl font-bold">{t('add_expense')}</h1>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="bg-accent/10 border-border/50 rounded-[2rem]">
              <CardContent className="p-6">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 block">
                  {t('description')}
                </Label>
                <Input
                  placeholder="e.g. Starbucks"
                  value={description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  className="h-12 text-lg font-bold bg-background border-border"
                  required
                />
                {aiSuggestion && (
                  <div className="mt-4 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold">{t('category')} Suggestion: {categories.find(c => c.id === aiSuggestion)?.name}</span>
                    </div>
                    <Button type="button" size="sm" onClick={() => setSelectedCategory(aiSuggestion)} className="h-7 text-[10px] font-bold">Apply</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-accent/10 border-border/50 rounded-[2rem]">
              <CardContent className="p-6">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 block">
                  {t('category')}
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                        selectedCategory === cat.id ? 'border-primary bg-primary/5' : 'border-transparent bg-background/50'
                      }`}
                    >
                      <span className="text-xl mb-1">{cat.icon}</span>
                      <span className="text-[9px] font-bold uppercase truncate w-full text-center">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid sm:grid-cols-2 gap-4">
               <Card className="bg-accent/10 border-border/50 rounded-[2rem]">
                <CardContent className="p-6">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 block">{t('date')}</Label>
                  <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-12 justify-start font-bold rounded-xl bg-background">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(date, 'MMM dd, yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={date} onSelect={(d) => d && (setDate(d), setIsDateOpen(false))} />
                    </PopoverContent>
                  </Popover>
                </CardContent>
              </Card>
              <Card className="bg-accent/10 border-border/50 rounded-[2rem]">
                <CardContent className="p-6">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 block">{t('payment')}</Label>
                  <div className="grid grid-cols-2 gap-1">
                    {paymentMethods.slice(0, 4).map(m => (
                      <button key={m.id} type="button" onClick={() => setPaymentMethod(m.id)} className={`py-1.5 rounded-lg border text-[9px] font-bold uppercase transition-all ${paymentMethod === m.id ? 'bg-primary text-white border-primary' : 'bg-background text-muted-foreground border-border'}`}>{m.name}</button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button type="submit" className="w-full h-16 text-lg font-black rounded-2xl bg-primary hover:opacity-90 shadow-xl shadow-primary/20">
              {t('confirm')}
            </Button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6 order-first lg:order-last">
          <Card className="bg-primary text-white rounded-[2rem] border-none shadow-xl overflow-hidden relative">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <CardContent className="p-8">
              <Label className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-4 block">{t('amount')}</Label>
              <div className="relative flex items-center justify-end">
                <span className="absolute left-0 text-3xl font-black text-white/30">{currency === 'USD' ? '$' : 'Rp'}</span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-transparent border-none text-6xl h-20 font-black text-white placeholder:text-white/20 text-right focus-visible:ring-0"
                  required
                  autoFocus
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed border-2 border-muted hover:border-primary/50 bg-accent/5 rounded-[2rem] transition-all cursor-pointer group" onClick={handleScanReceipt}>
            <CardContent className="p-10 text-center">
              <Camera className="h-10 w-10 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg mb-1">Smart Scan</h3>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider leading-relaxed px-4">Extract from receipt using AI</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}