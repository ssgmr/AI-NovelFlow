#!/usr/bin/env python3
"""
数据库迁移脚本：为Character表添加音色相关字段
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.core.database import engine
from sqlalchemy import text

def upgrade():
    """添加音色相关字段到characters表"""

    print("正在为characters表添加音色字段...")

    with engine.connect() as conn:
        try:
            # 检查字段是否已存在
            result = conn.execute(text("PRAGMA table_info(characters)"))
            columns = [row[1] for row in result.fetchall()]

            # 添加音色提示词字段
            if 'voice_prompt' not in columns:
                conn.execute(text("ALTER TABLE characters ADD COLUMN voice_prompt TEXT DEFAULT ''"))
                print("已添加 voice_prompt 字段")

            # 添加参考音频URL字段
            if 'reference_audio_url' not in columns:
                conn.execute(text("ALTER TABLE characters ADD COLUMN reference_audio_url VARCHAR"))
                print("已添加 reference_audio_url 字段")

            conn.commit()
            print("音色字段添加成功！")

        except Exception as e:
            print(f"添加字段时出错: {e}")
            conn.rollback()

def downgrade():
    """回滚字段更改（谨慎使用）"""
    print("警告：此操作将删除新增的字段，可能导致数据丢失！")
    response = input("确认要回滚吗？(y/N): ")
    if response.lower() != 'y':
        print("操作已取消")
        return

    with engine.connect() as conn:
        try:
            print("注意：SQLite不支持直接删除列，请手动处理或重建表")
            print("请考虑以下方案：")
            print("1. 备份数据后重建characters表")
            print("2. 或者保留现有字段（推荐）")
            print("字段删除操作已跳过")
            conn.commit()
        except Exception as e:
            print(f"检查字段时出错: {e}")
            conn.rollback()

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "downgrade":
        downgrade()
    else:
        upgrade()