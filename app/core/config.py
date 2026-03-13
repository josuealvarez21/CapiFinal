from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Cápi - Finanzas Personales"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "supersecretkey_change_in_production_12345"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # MYSQL DATABASE URL para XAMPP
    # Por defecto en XAMPP: usuario 'root' y sin contraseña
    DATABASE_URL: str = "mysql+pymysql://root:@localhost:3306/capi_db"

    class Config:
        env_file = ".env"

settings = Settings()
