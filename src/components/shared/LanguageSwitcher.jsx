import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const languages = [
  { code: 'en', name: '🇺🇸 English' },
  { code: 'es', name: '🇪🇸 Español' },
  { code: 'fr', name: '🇫🇷 Français' },
  { code: 'de', name: '🇩🇪 Deutsch' },
  { code: 'zh', name: '🇨🇳 中文' },
  { code: 'pt', name: '🇵🇹 Português' },
  { code: 'ja', name: '🇯🇵 日本語' },
  { code: 'ar', name: '🇸🇦 العربية' },
  { code: 'ru', name: '🇷🇺 Русский' },
  { code: 'ko', name: '🇰🇷 한국어' },
];

export default function LanguageSwitcher({ variant = 'icon' }) {
  const { language, setLanguage } = useLanguage();

  if (variant === 'select') {
    return (
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {variant === 'dropdown' ? (
        <div className="relative group">
          <Button variant="outline" size="icon" className="rounded-full">
            <Globe className="w-4 h-4" />
          </Button>
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg hidden group-hover:block z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`w-full text-left px-4 py-2 text-sm transition-all ${
                  language === lang.code ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <Button variant="outline" size="icon" className="rounded-full">
          <Globe className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}