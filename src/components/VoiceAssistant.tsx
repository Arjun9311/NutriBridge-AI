import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, Loader2, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { chatWithAI } from '../lib/geminiService';
import { Language } from '../types';

interface Props {
  lang: Language;
}

export default function VoiceAssistant({ lang }: Props) {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Web Speech API
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Scroll to bottom
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = lang === Language.TELUGU ? 'te-IN' : lang === Language.HINDI ? 'hi-IN' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        handleSend(transcript);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [lang]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    const userMsg = { role: 'user' as const, text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const response = await chatWithAI(text, history, lang);
      const modelMsg = { role: 'model' as const, text: response };
      setMessages(prev => [...prev, modelMsg]);
      
      // Auto-speak in non-English if requested? Let's just provide a button.
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsTyping(false);
    }
  };

  const speak = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === Language.TELUGU ? 'te-IN' : lang === Language.HINDI ? 'hi-IN' : 'en-US';
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto glass-card !p-0 overflow-hidden" id="voice-assistant">
      <div className="bg-brand-primary p-4 text-white flex items-center space-x-3">
        <Bot className="w-6 h-6" />
        <div>
          <p className="font-bold text-sm">NutriBridge AI Assistant</p>
          <p className="text-[10px] opacity-70 uppercase tracking-widest">Always here to help</p>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-10 space-y-4 opacity-50">
            <Mic className="w-12 h-12 mx-auto stroke-thin" />
            <p className="text-sm italic">"Ask me about seeds, soil, or pests."</p>
          </div>
        )}
        
        {messages.map((m, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-2xl p-3 text-sm shadow-sm relative ${
              m.role === 'user' ? 'bg-brand-primary text-white rounded-br-none' : 'bg-white border border-brand-secondary/20 text-brand-earth rounded-bl-none'
            }`}>
              {m.text}
              {m.role === 'model' && (
                <button 
                  onClick={() => speak(m.text)}
                  className="absolute -right-10 top-2 p-2 hover:bg-brand-secondary/10 rounded-full"
                >
                  <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-brand-primary animate-pulse' : 'opacity-40'}`} />
                </button>
              )}
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-brand-secondary/20 rounded-2xl p-3 space-x-1 flex">
              <div className="w-1.5 h-1.5 bg-brand-secondary rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-brand-secondary rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-brand-secondary rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t border-brand-secondary/10 flex items-center space-x-3 bg-white/50">
        <button 
          onClick={toggleListening}
          className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-brand-secondary/10 text-brand-primary hover:bg-brand-secondary/20'}`}
        >
          {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>
        
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask something..."
          className="flex-grow bg-white border border-brand-secondary/20 rounded-full px-4 py-3 text-sm outline-none focus:ring-2 ring-brand-primary/20"
        />
        
        <button 
          onClick={() => handleSend()}
          disabled={!input.trim()}
          className="p-3 bg-brand-primary text-white rounded-full disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
