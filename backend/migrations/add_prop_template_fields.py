#!/usr/bin/env python3
"""
迁移脚本：为 novels 表添加道具模板关联字段
- prop_parse_prompt_template_id: 道具解析提示词模板
- prop_prompt_template_id: 道具生成提示词模板
"""
import sqlite3
import os

# 数据库路径
DB_PATH = os.path.join(os.path.dirname(__file__), "novelflow.db")


def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 检查 novels 表是否存在
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='novels'")
    if not cursor.fetchone():
        print("novels 表不存在，跳过迁移")
        conn.close()
        return
    
    # 获取现有列
    cursor.execute("PRAGMA table_info(novels)")
    columns = [column[1] for column in cursor.fetchall()]
    
    # 添加 prop_parse_prompt_template_id 字段
    if 'prop_parse_prompt_template_id' not in columns:
        print("添加 prop_parse_prompt_template_id 字段到 novels 表...")
        cursor.execute("ALTER TABLE novels ADD COLUMN prop_parse_prompt_template_id VARCHAR(36)")
        conn.commit()
        print("✅ prop_parse_prompt_template_id 字段添加成功")
    else:
        print("prop_parse_prompt_template_id 字段已存在，跳过")
    
    # 添加 prop_prompt_template_id 字段
    if 'prop_prompt_template_id' not in columns:
        print("添加 prop_prompt_template_id 字段到 novels 表...")
        cursor.execute("ALTER TABLE novels ADD COLUMN prop_prompt_template_id VARCHAR(36)")
        conn.commit()
        print("✅ prop_prompt_template_id 字段添加成功")
    else:
        print("prop_prompt_template_id 字段已存在，跳过")
    
    conn.close()
    print("\n✅ 迁移完成")


if __name__ == "__main__":
    migrate()
