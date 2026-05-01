import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  User, 
  Download, 
  Cloud, 
  Settings, 
  Bell, 
  Shield, 
  CreditCard,
  Tags,
  Plus,
  Edit3,
  Trash2,
  FileText,
  Database,
  Moon,
  Sun,
  Wallet,
  Globe,
  Coins,
  Share2,
  Table,
  Check,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { useExpenses, Category } from '../context/ExpenseContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';

export function SettingsProfile() {
  const { 
    expenses, budget, updateBudget, categories, 
    addCategory, updateCategory, deleteCategory,
    currency, setCurrency, 
    language, setLanguage, 
    theme, setTheme,
    t, formatCurrency 
  } = useExpenses();
  
  const [notifications, setNotifications] = useState(true);
  const [userName, setUserName] = useState('John Doe');
  const [userEmail, setUserEmail] = useState('john.doe@example.com');
  const [isSyncing, setIsSyncing] = useState(false);

  // Category CRUD State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('💰');
  const [newCatColor, setNewCatColor] = useState('#6366f1');

  const handleOpenCategoryModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setNewCatName(cat.name);
      setNewCatIcon(cat.icon);
      setNewCatColor(cat.color);
    } else {
      setEditingCategory(null);
      setNewCatName('');
      setNewCatIcon('💰');
      setNewCatColor('#6366f1');
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = () => {
    if (!newCatName) {
      toast.error('Category name is required');
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, { name: newCatName, icon: newCatIcon, color: newCatColor });
    } else {
      addCategory({ name: newCatName, icon: newCatIcon, color: newCatColor });
    }
    setIsCategoryModalOpen(false);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Payment Method', 'Notes'];
    const rows = expenses.map(e => [
      e.date,
      e.description,
      categories.find(c => c.id === e.category)?.name || e.category,
      e.amount,
      e.paymentMethod,
      e.notes || ''
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `SpendWise_Export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Data exported as CSV successfully!');
  };

  const handleGoogleSheetsSync = () => {
    setIsSyncing(true);
    toast.loading('Syncing with Google Sheets...');
    setTimeout(() => {
      setIsSyncing(false);
      toast.dismiss();
      toast.success('Data integrated with Google Sheets!');
    }, 2000);
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('settings')}</h1>
          <p className="text-muted-foreground font-medium">Manage your account and app preferences.</p>
        </div>
        <Button onClick={exportToCSV} className="bg-primary rounded-xl px-6 h-12 shadow-lg shadow-primary/20 flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export All Data
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Export & Sync Section */}
          <Card className="rounded-[2.5rem] border border-border/50 bg-card overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg font-bold">
                <Share2 className="h-5 w-5 text-primary" />
                Export & Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <Button variant="outline" onClick={exportToCSV} className="h-32 flex-col gap-3 rounded-3xl border-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all">
                  <div className="p-3 bg-accent rounded-2xl"><FileText className="h-8 w-8 text-primary" /></div>
                  <span className="font-bold">Export CSV</span>
                </Button>
                <Button variant="outline" className="h-32 flex-col gap-3 rounded-3xl border-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all opacity-50">
                  <div className="p-3 bg-accent rounded-2xl"><FileText className="h-8 w-8 text-primary" /></div>
                  <span className="font-bold">Export PDF</span>
                </Button>
              </div>
              
              <Separator className="bg-border/30" />

              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-accent/20 rounded-[2rem] border border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center">
                      <Table className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Google Sheets Sync</p>
                      <p className="text-xs text-muted-foreground font-medium">Automatic cloud integration</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500 text-white border-none rounded-lg font-bold">Connected</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={handleGoogleSheetsSync} disabled={isSyncing} className="h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-2">
                    <Cloud className="h-4 w-4" />
                    Sync Data
                  </Button>
                  <Button variant="outline" className="h-12 rounded-xl border-border/50 font-bold">Disconnect</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Categories CRUD Section */}
          <Card className="rounded-[2.5rem] border border-border/50 bg-card overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-lg font-bold">
                <Tags className="h-5 w-5 text-primary" />
                Custom Categories
              </CardTitle>
              <Button onClick={() => handleOpenCategoryModal()} size="icon" className="rounded-xl h-10 w-10 bg-primary shadow-lg shadow-primary/20">
                <Plus className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-4 p-4 bg-accent/10 rounded-2xl border border-border/30 group hover:bg-accent/20 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {cat.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{cat.name}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {expenses.filter(e => e.category === cat.id).length} transactions
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button onClick={() => handleOpenCategoryModal(cat)} variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-white text-blue-500"><Edit3 className="h-4 w-4" /></Button>
                    <Button onClick={() => deleteCategory(cat.id)} variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-red-50 text-red-500"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
           <Card className="p-6 rounded-[2rem] border border-border/50 bg-card">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-24 w-24 border-4 border-accent shadow-xl">
                  <AvatarFallback className="bg-primary text-white text-3xl font-black">JD</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{userName}</h3>
                  <p className="text-sm font-medium text-muted-foreground">{userEmail}</p>
                </div>
                <Button variant="outline" className="w-full rounded-xl border-border/50 font-bold">Edit Profile</Button>
              </div>
           </Card>

           <Card className="p-6 rounded-[2rem] border border-border/50 bg-accent/10">
            <CardTitle className="flex items-center gap-3 text-lg font-bold mb-6">
              <Globe className="h-5 w-5 text-primary" />
              Regional
            </CardTitle>
            <div className="space-y-4">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest px-1">Language</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant={language === 'en' ? 'default' : 'outline'} onClick={() => setLanguage('en')} className="rounded-xl h-12 font-bold">EN</Button>
                    <Button variant={language === 'id' ? 'default' : 'outline'} onClick={() => setLanguage('id')} className="rounded-xl h-12 font-bold">ID</Button>
                  </div>
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest px-1">Currency</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant={currency === 'USD' ? 'default' : 'outline'} onClick={() => setCurrency('USD')} className="rounded-xl h-12 font-bold">USD</Button>
                    <Button variant={currency === 'IDR' ? 'default' : 'outline'} onClick={() => setCurrency('IDR')} className="rounded-xl h-12 font-bold">IDR</Button>
                  </div>
               </div>
            </div>
          </Card>

          <Card className="p-6 rounded-[2rem] border border-border/50 bg-accent/10">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-yellow-100 text-yellow-600'}`}>
                    {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  </div>
                  <span className="font-bold">{t('theme')}</span>
               </div>
               <Switch checked={theme === 'dark'} onCheckedChange={(val) => setTheme(val ? 'dark' : 'light')} />
            </div>
          </Card>
        </div>
      </div>

      {/* Category Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="rounded-3xl border-none p-8 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Category Name</Label>
              <Input 
                value={newCatName} 
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Subscriptions"
                className="h-12 rounded-xl bg-accent/20 border-none font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Icon (Emoji)</Label>
                <Input 
                  value={newCatIcon} 
                  onChange={(e) => setNewCatIcon(e.target.value)}
                  placeholder="💰"
                  className="h-12 rounded-xl bg-accent/20 border-none text-center text-2xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Brand Color</Label>
                <div className="flex gap-2 items-center">
                  <Input 
                    type="color"
                    value={newCatColor} 
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="h-12 w-12 rounded-xl bg-accent/20 border-none p-1 cursor-pointer"
                  />
                  <Input 
                    value={newCatColor} 
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="h-12 flex-1 rounded-xl bg-accent/20 border-none font-mono text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsCategoryModalOpen(false)} className="rounded-xl font-bold">Cancel</Button>
            <Button onClick={handleSaveCategory} className="rounded-xl font-bold px-8 bg-primary">Save Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}