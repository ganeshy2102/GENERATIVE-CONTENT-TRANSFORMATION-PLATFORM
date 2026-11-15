from flask import Flask, jsonify
from flask_cors import CORS
from .models import db
from .routes import auth_bp, ai_bp, history_bp, settings_bp, stats_bp
from ..config import Config

def create_app(config_class=Config):
    """Application factory for GCTP Flask backend."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize CORS
    CORS(app, resources={r"/api/*": {"origins": app.config.get('CORS_ORIGINS', '*')}},
         supports_credentials=True)

    # Initialize SQLAlchemy
    db.init_app(app)

    # Register API Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(history_bp)
    app.register_blueprint(settings_bp)
    app.register_blueprint(stats_bp)

    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'platform': 'Generative Content Transformation Platform (GCTP)',
            'ai_provider': app.config.get('AI_PROVIDER', 'demo'),
            'version': '1.0.0'
        }), 200

    # Custom Error Handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'success': False, 'message': 'Bad Request: ' + str(error)}), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'success': False, 'message': 'Resource not found.'}), 404

    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify({'success': False, 'message': 'Internal Server Error. Please try again later.'}), 500

    # Create SQLite database tables if not exist
    with app.app_context():
        db.create_all()

    return app
