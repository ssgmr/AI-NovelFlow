"""
添加工作流扩展属性字段

迁移脚本：为 workflows 表添加 extension 字段
"""

import sqlite3
import os
import sys

# 添加项目根目录到路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

def migrate():
    """执行迁移"""
    # 获取数据库路径
    db_path = os.path.join(os.path.dirname(__file__), '..', 'novels.db')
    
    if not os.path.exists(db_path):
        print(f"[Migrate] 数据库文件不存在: {db_path}")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # 检查 extension 字段是否已存在
        cursor.execute("PRAGMA table_info(workflows)")
        columns = cursor.fetchall()
        column_names = [col[1] for col in columns]
        
        if 'extension' in column_names:
            print("[Migrate] extension 字段已存在，跳过迁移")
        else:
            # 添加 extension 字段
            cursor.execute("ALTER TABLE workflows ADD COLUMN extension TEXT")
            conn.commit()
            print("[Migrate] 成功添加 extension 字段到 workflows 表")
        
    except Exception as e:
        print(f"[Migrate] 迁移失败: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    migrate()
