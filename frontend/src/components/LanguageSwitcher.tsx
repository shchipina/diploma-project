import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage, getCurrentLanguage } from '../i18n/config';
import { Button } from './ui/button';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());

  const handleLanguageChange = (lang: 'en' | 'uk') => {
    changeLanguage(lang);
    setCurrentLang(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant={currentLang === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleLanguageChange('en')}
      >
        EN
      </Button>
      <Button
        variant={currentLang === 'uk' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleLanguageChange('uk')}
      >
        УК
      </Button>
    </div>
  );
}
