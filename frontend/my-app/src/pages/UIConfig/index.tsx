import { Globe, Clock, Loader2, Save } from 'lucide-react';
import { useTranslation, languageOptions, timezoneOptions, type Language } from '../../stores/i18nStore';
import { useUIConfigState } from './hooks/useUIConfigState';

export default function UIConfig() {
  const { t } = useTranslation();
  const state = useUIConfigState();

  if (state.loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('uiConfig.title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('uiConfig.subtitle')}</p>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-teal-600" />
            <h2 className="text-lg font-semibold text-gray-900">{t('uiConfig.title')}</h2>
          </div>
          <button onClick={state.handleSave} disabled={state.saving}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors disabled:opacity-50">
            <Save className="h-4 w-4" />{state.saving ? t('common.saving') : t('common.save')}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Globe className="h-4 w-4 text-gray-400" />{t('uiConfig.languageSettings')}
            </label>
            <select value={state.language} onChange={(e) => state.handleLanguageChange(e.target.value as Language)} className="input-field w-full">
              {languageOptions.map((option) => (<option key={option.value} value={option.value}>{t(option.labelKey)}</option>))}
            </select>
            <p className="text-xs text-gray-500 mt-1">{t('uiConfig.selectLanguage')}</p>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Clock className="h-4 w-4 text-gray-400" />{t('uiConfig.timezoneSettings')}
            </label>
            <select value={state.timezone} onChange={(e) => state.handleTimezoneChange(e.target.value)} className="input-field w-full">
              {timezoneOptions.map((option) => (<option key={option.value} value={option.value}>{t(option.labelKey)}</option>))}
            </select>
            <p className="text-xs text-gray-500 mt-1">{t('uiConfig.selectTimezone')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
