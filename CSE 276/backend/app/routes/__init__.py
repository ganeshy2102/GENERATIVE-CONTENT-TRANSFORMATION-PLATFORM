from .auth import auth_bp
from .ai_tools import ai_bp
from .history import history_bp
from .settings import settings_bp
from .stats import stats_bp

__all__ = ['auth_bp', 'ai_bp', 'history_bp', 'settings_bp', 'stats_bp']
