from flask import Blueprint, request, jsonify, current_app
from ..models import db, User, ContentHistory
from ..services.ai_service import ai_service
from ..utils.auth import decode_token
from ..utils.validators import count_words, sanitize_input

ai_bp = Blueprint('ai', __name__, url_prefix='/api')

def get_current_user_from_header():
    """Extract authenticated user if Authorization header is present."""
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None
    parts = auth_header.split()
    if len(parts) == 2 and parts[0].lower() == 'bearer':
        payload, _ = decode_token(parts[1])
        if payload and 'user_id' in payload:
            return User.query.get(payload['user_id'])
    return None

def save_history_record(user_id: int, title: str, input_text: str, output_text: str,
                        op_type: str, word_cnt: int):
    """Utility to persist an operation record to ContentHistory."""
    if not user_id:
        return None
    try:
        record = ContentHistory(
            user_id=user_id,
            title=title[:180] or f"Untitled {op_type.capitalize()}",
            input_text=input_text,
            output_text=output_text,
            operation_type=op_type,
            word_count=word_cnt
        )
        db.session.add(record)
        db.session.commit()
        return record.to_dict()
    except Exception as e:
        db.session.rollback()
        return None

# ------------------------------------------------------------------
# 1. Content Generator Endpoint
# ------------------------------------------------------------------
@ai_bp.route('/generate', methods=['POST'])
def generate():
    """Generate content from topic and configuration."""
    data = request.get_json() or {}
    topic = sanitize_input(data.get('topic', ''))
    content_type = sanitize_input(data.get('content_type', 'Article'))
    tone = sanitize_input(data.get('tone', 'Professional'))
    length = sanitize_input(data.get('length', 'Medium'))
    language = sanitize_input(data.get('language', 'English'))
    instructions = sanitize_input(data.get('instructions', ''))
    save_to_db = data.get('save_to_history', True)

    if not topic:
        return jsonify({'success': False, 'message': 'Content topic or prompt is required.'}), 400

    result = ai_service.generate_content(
        topic=topic,
        content_type=content_type,
        tone=tone,
        length=length,
        language=language,
        instructions=instructions
    )

    user = get_current_user_from_header()
    history_record = None
    if user and save_to_db:
        title = f"{content_type}: {topic[:50]}"
        history_record = save_history_record(
            user_id=user.id,
            title=title,
            input_text=f"Topic: {topic}\nType: {content_type}\nTone: {tone}\nLength: {length}\nLanguage: {language}",
            output_text=result['content'],
            op_type='generate',
            word_cnt=result['word_count']
        )

    return jsonify({
        'success': True,
        'data': result,
        'history_record': history_record
    }), 200

# ------------------------------------------------------------------
# 2. Text Transformation Endpoint
# ------------------------------------------------------------------
@ai_bp.route('/transform', methods=['POST'])
def transform():
    """Apply textual transformation (Rewrite, Expand, Bullets, etc.)."""
    data = request.get_json() or {}
    text = sanitize_input(data.get('text', ''))
    transformation_type = sanitize_input(data.get('transformation_type', 'Rewrite Text'))
    save_to_db = data.get('save_to_history', True)

    if not text:
        return jsonify({'success': False, 'message': 'Input text is required for transformation.'}), 400

    result = ai_service.transform_text(
        text=text,
        transformation_type=transformation_type
    )

    user = get_current_user_from_header()
    history_record = None
    if user and save_to_db:
        title = f"{transformation_type}: {text[:40]}..."
        history_record = save_history_record(
            user_id=user.id,
            title=title,
            input_text=text,
            output_text=result['transformed_text'],
            op_type='transform',
            word_cnt=result['transformed_word_count']
        )

    return jsonify({
        'success': True,
        'data': result,
        'history_record': history_record
    }), 200

# ------------------------------------------------------------------
# 3. Summarization Endpoint
# ------------------------------------------------------------------
@ai_bp.route('/summarize', methods=['POST'])
def summarize():
    """Summarize lengthy documents and compute compression metrics."""
    data = request.get_json() or {}
    text = sanitize_input(data.get('text', ''))
    summary_type = sanitize_input(data.get('summary_type', 'Medium Summary'))
    save_to_db = data.get('save_to_history', True)

    if not text:
        return jsonify({'success': False, 'message': 'Document text is required to summarize.'}), 400

    result = ai_service.summarize_text(
        text=text,
        summary_type=summary_type
    )

    user = get_current_user_from_header()
    history_record = None
    if user and save_to_db:
        title = f"Summary ({summary_type}): {text[:40]}..."
        history_record = save_history_record(
            user_id=user.id,
            title=title,
            input_text=text,
            output_text=result['summary'],
            op_type='summarize',
            word_cnt=result['summary_word_count']
        )

    return jsonify({
        'success': True,
        'data': result,
        'history_record': history_record
    }), 200

# ------------------------------------------------------------------
# 4. Grammar Checker Endpoint
# ------------------------------------------------------------------
@ai_bp.route('/grammar-check', methods=['POST'])
def grammar_check():
    """Detect grammar, spelling, punctuation, and readability structure."""
    data = request.get_json() or {}
    text = sanitize_input(data.get('text', ''))
    save_to_db = data.get('save_to_history', True)

    if not text:
        return jsonify({'success': False, 'message': 'Text is required for grammar analysis.'}), 400

    result = ai_service.check_grammar(text=text)

    user = get_current_user_from_header()
    history_record = None
    if user and save_to_db:
        title = f"Grammar Check: {text[:40]}..."
        history_record = save_history_record(
            user_id=user.id,
            title=title,
            input_text=text,
            output_text=result['corrected_text'],
            op_type='grammar',
            word_cnt=count_words(result['corrected_text'])
        )

    return jsonify({
        'success': True,
        'data': result,
        'history_record': history_record
    }), 200

# ------------------------------------------------------------------
# 5. Tone Changer Endpoint
# ------------------------------------------------------------------
@ai_bp.route('/change-tone', methods=['POST'])
def change_tone():
    """Shift tone of text (Professional, Academic, Friendly, etc.)."""
    data = request.get_json() or {}
    text = sanitize_input(data.get('text', ''))
    target_tone = sanitize_input(data.get('target_tone', 'Professional'))
    save_to_db = data.get('save_to_history', True)

    if not text:
        return jsonify({'success': False, 'message': 'Text is required for tone transformation.'}), 400

    result = ai_service.change_tone(text=text, target_tone=target_tone)

    user = get_current_user_from_header()
    history_record = None
    if user and save_to_db:
        title = f"Tone ({target_tone}): {text[:40]}..."
        history_record = save_history_record(
            user_id=user.id,
            title=title,
            input_text=text,
            output_text=result['transformed_text'],
            op_type='tone',
            word_cnt=result['transformed_word_count']
        )

    return jsonify({
        'success': True,
        'data': result,
        'history_record': history_record
    }), 200
