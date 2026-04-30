import { Language } from '../types';

interface Props {
  current: Language;
  onChange: (lang: Language) => void;
}

export default function LanguageToggle({ current, onChange }: Props) {
  const labels = {
    [Language.ENGLISH]: 'English',
    [Language.HINDI]: 'हिन्दी',
    [Language.TELUGU]: 'తెలుగు'
  };

  return (
    <div className="flex bg-white/50 backdrop-blur-md p-1 rounded-full border border-brand-secondary/20 shadow-inner">
      {Object.values(Language).map((lang) => (
        <button
          key={lang}
          onClick={() => onChange(lang)}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            current === lang 
              ? 'bg-brand-primary text-white shadow-md' 
              : 'text-brand-earth hover:bg-brand-secondary/10'
          }`}
        >
          {labels[lang]}
        </button>
      ))}
    </div>
  );
}
