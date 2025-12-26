"""
Password generation utilities
"""
import secrets
import string


def generate_temp_password(length: int = 12) -> str:
    """
    Generate a secure temporary password

    Format: Mix of uppercase, lowercase, digits and special characters
    Example: Eleve2024@Abc
    """
    # Ensure we have at least one of each type
    password = [
        secrets.choice(string.ascii_uppercase),  # At least one uppercase
        secrets.choice(string.ascii_lowercase),  # At least one lowercase
        secrets.choice(string.digits),           # At least one digit
        secrets.choice("!@#$%&*")                # At least one special char
    ]

    # Fill the rest with random characters
    all_chars = string.ascii_letters + string.digits + "!@#$%&*"
    password += [secrets.choice(all_chars) for _ in range(length - 4)]

    # Shuffle to avoid predictable pattern
    password_list = list(password)
    secrets.SystemRandom().shuffle(password_list)

    return ''.join(password_list)


def generate_simple_temp_password() -> str:
    """
    Generate a simple but secure temporary password
    Format: Eleve2024 + 3 random characters
    Example: Eleve2024AbC
    """
    from datetime import datetime
    year = datetime.now().year

    random_part = ''.join([
        secrets.choice(string.ascii_uppercase),
        secrets.choice(string.ascii_lowercase),
        secrets.choice(string.ascii_uppercase)
    ])

    return f"Eleve{year}{random_part}"
