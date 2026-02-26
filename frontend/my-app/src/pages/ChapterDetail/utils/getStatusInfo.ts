import { CheckCircle, AlertCircle, Loader2, FileText, Image as ImageIcon, Film } from 'lucide-react';
import { useTranslation } from '../../../stores/i18nStore';
import type { Chapter } from '../../../types';
import type { StatusInfo } from '../types';

export function getStatusInfo(status: Chapter['status'], t: any): StatusInfo {
  switch (status) {
    case 'completed': return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', text: t('status.completed') };
    case 'failed': return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', text: t('status.failed') };
    case 'parsing': return { icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-50', text: t('status.parsing') };
    case 'generating_characters': return { icon: Loader2, color: 'text-purple-600', bg: 'bg-purple-50', text: t('status.generatingCharacters') };
    case 'generating_shots': return { icon: ImageIcon, color: 'text-orange-600', bg: 'bg-orange-50', text: t('status.generatingShots') };
    case 'generating_videos': return { icon: Film, color: 'text-pink-600', bg: 'bg-pink-50', text: t('status.generatingVideos') };
    case 'compositing': return { icon: Film, color: 'text-indigo-600', bg: 'bg-indigo-50', text: t('status.compositing') };
    default: return { icon: FileText, color: 'text-gray-600', bg: 'bg-gray-50', text: t('status.pending') };
  }
}
