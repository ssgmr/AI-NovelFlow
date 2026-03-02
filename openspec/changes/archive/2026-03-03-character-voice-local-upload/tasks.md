## 1. 后端 API 实现

- [x] 1.1 在 `backend/app/api/characters.py` 新增 `POST /{character_id}/upload-audio` 端点
- [x] 1.2 在 `backend/app/services/character_service.py` 新增 `save_uploaded_audio` 方法
- [x] 1.3 在 `backend/app/services/file_storage.py` 新增 `save_uploaded_audio_file` 方法（保存上传的音频文件）
- [x] 1.4 添加音频格式校验（MP3/WAV/FLAC/OGG/M4A）和文件大小限制（≤10MB）

## 2. 前端 API 层

- [x] 2.1 在 `frontend/my-app/src/api/characters.ts` 新增 `uploadAudio` API 函数
- [x] 2.2 在 `frontend/my-app/src/pages/Characters/constants.ts` 新增音频格式常量 `ALLOWED_AUDIO_TYPES`

## 3. 前端 UI 实现

- [x] 3.1 在 `frontend/my-app/src/pages/Characters/index.tsx` 新增音频上传状态和处理函数
- [x] 3.2 在 `frontend/my-app/src/pages/Characters/components/CharacterCard.tsx` 新增"上传音频"按钮
- [x] 3.3 新增隐藏的音频文件 input 元素（复用现有 fileInputRef 模式）

## 4. 国际化

- [x] 4.1 更新 `frontend/my-app/src/i18n/locales/zh-CN/characters.ts` 添加音频上传翻译键
- [x] 4.2 更新 `frontend/my-app/src/i18n/locales/en-US/characters.ts` 添加音频上传翻译键
- [x] 4.3 更新 `frontend/my-app/src/i18n/locales/ja-JP/characters.ts` 添加音频上传翻译键
- [x] 4.4 更新 `frontend/my-app/src/i18n/locales/ko-KR/characters.ts` 添加音频上传翻译键
- [x] 4.5 更新 `frontend/my-app/src/i18n/locales/zh-TW/characters.ts` 添加音频上传翻译键

## 5. 测试验证

- [ ] 5.1 测试上传 MP3/WAV/FLAC 格式音频文件（需手动测试）
- [ ] 5.2 测试上传非音频格式文件（应返回格式错误）（需手动测试）
- [ ] 5.3 测试上传超过 10MB 的音频文件（应返回大小错误）（需手动测试）
- [ ] 5.4 测试上传后替换已有音频功能（需手动测试）
- [ ] 5.5 验证上传音频可用于分镜台词音频生成（需手动测试）