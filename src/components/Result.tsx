import { CloudRain, Thermometer, CheckCircle, Info, DollarSign, Clock, Volume2, TrendingUp, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';
import { CaseRecord, Language } from '../types';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

interface Props {
  data: CaseRecord;
  lang: Language;
  onReset: () => void;
}

export default function Result({ data, lang, onReset }: Props) {
  const { disease, confidence, recommendation, weather, cropType } = data;
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (confidence > 0.8) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2D5A27', '#8BA888', '#F9FBF9']
      });
    }
  }, []);

  const speakResult = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const text = `${recommendation.action}. ${recommendation.explanation}`;
    const utterance = new SpeechSynthesisUtterance(text);
    // Language mapping for synthesis
    utterance.lang = lang === Language.TELUGU ? 'te-IN' : lang === Language.HINDI ? 'hi-IN' : 'en-US';
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const riskColor = recommendation.risk === 'High' ? 'text-red-500 bg-red-50' : 
                    recommendation.risk === 'Medium' ? 'text-orange-500 bg-orange-50' : 
                    'text-green-500 bg-green-50';

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-24" id="result-page">
      <div className="relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[40px] overflow-hidden shadow-2xl border-4 border-white aspect-square relative"
        >
          <img src={data.imageUrl} alt="Crop" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8 text-white">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${riskColor} text-white bg-opacity-20 backdrop-blur-md`}>
                {recommendation.risk} Risk
              </span>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-70 mb-1">{cropType}</p>
            <h2 className="text-4xl font-serif">{disease}</h2>
            <p className="text-sm font-medium opacity-80">{(confidence * 100).toFixed(0)}% AI Confidence</p>
          </div>
        </motion.div>
        
        <button 
          onClick={speakResult}
          className={`absolute bottom-4 right-4 p-5 rounded-full shadow-2xl transition-all ${isSpeaking ? 'bg-orange-500 text-white animate-pulse' : 'bg-white text-brand-primary hover:bg-brand-primary hover:text-white'}`}
        >
          <Volume2 className="w-8 h-8" />
        </button>
      </div>

      <div className="space-y-4 px-2">
        {/* Weather Alert */}
        <div className={`p-5 rounded-3xl flex items-center space-x-4 ${weather.rainExpected ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-orange-50 text-orange-700 border border-orange-100'}`}>
          <div className="w-12 h-12 rounded-2xl bg-white/50 flex items-center justify-center border border-current opacity-30">
            {weather.rainExpected ? <CloudRain className="w-6 h-6" /> : <Thermometer className="w-6 h-6" />}
          </div>
          <div className="flex-grow">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Smart Weather Guard</p>
            <p className="text-base font-bold">{weather.rainExpected ? 'Wait! Rain detected' : 'Clear Sky - Good for Spraying'}</p>
          </div>
        </div>

        {/* Action Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-brand-primary text-white p-8 rounded-[40px] space-y-4 shadow-xl relative overflow-hidden"
        >
          <CheckCircle className="absolute -top-6 -right-6 w-32 h-32 opacity-5" />
          <div className="flex items-center space-x-2 text-white/50 uppercase tracking-widest text-[10px] font-bold">
            <Clock className="w-3 h-3" />
            <span>Recommended Action</span>
          </div>
          <p className="text-2xl font-semibold leading-tight">{recommendation.action}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">{recommendation.time}</span>
          </div>
        </motion.div>

        {/* Financial Insight */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card !p-5 bg-brand-secondary/5 border-brand-secondary/20">
            <div className="flex items-center space-x-2 text-brand-earth uppercase tracking-widest text-[10px] font-bold mb-1">
              <DollarSign className="w-3 h-3" />
              <span>Cost</span>
            </div>
            <p className="text-xl font-serif text-brand-primary">₹{recommendation.cost}</p>
          </div>
          <div className="glass-card !p-5 bg-green-50 border-green-200">
            <div className="flex items-center space-x-2 text-green-700 uppercase tracking-widest text-[10px] font-bold mb-1">
              <TrendingUp className="w-3 h-3" />
              <span>Savings</span>
            </div>
            <p className="text-xl font-serif text-green-700">₹{recommendation.savings}</p>
          </div>
        </div>

        {/* Explanation */}
        <div className="glass-card !p-6 space-y-4">
           <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-brand-earth uppercase tracking-widest text-[10px] font-bold opacity-60">
                <Info className="w-3 h-3" />
                <span>Why this advice?</span>
              </div>
           </div>
          <div className="prose prose-sm font-medium text-brand-earth/90 leading-relaxed italic border-l-4 border-brand-secondary/20 pl-4">
            <ReactMarkdown>{recommendation.explanation}</ReactMarkdown>
          </div>
        </div>

        <button 
          onClick={onReset}
          className="button-primary w-full !rounded-[40px] !py-5 text-lg font-serif shadow-lg"
        >
          Back to Farm Dashboard
        </button>
      </div>
    </div>
  );
}
