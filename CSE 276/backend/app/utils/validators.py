import re

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')

def is_valid_email(email: str) -> bool:
    """Validate email format."""
    if not email or not isinstance(email, str):
        return False
    return bool(EMAIL_REGEX.match(email.strip()))

def validate_password_strength(password: str):
    """
    Validate password requirements:
    - Minimum 6 characters
    """
    if not password or len(password) < 6:
        return False, "Password must be at least 6 characters long."
    return True, ""

def count_words(text: str) -> int:
    """Accurately count words in a string."""
    if not text or not isinstance(text, str):
        return 0
    return len(text.strip().split())

def sanitize_input(text: str, max_length: int = 50000) -> str:
    """Trim and safely cap long string input."""
    if not text or not isinstance(text, str):
        return ""
    cleaned = text.strip()
    return cleaned[:max_length]
