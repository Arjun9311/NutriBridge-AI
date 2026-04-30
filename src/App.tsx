import { useState, useEffect } from 'react';
import { Sprout, LogOut, Bell, Languages, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { db, auth } from './lib/firebase';
import { handleFirestoreError, OperationType } from './lib/errorHandlers';
import { api } from './lib/api';
import { generateAILogic } from './lib/geminiService';
import { CaseRecord, Language } from './types';
import Upload from './components/Upload';
import Result from './components/Result';
import Home from './components/Home';
import VoiceAssistant from './components/VoiceAssistant';
import LanguageToggle from './components/LanguageToggle';
import NotificationBanner, { useNotifications } from './components/NotificationManager';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [step, setStep] = useState<'home' | 'scan' | 'analyzing' | 'result' | 'ask' | 'history'>('home');
  const [currentResult, setCurrentResult] = useState<CaseRecord | null>(null);
  const [history, setHistory] = useState<CaseRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [lang, setLang] = useState<Language>(Language.ENGLISH);
  const [notifications, setNotifications] = useState<string[]>([]);
  
  const { sendNotification } = useNotifications();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) fetchHistory();
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (signingIn) return;
    setSigningIn(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed', error);
    } finally {
      setSigningIn(false);
    }
  };

  const handleLogout = () => signOut(auth).then(() => setStep('home'));

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const q = query(collection(db, 'cases'), orderBy('timestamp', 'desc'), limit(15));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CaseRecord));
      setHistory(docs);
      
      const diseases = docs.map(d => d.disease).filter(d => !d.toLowerCase().includes('healthy'));
      const counts: Record<string, number> = {};
      diseases.forEach(d => counts[d] = (counts[d] || 0) + 1);
      const alerts = Object.entries(counts).filter(([_, count]) => count >= 2).map(([d]) => d);
      setNotifications(alerts);

      if (alerts.length > 0) {
        sendNotification("Village Outbreak Alert!", `Farmers nearby reported ${alerts[0]}. Check your crops!`);
      }
      
    } catch (error) {
      console.error('Failed to fetch history', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const getUserLocation = (): Promise<{lat: number, lng: number}> => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => resolve({ lat: 12.9716, lng: 77.5946 })
        );
      } else {
        resolve({ lat: 12.9716, lng: 77.5946 });
      }
    });
  };

  const handleDetection = async (uploadData: { imageUrl: string; cropType: string; soilType: string }) => {
    setStep('analyzing');
    try {
      const location = await getUserLocation();
      const [weather, detection] = await Promise.all([
        api.getWeather(location.lat, location.lng),
        api.detectDisease(uploadData.imageUrl, uploadData.cropType)
      ]);

      const recommendation = await generateAILogic(detection.disease, uploadData.cropType, weather, lang);

      const record: CaseRecord = {
        imageUrl: uploadData.imageUrl,
        cropType: uploadData.cropType,
        soilType: uploadData.soilType,
        disease: detection.disease,
        confidence: detection.confidence,
        recommendation,
        weather,
        location,
        timestamp: new Date().toISOString(),
        userId: user?.uid || 'anonymous'
      };

      try {
        await addDoc(collection(db, 'cases'), {
          ...record,
          timestamp: serverTimestamp()
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, 'cases');
      }

      setCurrentResult(record);
      setStep('result');
      fetchHistory();
      
      // Schedule reminder
      setTimeout(() => {
        sendNotification("Action Reminder", `It's time to: ${recommendation.action}`);
      }, 10000); // 10s demo delay

    } catch (error) {
      console.error('Detection engine failed', error);
      alert('Error analyzing crop. Using cached results if available.');
      setStep('home');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4EF] flex flex-col font-sans" id="app-root">
      <NotificationBanner />
      
      {/* Mobile-Friendly Fixed Header */}
      <header className="py-4 px-6 flex justify-between items-center bg-white/80 backdrop-blur-xl border-b border-brand-secondary/10 sticky top-0 z-[100] shadow-sm">
        <div className="flex items-center space-x-2" onClick={() => setStep('home')}>
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white">
            <Sprout className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-serif text-brand-primary leading-none">NutriBridge <span className="block text-[8px] uppercase tracking-widest font-sans font-bold opacity-40">Assistant</span></h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <LanguageToggle current={lang} onChange={setLang} />
          
          {user ? (
            <button onClick={handleLogout} className="p-2 text-brand-earth hover:text-red-500 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={handleLogin} 
              disabled={signingIn}
              className="w-8 h-8 rounded-full bg-brand-secondary/20 flex items-center justify-center text-brand-primary disabled:opacity-50"
            >
              {signingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
            </button>
          )}
        </div>
      </header>

      <main className="flex-grow p-4 pb-24">
        <AnimatePresence mode="wait">
          {step === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Home 
                stats={{ scans: history.length, health: 'Good', alerts: notifications }} 
                onAction={(a) => {
                  if (a === 'scan') setStep('scan');
                  else if (a === 'ask') setStep('ask');
                  else if (a === 'myfarm') setStep('history');
                }} 
              />
            </motion.div>
          )}

          {step === 'scan' && (
            <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Upload onComplete={handleDetection} />
            </motion.div>
          )}

          {step === 'analyzing' && (
            <motion.div key="analyzing" className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
              <div className="w-20 h-20 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
              <div className="space-y-1">
                <p className="text-2xl font-serif text-brand-primary">Analyzing Crop...</p>
                <p className="text-brand-earth/60">Scanning for disease and checking weather...</p>
              </div>
            </motion.div>
          )}

          {step === 'result' && currentResult && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Result data={currentResult} lang={lang} onReset={() => setStep('home')} />
            </motion.div>
          )}

          {step === 'ask' && (
            <motion.div key="ask" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <VoiceAssistant lang={lang} />
            </motion.div>
          )}

          {step === 'history' && (
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
               <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-serif text-brand-primary">My Farm History</h2>
                 <button onClick={() => setStep('home')} className="text-xs font-bold text-brand-earth uppercase tracking-widest">Back</button>
               </div>
               <div className="space-y-3">
                  {history.map(record => (
                    <div key={record.id} onClick={() => { setCurrentResult(record); setStep('result'); }} className="glass-card !p-4 flex items-center space-x-4 cursor-pointer hover:border-brand-primary/30 transition-all">
                       <img src={record.imageUrl} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                       <div className="flex-grow">
                          <p className="font-bold text-brand-primary">{record.disease}</p>
                          <p className="text-xs text-brand-earth opacity-60">{record.cropType} • {new Date(record.timestamp?.seconds * 1000 || record.timestamp).toLocaleDateString()}</p>
                       </div>
                    </div>
                  ))}
                  {history.length === 0 && <p className="text-center py-20 opacity-40 italic">No history found yet.</p>}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Persistent Bottom Bar for Mobile Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-brand-primary/90 backdrop-blur-lg rounded-full px-8 py-4 flex justify-between items-center text-white shadow-2xl z-[100]">
        <button onClick={() => setStep('home')} className={`p-2 transition-transform ${step === 'home' ? 'scale-125' : 'opacity-60'}`}>
          <Sprout className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setStep('scan')} 
          className={`w-14 h-14 bg-white text-brand-primary rounded-full flex items-center justify-center shadow-lg -mt-10 transition-transform active:scale-90 ${step === 'scan' ? 'scale-110' : ''}`}
        >
          <Search className="w-8 h-8" />
        </button>
        <button onClick={() => setStep('ask')} className={`p-2 transition-transform ${step === 'ask' ? 'scale-125' : 'opacity-60'}`}>
          <Bell className="w-6 h-6" />
        </button>
      </nav>
    </div>
  );
}
