from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "NovelFlow"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "sqlite:///./novelflow.db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # DeepSeek
    DEEPSEEK_API_URL: str = "https://api.deepseek.com"
    DEEPSEEK_API_KEY: str = ""
    
    # ComfyUI
    COMFYUI_HOST: str = "http://192.168.50.1:8288"
    
    # Output
    OUTPUT_DIR: str = "./output"
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()
