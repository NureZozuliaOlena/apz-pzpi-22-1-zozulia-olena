import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher">
      <button 
        className={`language-button ${i18n.language === 'en' ? 'active' : ''}`}
        onClick={() => changeLanguage('en')}
      >
        EN
      </button>
      <span>|</span>
      <button 
        className={`language-button ${i18n.language === 'uk' ? 'active' : ''}`}
        onClick={() => changeLanguage('uk')}
      >
        UA
      </button>
    </div>
  );
};

export default LanguageSwitcher;