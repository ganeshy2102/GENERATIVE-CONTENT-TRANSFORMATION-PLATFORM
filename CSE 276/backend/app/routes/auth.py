from flask import Blueprint, request, jsonify
from ..models import db, User, UserSettings, ContentHistory
from ..utils.auth import generate_token, token_required
from ..utils.validators import is_valid_email, validate_password_strength, sanitize_input

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user account."""
    data = request.get_json() or {}
    full_name = sanitize_input(data.get('full_name', ''))
    email = sanitize_input(data.get('email', '')).lower()
    password = data.get('password', '')
    confirm_password = data.get('confirm_password', '')

    # Validations
    if not full_name:
        return jsonify({'success': False, 'message': 'Full name is required.'}), 400

    if not is_valid_email(email):
        return jsonify({'success': False, 'message': 'Please enter a valid email address.'}), 400

    is_strong, msg = validate_password_strength(password)
    if not is_strong:
        return jsonify({'success': False, 'message': msg}), 400

    if password != confirm_password:
        return jsonify({'success': False, 'message': 'Passwords do not match.'}), 400

    # Duplicate check
    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'message': 'An account with this email already exists.'}), 409

    try:
        new_user = User(full_name=full_name, email=email)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.flush()

        # Initialize default user settings
        default_settings = UserSettings(
            user_id=new_user.id,
            preferred_language='English',
            preferred_tone='Professional',
            theme='dark'
        )
        db.session.add(default_settings)
        db.session.commit()

        token = generate_token(new_user.id)
        return jsonify({
            'success': True,
            'message': 'Account registered successfully!',
            'token': token,
            'user': new_user.to_dict(),
            'settings': default_settings.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Server error: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate existing user and issue token."""
    data = request.get_json() or {}
    email = sanitize_input(data.get('email', '')).lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required.'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'success': False, 'message': 'Invalid email address or password.'}), 401

    token = generate_token(user.id)
    settings = UserSettings.query.filter_by(user_id=user.id).first()
    settings_dict = settings.to_dict() if settings else {
        'preferred_language': 'English',
        'preferred_tone': 'Professional',
        'theme': 'dark'
    }

    return jsonify({
        'success': True,
        'message': 'Login successful!',
        'token': token,
        'user': user.to_dict(),
        'settings': settings_dict
    }), 200

@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout(current_user):
    """Graceful logout endpoint."""
    return jsonify({
        'success': True,
        'message': 'Logged out successfully.'
    }), 200

@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    """Retrieve user profile with aggregate statistics."""
    total_generated = ContentHistory.query.filter_by(user_id=current_user.id).count()
    total_words = db.session.query(db.func.sum(ContentHistory.word_count))\
        .filter(ContentHistory.user_id == current_user.id).scalar() or 0
    total_transforms = ContentHistory.query.filter(
        ContentHistory.user_id == current_user.id,
        ContentHistory.operation_type != 'generate'
    ).count()

    profile_data = current_user.to_dict()
    profile_data.update({
        'total_generated_content': total_generated,
        'total_words_processed': total_words,
        'total_transformations': total_transforms
    })

    return jsonify({
        'success': True,
        'user': profile_data
    }), 200

@auth_bp.route('/update-profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """Update profile full name."""
    data = request.get_json() or {}
    full_name = sanitize_input(data.get('full_name', ''))

    if not full_name:
        return jsonify({'success': False, 'message': 'Name cannot be blank.'}), 400

    try:
        current_user.full_name = full_name
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully.',
            'user': current_user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Update failed: {str(e)}'}), 500

@auth_bp.route('/change-password', methods=['PUT'])
@token_required
def change_password(current_user):
    """Change user password securely."""
    data = request.get_json() or {}
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')
    confirm_password = data.get('confirm_password', '')

    if not current_user.check_password(current_password):
        return jsonify({'success': False, 'message': 'Current password is incorrect.'}), 400

    is_strong, msg = validate_password_strength(new_password)
    if not is_strong:
        return jsonify({'success': False, 'message': msg}), 400

    if new_password != confirm_password:
        return jsonify({'success': False, 'message': 'New passwords do not match.'}), 400

    try:
        current_user.set_password(new_password)
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Password changed successfully.'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Error changing password: {str(e)}'}), 500
