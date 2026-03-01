#!/usr/bin/env python3
"""
迁移脚本：为 tasks 表添加 prop_id 字段
运行: cd backend && python migrations/add_prop_id_to_tasks.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text

DATABASE_URL = "sqlite:///./novelflow.db"


def migrate():
    """添加 prop_id 列到 tasks 表"""
    engine = create_engine(DATABASE_URL)

    with engine.connect() as conn:
        try:
            # 检查字段是否已存在
            result = conn.execute(text("PRAGMA table_info(tasks)"))
            columns = [row[1] for row in result.fetchall()]

            if 'prop_id' not in columns:
                conn.execute(text("ALTER TABLE tasks ADD COLUMN prop_id VARCHAR"))
                print("✓ Added prop_id column to tasks table")
            else:
                print("✓ prop_id column already exists")

            # 检查索引是否存在
            result = conn.execute(text(
                "SELECT name FROM sqlite_master WHERE type='index' AND name='ix_tasks_prop_id'"
            ))
            if result.fetchone() is None:
                conn.execute(text("CREATE INDEX ix_tasks_prop_id ON tasks(prop_id)"))
                print("✓ Created index ix_tasks_prop_id")
            else:
                print("✓ Index ix_tasks_prop_id already exists")

            conn.commit()
        except Exception as e:
            print(f"✗ Error: {e}")
            conn.rollback()

    print("\n✅ Migration completed!")


def check_table_structure():
    """检查并打印 tasks 表结构"""
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        try:
            result = conn.execute(text("PRAGMA table_info(tasks)"))
            columns = result.fetchall()

            print("\ntasks 表当前结构:")
            print("-" * 50)
            print(f"{'序号':<6} {'字段名':<20} {'类型':<15}")
            print("-" * 50)
            for col in columns:
                print(f"{col[0]:<6} {col[1]:<20} {col[2]:<15}")
            print("-" * 50)

        except Exception as e:
            print(f"检查表结构时出错: {e}")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "check":
        check_table_structure()
    else:
        migrate()
        check_table_structure()