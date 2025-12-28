"""
Email utilities for sending notifications
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from typing import Optional

# Email configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "contact@maraakiz.com"
SENDER_NAME = "Maraakiz"

# Ces variables doivent être configurées dans les variables d'environnement
GMAIL_USER = os.getenv("GMAIL_USER")  # Votre adresse Gmail
GMAIL_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")  # Mot de passe d'application Gmail


def send_student_credentials_email(
    student_email: str,
    student_firstname: str,
    student_lastname: str,
    professor_name: str,
    temp_password: str,
    login_url: str = "http://localhost:5174/login"
) -> bool:
    """
    Send email with student credentials

    Returns True if email sent successfully, False otherwise
    """
    if not GMAIL_USER or not GMAIL_PASSWORD:
        print("⚠️  Gmail credentials not configured. Skipping email send.")
        return False

    try:
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = "Vos identifiants Maraakiz"
        message["From"] = f"{SENDER_NAME} <{SENDER_EMAIL}>"
        message["To"] = student_email

        # Email body
        text_content = f"""
As-salāmu ʿalaykum wa-raḥmatu -llāhi wa-barakātuh,

Cher(e) {student_firstname} {student_lastname},

Votre professeur {professor_name} vous a créé un compte sur
la plateforme d'apprentissage, Maraakiz.

🔐 Vos identifiants de connexion :
Email : {student_email}
Mot de passe temporaire : {temp_password}

👉 Connectez-vous ici : {login_url}

⚠️ Important : Pensez à changer votre mot de passe dès votre première connexion
dans "Paramètres" > "Modifier le mot de passe"

Qu'Allah vous facilite dans votre apprentissage ! 📚

L'équipe Maraakiz
        """

        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background: linear-gradient(135deg, #437C8B 0%, #35626f 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }}
        .content {{
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }}
        .credentials {{
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            border-left: 4px solid #437C8B;
        }}
        .button {{
            display: inline-block;
            padding: 12px 30px;
            background: #437C8B;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }}
        .warning {{
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }}
        .footer {{
            text-align: center;
            color: #666;
            margin-top: 30px;
            font-size: 14px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🕌 Maraakiz</h1>
            <p>Plateforme d'apprentissage islamique</p>
        </div>
        <div class="content">
            <p><strong>As-salāmu ʿalaykum wa-raḥmatu -llāhi wa-barakātuh,</strong></p>

            <p>Cher(e) <strong>{student_firstname} {student_lastname}</strong>,</p>

            <p>Votre professeur <strong>{professor_name}</strong> vous a créé un compte sur la plateforme d'apprentissage <strong>Maraakiz</strong>.</p>

            <div class="credentials">
                <h3>🔐 Vos identifiants de connexion :</h3>
                <p><strong>Email :</strong> {student_email}</p>
                <p><strong>Mot de passe temporaire :</strong> <code>{temp_password}</code></p>
            </div>

            <center>
                <a href="{login_url}" class="button">👉 Se connecter maintenant</a>
            </center>

            <div class="warning">
                <strong>⚠️ Important :</strong> Pensez à changer votre mot de passe dès votre première connexion dans "Paramètres" > "Modifier le mot de passe"
            </div>

            <p>Qu'Allah vous facilite dans votre apprentissage ! 📚</p>

            <div class="footer">
                <p>L'équipe Maraakiz</p>
                <p style="color: #999; font-size: 12px;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
        </div>
    </div>
</body>
</html>
        """

        # Attach both text and HTML versions
        part1 = MIMEText(text_content, "plain", "utf-8")
        part2 = MIMEText(html_content, "html", "utf-8")
        message.attach(part1)
        message.attach(part2)

        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(GMAIL_USER, GMAIL_PASSWORD)
            server.send_message(message)

        print(f"✅ Email sent successfully to {student_email}")
        return True

    except Exception as e:
        print(f"❌ Error sending email: {e}")
        return False


async def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None
) -> bool:
    """
    Generic function to send email with HTML content

    Returns True if email sent successfully, False otherwise
    """
    if not GMAIL_USER or not GMAIL_PASSWORD:
        print("⚠️  Gmail credentials not configured. Skipping email send.")
        return False

    try:
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"{SENDER_NAME} <{SENDER_EMAIL}>"
        message["To"] = to_email

        # Attach text version if provided
        if text_content:
            part1 = MIMEText(text_content, "plain", "utf-8")
            message.attach(part1)

        # Attach HTML version
        part2 = MIMEText(html_content, "html", "utf-8")
        message.attach(part2)

        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(GMAIL_USER, GMAIL_PASSWORD)
            server.send_message(message)

        print(f"✅ Email sent successfully to {to_email}")
        return True

    except Exception as e:
        print(f"❌ Error sending email: {e}")
        return False


def test_email_config() -> bool:
    """
    Test if email configuration is valid
    """
    if not GMAIL_USER or not GMAIL_PASSWORD:
        return False

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(GMAIL_USER, GMAIL_PASSWORD)
        return True
    except Exception as e:
        print(f"Email configuration error: {e}")
        return False
