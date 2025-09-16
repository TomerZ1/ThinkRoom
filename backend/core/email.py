from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from core.config import settings
from pydantic import EmailStr

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=True
)

fm = FastMail(conf)

async def send_reset_email(email: EmailStr, token: str):
    reset_link = f"http://localhost:3000/reset-password?token={token}"
    message = MessageSchema(
        subject="ThinkRoom Password Reset",
        recipients=[email],
        body=f"Click the following link to reset your password: {reset_link}",
        subtype="plain"
    )
    await fm.send_message(message)