import { useState, useEffect, useCallback } from 'react';
import { toast } from '../../../stores/toastStore';
import { useTranslation } from '../../../stores/i18nStore';
import { promptTemplateApi } from '../../../api/promptTemplates';
import { configApi } from '../../../api/config';
import type { PromptTemplate } from '../../../types';
import type { TemplateType, PromptForm } from '../types';
import { DEFAULT_PARSE_CHARACTERS_PROMPT, DEFAULT_CHARACTER_TEMPLATE, DEFAULT_CHAPTER_SPLIT_TEMPLATE } from '../constants';

export function usePromptConfigState() {
  const { t } = useTranslation();

  const [parsePrompt, setParsePrompt] = useState(DEFAULT_PARSE_CHARACTERS_PROMPT);
  const [savingParsePrompt, setSavingParsePrompt] = useState(false);
  const [characterTemplates, setCharacterTemplates] = useState<PromptTemplate[]>([]);
  const [loadingCharacter, setLoadingCharacter] = useState(true);
  const [chapterSplitTemplates, setChapterSplitTemplates] = useState<PromptTemplate[]>([]);
  const [loadingChapterSplit, setLoadingChapterSplit] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalType, setModalType] = useState<TemplateType>('character');
  const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | null>(null);
  const [viewingPrompt, setViewingPrompt] = useState<PromptTemplate | null>(null);
  const [form, setForm] = useState<PromptForm>({
    name: '', description: '', template: DEFAULT_CHARACTER_TEMPLATE, wordCount: 50
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCharacterTemplates();
    fetchChapterSplitTemplates();
  }, []);

  useEffect(() => {
    const fetchParsePrompt = async () => {
      try {
        const data = await configApi.get();
        if (data.success && data.data?.parseCharactersPrompt) {
          setParsePrompt(data.data.parseCharactersPrompt);
        }
      } catch (error) {
        console.error('加载配置失败:', error);
      }
    };
    fetchParsePrompt();
  }, []);

  const fetchCharacterTemplates = async () => {
    setLoadingCharacter(true);
    try {
      const data = await promptTemplateApi.fetchList('character');
      if (data.success && data.data) setCharacterTemplates(data.data);
    } catch (error) {
      console.error('加载人设提示词模板失败:', error);
    } finally {
      setLoadingCharacter(false);
    }
  };

  const fetchChapterSplitTemplates = async () => {
    setLoadingChapterSplit(true);
    try {
      const data = await promptTemplateApi.fetchList('chapter_split');
      if (data.success && data.data) setChapterSplitTemplates(data.data);
    } catch (error) {
      console.error('加载章节拆分提示词模板失败:', error);
    } finally {
      setLoadingChapterSplit(false);
    }
  };

  const openModal = useCallback((type: TemplateType, template?: PromptTemplate) => {
    setModalType(type);
    if (template) {
      setEditingPrompt(template);
      let wordCount = 50;
      if (type === 'chapter_split') {
        const numMatch = template.template.match(/必须控制\s*(\d+)\s*字/);
        if (numMatch) wordCount = parseInt(numMatch[1]);
      }
      setForm({ name: template.name, description: template.description, template: template.template, wordCount });
    } else {
      setEditingPrompt(null);
      setForm({
        name: '', description: '',
        template: type === 'character' ? DEFAULT_CHARACTER_TEMPLATE : DEFAULT_CHAPTER_SPLIT_TEMPLATE,
        wordCount: 50
      });
    }
    setShowModal(true);
  }, []);

  const openViewModal = useCallback((template: PromptTemplate) => {
    setViewingPrompt(template);
    setShowViewModal(true);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let templateContent = form.template;
      if (modalType === 'chapter_split') {
        templateContent = templateContent.replace(
          /每个分镜的剧情字数必须控制\s*{?每个分镜对应拆分故事字数}?\s*左右/,
          `每个分镜的剧情字数必须控制 ${form.wordCount} 字左右`
        );
        templateContent = templateContent.replace(/{每个分镜对应拆分故事字数}/g, `${form.wordCount}`);
      }
      const payload = { name: form.name, description: form.description, template: templateContent, type: modalType };
      const data = editingPrompt
        ? await promptTemplateApi.update(editingPrompt.id, payload)
        : await promptTemplateApi.create(payload);
      if (data.success) {
        toast.success(t('common.success'));
        setShowModal(false);
        modalType === 'character' ? fetchCharacterTemplates() : fetchChapterSplitTemplates();
      } else {
        toast.error(data.message || t('common.saveFailed'));
      }
    } catch (error) {
      console.error('保存提示词模板失败:', error);
      toast.error(t('common.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async (template: PromptTemplate) => {
    try {
      const data = await promptTemplateApi.copy(template.id);
      if (data.success) {
        toast.success(t('promptConfig.copySuccess'));
        template.type === 'character' ? fetchCharacterTemplates() : fetchChapterSplitTemplates();
      } else {
        toast.error(data.message || t('common.copyFailed'));
      }
    } catch (error) {
      console.error('复制提示词模板失败:', error);
      toast.error(t('common.copyFailed'));
    }
  };

  const handleDelete = async (template: PromptTemplate) => {
    if (!confirm(`${t('promptConfig.confirmDelete')} "${template.name}" ?`)) return;
    try {
      const data = await promptTemplateApi.delete(template.id);
      if (data.success) {
        template.type === 'character' ? fetchCharacterTemplates() : fetchChapterSplitTemplates();
      } else {
        toast.error(data.message || t('common.deleteFailed'));
      }
    } catch (error) {
      console.error('删除提示词模板失败:', error);
      toast.error(t('common.deleteFailed'));
    }
  };

  const handleSaveParsePrompt = async () => {
    setSavingParsePrompt(true);
    try {
      const data = await configApi.update({ parseCharactersPrompt: parsePrompt });
      if (data.success) toast.success(t('promptConfig.systemPromptSaved'));
      else toast.error(t('common.saveFailed'));
    } catch (error) {
      console.error('保存提示词失败:', error);
      toast.error('保存失败');
    } finally {
      setSavingParsePrompt(false);
    }
  };

  const handleResetParsePrompt = async () => {
    setParsePrompt(DEFAULT_PARSE_CHARACTERS_PROMPT);
    try {
      await configApi.update({ parseCharactersPrompt: DEFAULT_PARSE_CHARACTERS_PROMPT });
      toast.success(t('promptConfig.resetSuccess'));
    } catch {
      toast.success(t('promptConfig.resetSuccessFrontend'));
    }
  };

  return {
    // State
    parsePrompt, setParsePrompt, savingParsePrompt,
    characterTemplates, loadingCharacter,
    chapterSplitTemplates, loadingChapterSplit,
    showModal, setShowModal, showViewModal, setShowViewModal,
    modalType, editingPrompt, viewingPrompt,
    form, setForm, saving,
    // Actions
    openModal, openViewModal, handleSave, handleCopy, handleDelete,
    handleSaveParsePrompt, handleResetParsePrompt,
  };
}
