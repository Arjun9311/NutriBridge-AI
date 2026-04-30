import { useState, useRef } from 'react';
import { Upload as UploadIcon, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { CropType } from '../types';

interface Props {
  onComplete: (data: { imageUrl: string; cropType: string; soilType: string }) => void;
}

export default function Upload({ onComplete }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [cropType, setCropType] = useState<CropType>(CropType.TOMATO);
  const [soilType, setSoilType] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const speakHint = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
      speakHint("Image selected. Now tap the green button to start detection.");
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const storageRef = ref(storage, `crops/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      onComplete({ imageUrl: url, cropType, soilType });
    } catch (error) {
      console.error('Upload failed', error);
      alert('Upload failed. Please check storage bucket permissions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8" id="upload-section">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-serif text-brand-primary">Analyze Your Crop</h2>
        <p className="text-muted-foreground italic text-lg">Upload an image of the plant leaf or affected area.</p>
      </div>

      <div className="glass-card space-y-6">
        {/* Dropzone */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed border-brand-secondary/30 rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors ${file ? 'border-none' : 'hover:bg-brand-secondary/5'}`}
        >
          {preview ? (
            <>
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-2 text-brand-earth">
              <UploadIcon className="w-12 h-12 stroke-[1.5]" />
              <span className="font-medium">Click or drag image here</span>
              <span className="text-xs opacity-60">JPG, PNG up to 5MB</span>
            </div>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest font-semibold text-brand-earth">Crop Type</label>
            <select 
              value={cropType} 
              onChange={(e) => setCropType(e.target.value as CropType)}
              className="w-full bg-white border border-brand-secondary/20 rounded-xl p-3 outline-none focus:ring-2 ring-brand-primary/20"
            >
              {Object.values(CropType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest font-semibold text-brand-earth">Soil Type (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. Loamy, Sandy"
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              className="w-full bg-white border border-brand-secondary/20 rounded-xl p-3 outline-none focus:ring-2 ring-brand-primary/20"
            />
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={!file || loading}
          className="button-primary w-full flex items-center justify-center space-x-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Start Detection</span>}
        </button>
      </div>
    </div>
  );
}
