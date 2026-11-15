from flask import Blueprint, request, jsonify
from ..models import db, UserSettings
from ..utils.auth import token_required
from ..utils.validators import sanitize_input

settings_bp = Blueprint('settings', __name__, url_prefix='/api/settings')

@settings_bp.route('', methods=['GET'])
@token_required
def get_settings(current_user):
    """Fetch preferences for authenticated user."""
    settings = UserSettings.query.filter_by(user_id=current_user.id).first()
    if not settings:
        settings = UserSettings(
            user_id=current_user.id,
            preferred_language='English',
            preferred_tone='Professional',
            theme='dark'
        )
        db.session.add(settings)
        db.session.commit()

    return jsonify({
        'success': True,
        'settings': settings.to_dict()
    }), 200

@settings_bp.route('', methods=['PUT'])
@token_required
def update_settings(current_user):
    """Update user preferences."""
    data = request.get_json() or {}
    pref_lang = sanitize_input(data.get('preferred_language', 'English'))
    pref_tone = sanitize_input(data.get('preferred_tone', 'Professional'))
    theme = sanitize_input(data.get('theme', 'dark')).lower()

    if theme not in ['dark', 'light']:
        theme = 'dark'

    settings = UserSettings.query.filter_by(user_id=current_user.id).first()
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.session.add(settings)

    try:
        settings.preferred_language = pref_lang
        settings.preferred_tone = pref_tone
        settings.theme = theme
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Preferences saved successfully.',
            'settings': settings.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Failed to save settings: {str(e)}'}), 500
