import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Smartphone, Bot, Table, Copy, ExternalLink, Check } from 'lucide-react';
import { toast } from 'sonner';

interface IntegrationGuideProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  syncUrl: string;
}

export function IntegrationGuide({ isOpen, onOpenChange, syncUrl }: IntegrationGuideProps) {
  const [copied, setCopied] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(null), 2000);
  };

  const appsScriptCode = `function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  
  const headers = data[0];
  const json = data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
  return ContentService.createTextOutput(JSON.stringify(json))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    sheet.appendRow([
      data.id || Math.random().toString(36).substr(2, 9),
      data.description,
      data.amount,
      data.category,
      data.date || new Date().toISOString().split('T')[0],
      data.paymentMethod || 'External',
      data.notes || ""
    ]);
    return ContentService.createTextOutput("Success")
      .setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.message)
      .setMimeType(ContentService.MimeType.TEXT);
  }
}`;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] border-none p-0 shadow-2xl">
        <div className="bg-primary/5 p-8 border-b border-border/50">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black flex items-center gap-3">
              <ExternalLink className="h-8 w-8 text-primary" />
              Flawless Integration
            </DialogTitle>
            <DialogDescription className="text-base font-medium">
              Connect your expense tracker with external tools for real-time updates.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8">
          <Tabs defaultValue="sheets" className="space-y-8">
            <TabsList className="grid grid-cols-3 h-14 rounded-2xl bg-accent/20 p-1">
              <TabsTrigger value="sheets" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Table className="h-4 w-4 mr-2" /> Google Sheets
              </TabsTrigger>
              <TabsTrigger value="shortcuts" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Smartphone className="h-4 w-4 mr-2" /> Shortcuts
              </TabsTrigger>
              <TabsTrigger value="telegram" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Bot className="h-4 w-4 mr-2" /> Telegram
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sheets" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">1. Setup Your Database</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Use Google Sheets as a free, powerful backend for your data. This allows background updates from any device.
                </p>
                <div className="bg-accent/10 p-6 rounded-3xl space-y-4 border border-border/50">
                  <ol className="list-decimal list-inside space-y-3 text-sm font-medium">
                    <li>Create a new <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-primary underline">Google Sheet</a>.</li>
                    <li>Add headers in the first row: <code className="bg-white px-2 py-1 rounded-lg">id, description, amount, category, date, paymentMethod, notes</code></li>
                    <li>Go to <strong>Extensions &gt; Apps Script</strong>.</li>
                    <li>Paste the code below and click <strong>Deploy &gt; New Deployment</strong>.</li>
                    <li>Choose <strong>Web App</strong>, set access to <strong>"Anyone"</strong>, and click <strong>Deploy</strong>.</li>
                    <li><strong>IMPORTANT:</strong> Copy the URL ending in <code className="bg-primary/10 px-1 rounded">/exec</code>. Do NOT use URLs ending in <code className="bg-red-100 text-red-600 px-1 rounded">/dev</code> as they will fail to sync.</li>
                  </ol>
                </div>
                <div className="relative">
                  <pre className="p-6 bg-slate-950 text-slate-300 rounded-3xl overflow-x-auto text-[10px] leading-relaxed font-mono border border-white/10">
                    {appsScriptCode}
                  </pre>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="absolute top-4 right-4 rounded-xl font-bold"
                    onClick={() => copyToClipboard(appsScriptCode, 'code')}
                  >
                    {copied === 'code' ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    Copy Code
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="shortcuts" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">2. iOS Shortcuts (One-Tap Add)</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Add expenses instantly from your home screen or via Siri without opening the app.
                </p>
                
                {!syncUrl ? (
                  <div className="p-6 bg-amber-50 border border-amber-200 rounded-3xl text-amber-800 text-sm font-bold flex items-center gap-3">
                    <Check className="h-5 w-5 rotate-45" />
                    Please set your Sync URL in Settings first to generate shortcut steps.
                  </div>
                ) : (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
                        <p className="font-bold text-sm flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          Method A: Silent Background
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">Updates Google Sheets without opening the app.</p>
                      </div>
                      <div className="bg-accent/10 p-5 rounded-2xl space-y-3 border border-border/50 text-[11px] font-medium leading-relaxed">
                        <ul className="list-disc list-inside space-y-2">
                          <li>Action: <strong>Ask for Input</strong> (Amount)</li>
                          <li>Action: <strong>Ask for Input</strong> (Description)</li>
                          <li>Action: <strong>Dictionary</strong>:
                            <ul className="ml-4 mt-1 opacity-70">
                              <li>- amount: (Input)</li>
                              <li>- description: (Input)</li>
                              <li>- category: "1" (Food)</li>
                              <li>- paymentMethod: "Shortcut"</li>
                            </ul>
                          </li>
                          <li>Action: <strong>Get Contents of URL</strong>
                            <ul className="ml-4 mt-1 opacity-70">
                              <li>- URL: Your Sync URL</li>
                              <li>- Method: POST</li>
                              <li>- Body: JSON (Dictionary)</li>
                            </ul>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                        <p className="font-bold text-sm flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-blue-500" />
                          Method B: Instant In-App
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">Opens the app and adds it to UI immediately.</p>
                      </div>
                      <div className="bg-accent/10 p-5 rounded-2xl space-y-3 border border-border/50 text-[11px] font-medium leading-relaxed">
                        <ul className="list-disc list-inside space-y-2">
                          <li>Action: <strong>Ask for Input</strong> (Amount)</li>
                          <li>Action: <strong>Ask for Input</strong> (Description)</li>
                          <li>Action: <strong>URL</strong> (Use this template):
                            <code className="block mt-2 p-2 bg-white rounded-lg text-[9px] break-all border border-primary/20">
                              {window.location.origin}/add?amount=<strong>AMOUNT</strong>&desc=<strong>DESC</strong>&auto=true
                            </code>
                          </li>
                          <li>Action: <strong>URL Encode</strong> (The DESC input)</li>
                          <li>Action: <strong>Open URL</strong></li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button 
                      onClick={() => copyToClipboard(syncUrl, 'url')}
                      className="w-full h-14 rounded-2xl bg-primary text-white font-black flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
                    >
                      <Copy className="h-5 w-5" />
                      Copy Your Sync URL
                    </Button>
                  </div>
                </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="telegram" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">3. Telegram Bot Integration</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Message your expenses to a bot and watch them appear in SpendWise in real-time.
                </p>
                <div className="bg-accent/10 p-6 rounded-3xl space-y-4 border border-border/50">
                  <p className="font-bold text-sm">Fastest Way (using Pipedream):</p>
                  <ol className="list-decimal list-inside space-y-3 text-sm font-medium">
                    <li>Create a free account on <a href="https://pipedream.com" className="text-primary underline">Pipedream</a>.</li>
                    <li>Create a workflow with <strong>Telegram Bot</strong> trigger.</li>
                    <li>Add an <strong>HTTP Request</strong> step to POST the message data to your Sync URL.</li>
                    <li>Simply text your bot: <code className="bg-white px-2 py-1 rounded-lg">15.50 Lunch</code></li>
                  </ol>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
