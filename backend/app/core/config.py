from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "Maraakiz API"
    API_PREFIX: str = "/api"

    # Database
    DATABASE_URL: str = "sqlite:///./maraakiz.db"

    # JWT
    SECRET_KEY: str = "CHANGE_ME__PUT_A_LONG_RANDOM_SECRET"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

settings = Settings()
