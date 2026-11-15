import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app
from ..models import User

def generate_token(user_id: int) -> str:
    """Generate a signed JWT token valid for the configured duration."""
    expiration_hours = current_app.config.get('JWT_EXPIRATION_HOURS', 24)
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=expiration_hours),
        'iat': datetime.utcnow()
    }
    secret_key = current_app.config['SECRET_KEY']
    return jwt.encode(payload, secret_key, algorithm='HS256')

def decode_token(token: str):
    """Decode and verify JWT token."""
    try:
        secret_key = current_app.config['SECRET_KEY']
        payload = jwt.decode(token, secret_key, algorithms=['HS256'])
        return payload, None
    except jwt.ExpiredSignatureError:
        return None, 'Token has expired. Please log in again.'
    except (jwt.InvalidTokenError, Exception) as e:
        return None, 'Invalid authorization token.'

def token_required(f):
    """Decorator to enforce JWT authentication on protected routes."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({
                'success': False,
                'message': 'Authorization header is missing. Access denied.'
            }), 401

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({
                'success': False,
                'message': 'Invalid token format. Bearer token expected.'
            }), 401

        token = parts[1]
        payload, error = decode_token(token)
        if error:
            return jsonify({'success': False, 'message': error}), 401

        current_user = User.query.get(payload.get('user_id'))
        if not current_user:
            return jsonify({'success': False, 'message': 'User not found or account removed.'}), 401

        return f(current_user, *args, **kwargs)

    return decorated
