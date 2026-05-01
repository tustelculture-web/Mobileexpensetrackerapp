import React, { useState } from 'react';
import { DashboardMockup } from './components/mockups/DashboardMockup';
import { AddExpenseMockup } from './components/mockups/AddExpenseMockup';
import { AnalyticsMockup } from './components/mockups/AnalyticsMockup';
import { SearchMockup } from './components/mockups/SearchMockup';
import { SettingsMockup } from './components/mockups/SettingsMockup';
import { Button } from './components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const mockups = [
  { id: 'dashboard', name: 'Dashboard', component: DashboardMockup },
  { id: 'add', name: 'Add Expense', component: AddExpenseMockup },
  { id: 'analytics', name: 'Analytics', component: AnalyticsMockup },
  { id: 'search', name: 'Search & Filter', component: SearchMockup },
  { id: 'settings', name: 'Settings', component: SettingsMockup }
];

export default function App() {
  const [currentMockup, setCurrentMockup] = useState(0);
  const CurrentMockupComponent = mockups[currentMockup].component;

  const nextMockup = () => {
    setCurrentMockup((prev) => (prev + 1) % mockups.length);
  };

  const prevMockup = () => {
    setCurrentMockup((prev) => (prev - 1 + mockups.length) % mockups.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">
          Expense Tracker Mobile App
        </h1>
        <p className="text-lg text-slate-600 mb-6">
          Modern UI Mockups for Mobile Expense Management
        </p>
        
        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={prevMockup}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="text-center">
            <p className="font-medium text-slate-800">
              {mockups[currentMockup].name}
            </p>
            <p className="text-sm text-slate-500">
              {currentMockup + 1} of {mockups.length}
            </p>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={nextMockup}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Frame */}
      <div className="flex justify-center">
        <div className="relative">
          {/* Phone Frame */}
          <div className="w-[375px] h-[812px] bg-black rounded-[3rem] p-2 shadow-2xl">
            {/* Screen */}
            <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
              {/* Status Bar */}
              <div className="h-11 bg-white flex items-center justify-between px-8 text-black text-sm font-medium relative z-10">
                <span>9:41</span>
                <div className="w-6 h-3 bg-black rounded-sm"></div>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-3 border border-black rounded-sm">
                    <div className="w-4 h-1 bg-black rounded-full mt-1 ml-0.5"></div>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="h-[calc(100%-44px)] overflow-hidden">
                <CurrentMockupComponent />
              </div>
            </div>
          </div>

          {/* Phone Details */}
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
            <p className="text-sm text-slate-500">iPhone 14 Pro - 375×812</p>
          </div>
        </div>
      </div>

      {/* Mockup Indicators */}
      <div className="flex justify-center gap-2 mt-16">
        {mockups.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentMockup(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentMockup 
                ? 'bg-slate-800 scale-110' 
                : 'bg-slate-400 hover:bg-slate-600'
            }`}
          />
        ))}
      </div>

      {/* Features List */}
      <div className="max-w-4xl mx-auto mt-16 grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Key Features</h3>
          <ul className="space-y-2 text-slate-600">
            <li>• Monthly spending summary with visual progress</li>
            <li>• Interactive pie charts for category breakdown</li>
            <li>• AI-powered receipt scanning & auto-categorization</li>
            <li>• Natural language search ("Show coffee expenses")</li>
            <li>• Smart budget alerts and overspending warnings</li>
            <li>• Detailed analytics with trend charts</li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Design Highlights</h3>
          <ul className="space-y-2 text-slate-600">
            <li>• Clean, minimalist material design</li>
            <li>• Large touch targets for mobile usability</li>
            <li>• Intuitive bottom navigation</li>
            <li>• AI features clearly marked with icons</li>
            <li>• Responsive cards and smooth animations</li>
            <li>• Accessible color contrast and typography</li>
          </ul>
        </div>
      </div>
    </div>
  );
}