import { useEffect, useState } from 'react';
import { useConfigStore } from '../../../stores/configStore';
import { useTranslation } from '../../../stores/i18nStore';

export function useWelcomeState() {
  const { t } = useTranslation();
  const { checkConnection, llmProvider, llmModel, llmApiKey, comfyUIHost } = useConfigStore();
  const [status, setStatus] = useState<{ llm: boolean; comfyui: boolean } | null>(null);
  const [checking, setChecking] = useState(false);

  const providerName = t(`systemSettings.providers.${llmProvider}`);
  const modelName = llmModel;
  const isConfigured = llmApiKey && comfyUIHost;

  const handleCheck = async () => {
    setChecking(true);
    const result = await checkConnection();
    setStatus(result);
    setChecking(false);
  };

  useEffect(() => { handleCheck(); }, []);

  return { status, checking, providerName, modelName, isConfigured, handleCheck, llmApiKey, comfyUIHost };
}
