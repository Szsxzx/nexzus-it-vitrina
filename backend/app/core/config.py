"""Configuración global cargada desde variables de entorno (.env)."""
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "NEXZUS IT SERVICE API"
    ENV: str = "development"
    DEBUG: bool = True

    DATABASE_URL: str = "postgresql+psycopg2://vitrina:vitrina@db:5432/vitrina"

    JWT_SECRET: str = "change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    CORS_ORIGINS: str = "http://localhost:3000"

    FIRST_ADMIN_EMAIL: str = "admin@nexzusit.com"
    FIRST_ADMIN_USERNAME: str = "admin"
    FIRST_ADMIN_PASSWORD: str = "Admin123!"

    # URL pública del frontend: Wompi redirige a {PUBLIC_SITE_URL}/checkout/resultado
    PUBLIC_SITE_URL: str = "http://localhost:3000"

    # Pasarela Wompi. Sin WOMPI_PUBLIC_KEY + WOMPI_INTEGRITY_SECRET el checkout
    # responde 503; sin WOMPI_EVENTS_SECRET el webhook responde 503.
    WOMPI_ENV: str = "sandbox"  # sandbox | production
    WOMPI_PUBLIC_KEY: str = ""
    WOMPI_PRIVATE_KEY: str = ""
    WOMPI_INTEGRITY_SECRET: str = ""
    WOMPI_EVENTS_SECRET: str = ""

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def wompi_api_base(self) -> str:
        if self.WOMPI_ENV.strip().lower() == "production":
            return "https://production.wompi.co/v1"
        return "https://sandbox.wompi.co/v1"

    @property
    def wompi_checkout_enabled(self) -> bool:
        return bool(self.WOMPI_PUBLIC_KEY.strip() and self.WOMPI_INTEGRITY_SECRET.strip())


settings = Settings()
