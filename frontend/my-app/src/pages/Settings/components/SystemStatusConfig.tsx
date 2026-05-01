import { Activity, Monitor } from 'lucide-react';

import { useTranslation } from '../../../stores/i18nStore';
import type { SettingsFormData } from '../types';

interface SystemStatusConfigProps {
  formData: SettingsFormData;
  onFormDataChange: (data: SettingsFormData) => void;
  onUserModified: () => void;
}

const OPTIONS = [
  {
    value: 'comfyui',
    icon: Monitor,
  },
  {
    value: 'windows_gpu_monitor',
    icon: Activity,
  },
] as const;

export default function SystemStatusConfig({ formData, onFormDataChange, onUserModified }: SystemStatusConfigProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
        <Activity className="h-5 w-5 text-blue-600" />
        <div>
          <h3 className="text-sm font-medium text-blue-900">{t('systemSettings.systemStatusSettings')}</h3>
          <p className="text-xs text-blue-700">{t('systemSettings.systemStatusSourceHint')}</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t('systemSettings.systemStatusSource')}
        </label>
        <div className="space-y-3">
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            const checked = formData.systemStatusSource === option.value;

            return (
              <label
                key={option.value}
                className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${
                  checked ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="systemStatusSource"
                  value={option.value}
                  checked={checked}
                  onChange={() => {
                    onUserModified();
                    onFormDataChange({ ...formData, systemStatusSource: option.value });
                  }}
                  className="mt-1 h-4 w-4 text-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <Icon className="h-4 w-4 text-gray-500" />
                    {t(`systemSettings.systemStatusSources.${option.value}.title`)}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {t(`systemSettings.systemStatusSources.${option.value}.description`)}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
