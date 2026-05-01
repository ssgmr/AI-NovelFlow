"""
迁移脚本：为 system_configs 表添加 system_status_source 字段
运行: cd backend && python migrations/add_system_status_source_to_system_configs.py
"""
import os
import sys

from sqlalchemy import create_engine, text

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

DATABASE_URL = "sqlite:///./novelflow.db"


def migrate():
    engine = create_engine(DATABASE_URL)

    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE system_configs ADD COLUMN system_status_source VARCHAR DEFAULT 'comfyui'"))
            print("✓ Added system_status_source column")
        except Exception as e:
            if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
                print("✓ system_status_source column already exists")
            else:
                print(f"✗ Error adding system_status_source: {e}")
        conn.commit()

    with engine.connect() as conn:
        try:
            result = conn.execute(text(
                "UPDATE system_configs SET system_status_source = 'comfyui' WHERE system_status_source IS NULL OR system_status_source = ''"
            ))
            print(f"✓ Initialized system_status_source for {result.rowcount} records")
        except Exception as e:
            print(f"✗ Error initializing system_status_source: {e}")
        conn.commit()

    print("\n✅ Migration completed!")


if __name__ == "__main__":
    migrate()
