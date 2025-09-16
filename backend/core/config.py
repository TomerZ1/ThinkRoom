from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import field_validator, EmailStr

class Settings(BaseSettings):
    API_PREFIX: str = "/api"
    DEBUG: bool = False

    # Database and cache
    DB_URL: str
    REDIS_URL: Optional[str] = None

    # Object storage (MinIO / S3)
    S3_ENDPOINT: Optional[str] = None
    S3_REGION: str = "us-east-1"
    S3_ACCESS_KEY: Optional[str] = None
    S3_SECRET_KEY: Optional[str] = None
    S3_BUCKET: Optional[str] = None

    # Auth / security
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 6  # 6

    # CORS
    ALLOWED_ORIGINS: str = ""

    # Email settings
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: EmailStr
    MAIL_PORT: int
    MAIL_SERVER: str
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False

    @field_validator("ALLOWED_ORIGINS")
    def parse_allowed_origins(cls, v: str) -> List[str]:
        return v.split(",") if v else []

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = Settings()