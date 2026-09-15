from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    database_url: str = "sqlite:///./journal_integrity.db"
    redis_url: str | None = None
    app_env: str = "development"
    crossref_mailto: str | None = None
    crossref_user_agent: str = "journal-integrity-mvp/0.1"
    scopus_api_key: str | None = None
    scopus_source_list_path: str | None = None
    doaj_dataset_path: str | None = None
    crawl_max_pages: int = 8
    crawl_max_depth: int = 2
    crawl_timeout_seconds: float = 8
    crawl_max_response_bytes: int = 1_500_000
    cors_origins: str = "http://localhost:3100,http://127.0.0.1:3100"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
