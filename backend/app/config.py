from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    NEWS_API_KEY: str
    ASYNC_DATABASE_URL : str
    CELERY_BROKER_URL : str
    CELERY_RESULT_BACKEND : str
    OPENAI_API_KEY : str

    class Config:
        env_file = ".env"

settings = Settings()