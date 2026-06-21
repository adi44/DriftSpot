from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    OPENAI_API_KEY: str
    GOOGLE_PLACES_API_KEY: str
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    ALLOWED_ORIGINS: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()