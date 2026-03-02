## 1. 数据模型扩展

- [x] 1.1 在 Character 模型中添加 voice_prompt 和 reference_audio_url 字段
- [x] 1.2 创建数据库迁移脚本添加新字段
- [x] 1.3 更新 CharacterBase 和 CharacterResponse schema 添加音色字段
- [x] 1.4 更新 CharacterUpdate schema 支持音色字段更新

## 2. 角色解析扩展

- [x] 2.1 更新默认 character_parse 提示词模板，要求返回 voice_prompt 字段
- [x] 2.2 修改 novel_service.py 中 parse_characters 方法提取 voice_prompt
- [x] 2.3 确保解析时 voice_prompt 字段可选，无值时不报错

## 3. 音色生成后端服务

- [x] 3.1 在 character_service.py 添加 create_character_voice_task 方法
- [x] 3.2 实现 _generate_voice_task 异步任务方法
- [x] 3.3 在 ComfyUIService 或 workflow builder 添加 voice_design 工作流构建方法
- [x] 3.4 实现音频文件下载存储到 files/{novel_id}/voices/ 目录

## 4. API 端点

- [x] 4.1 在 characters.py API 路由添加 POST /characters/{id}/voice 端点
- [x] 4.2 添加 GET /characters/{id}/voice/status 端点用于轮询任务状态
- [x] 4.3 更新 CharacterRepository 支持 voice_prompt 和 reference_audio_url 更新

## 5. 前端类型定义

- [x] 5.1 更新 src/types/index.ts 中 Character 类型添加 voice_prompt 和 reference_audio_url
- [x] 5.2 更新 src/api/characters.ts 添加 generateVoice 方法

## 6. 角色库 UI 组件

- [x] 6.1 在 CharacterCard 组件添加音色提示词显示区域
- [x] 6.2 将音色提示词编辑合并到角色编辑模态框中
- [x] 6.3 添加音频播放器组件显示参考音频
- [x] 6.4 将"生成音色"按钮放到生成人设图按钮旁边（右下角按钮组）
- [x] 6.5 实现生成状态显示和任务轮询

## 7. 国际化支持

- [x] 7.1 更新 zh-CN 翻译文件添加音色相关文本
- [x] 7.2 更新 en-US 翻译文件
- [x] 7.3 更新 ja-JP 翻译文件
- [x] 7.4 更新 ko-KR 翻译文件
- [x] 7.5 更新 zh-TW 翻译文件

## 8. 测试与验证

- [ ] 8.1 测试角色解析正确提取 voice_prompt
- [ ] 8.2 测试音色生成 API 调用流程
- [ ] 8.3 测试前端音频播放功能
- [x] 8.4 验证数据库迁移无问题