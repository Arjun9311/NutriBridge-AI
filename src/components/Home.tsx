import React from 'react';
import { Camera, MessageSquare, LayoutDashboard, AlertTriangle, ShieldCheck, Sun } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  onAction: (action: 'scan' | 'ask' | 'myfarm') => void;
  stats: {
    scans: number;
    health: string;
    alerts: string[];
  }
}

export default function Home({ onAction, stats }: Props) {
  const speakHint = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-xl mx-auto space-y-10 py-6" id="home-dashboard">
      {/* Welcome & Quick Stats */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-4xl font-serif text-brand-primary" onClick={() => speakHint("Namaste Farmer. Welcome to NutriBridge.")}>Namaste, Farmer</h2>
            <p className="text-brand-earth/60 font-medium">Your farm is looking healthy.</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-3xl border border-orange-100 flex items-center space-x-3 shadow-sm">
             <Sun className="w-8 h-8 text-orange-500" />
             <div>
               <p className="text-xs font-bold text-orange-800 uppercase tracking-widest">Local Weather</p>
               <p className="text-sm font-semibold text-orange-950">28°C • Sunny</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="glass-card !p-5 flex items-center space-x-4">
              <div className="w-12 h-12 bg-brand-secondary/10 flex items-center justify-center rounded-2xl">
                 <ShieldCheck className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                 <p className="text-[10px] uppercase font-bold text-brand-earth tracking-tighter opacity-60">Total Scans</p>
                 <p className="text-2xl font-serif text-brand-primary">{stats.scans}</p>
              </div>
           </div>
           <div className="glass-card !p-5 flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-50 flex items-center justify-center rounded-2xl">
                 <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                 <p className="text-[10px] uppercase font-bold text-brand-earth tracking-tighter opacity-60">Village Alerts</p>
                 <p className="text-2xl font-serif text-red-700">{stats.alerts.length}</p>
              </div>
           </div>
        </div>
      </div>

      {/* Main Actions - Large Buttons */}
      <div className="grid grid-cols-1 gap-6">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            speakHint("Opening camera. Please take a clear photo of the leaf.");
            onAction('scan');
          }}
          className="bg-brand-primary group relative overflow-hidden text-white p-10 rounded-[50px] shadow-2xl flex flex-col items-center text-center space-y-6"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Camera className="w-40 h-40" />
          </div>
          <div className="w-24 h-24 bg-white/20 rounded-[35px] flex items-center justify-center backdrop-blur-md shadow-inner">
            <Camera className="w-12 h-12" />
          </div>
          <div className="z-10">
            <h3 className="text-4xl font-serif mb-2">Scan Crop</h3>
            <p className="text-white/80 text-base font-medium">Detect disease instantly</p>
          </div>
        </motion.button>

        <div className="grid grid-cols-2 gap-6">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              speakHint("Ask me anything about farming.");
              onAction('ask');
            }}
            className="glass-card hover:bg-brand-primary hover:text-white transition-all group flex flex-col items-center text-center p-8 space-y-4 !rounded-[45px] shadow-lg"
          >
            <div className="w-16 h-16 bg-blue-50 group-hover:bg-white/20 rounded-full flex items-center justify-center transition-colors shadow-sm">
              <MessageSquare className="w-8 h-8 text-blue-500 group-hover:text-white" />
            </div>
            <div>
              <h3 className="text-xl font-serif">Ask AI</h3>
              <p className="text-[10px] opacity-60 font-medium">Talk to Helper</p>
            </div>
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              speakHint("Opening your farm history.");
              onAction('myfarm');
            }}
            className="glass-card hover:bg-brand-earth hover:text-white transition-all group flex flex-col items-center text-center p-8 space-y-4 !rounded-[45px] shadow-lg"
          >
            <div className="w-16 h-16 bg-amber-50 group-hover:bg-white/20 rounded-full flex items-center justify-center transition-colors shadow-sm">
              <LayoutDashboard className="w-8 h-8 text-amber-500 group-hover:text-white" />
            </div>
            <div>
              <h3 className="text-xl font-serif">My Farm</h3>
              <p className="text-[10px] opacity-60 font-medium">History & Alerts</p>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Neighbor Alerts */}
      {stats.alerts.length > 0 && (
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start space-x-3"
        >
          <div className="bg-red-500 p-2 rounded-lg text-white mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-red-900">Disease spreading nearby!</p>
            <p className="text-xs text-red-700 leading-relaxed">Farmers in your village reported **{stats.alerts[0]}** recently. Check your fields.</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
