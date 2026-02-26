import { useState, useEffect } from 'react';
import { toast } from '../../../stores/toastStore';
import { useTranslation, type Language } from '../../../stores/i18nStore';
import { configApi } from '../../../api/config';

export function useUIConfigState() {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState<Language>(i18n.language as Language);
  const [timezone, setTimezone] = useState(i18n.timezone);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const result = await configApi.get();
        if (result.success && result.data) {
          const config = result.data as any;
          if (config.language) { setLanguage(config.language); i18n.changeLanguage(config.language); }
          if (config.timezone) { setTimezone(config.timezone); i18n.changeTimezone(config.timezone); }
        }
      } catch (error) {
        console.error('加载配置失败:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  const handleTimezoneChange = (newTimezone: string) => {
    setTimezone(newTimezone);
    i18n.changeTimezone(newTimezone);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await configApi.update({ language, timezone } as any);
      if (result.success) toast.success(t('uiConfig.configSaved') || '界面配置已保存');
      else toast.error(t('common.saveFailed') || '保存失败');
    } catch (error) {
      console.error('保存界面配置失败:', error);
      toast.error(t('common.saveFailed') || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return { language, timezone, saving, loading, handleLanguageChange, handleTimezoneChange, handleSave };
}
