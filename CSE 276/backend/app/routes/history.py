from flask import Blueprint, request, jsonify
from ..models import db, ContentHistory
from ..utils.auth import token_required
from ..utils.validators import sanitize_input

history_bp = Blueprint('history', __name__, url_prefix='/api/history')

@history_bp.route('', methods=['GET'])
@token_required
def get_user_history(current_user):
    """
    Get user content history with search, filtering, and sorting.
    Strictly scoped to the authenticated user.
    """
    search_query = request.args.get('search', '').strip()
    operation_filter = request.args.get('operation_type', '').strip().lower()
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 50))

    query = ContentHistory.query.filter_by(user_id=current_user.id)

    # Search filter
    if search_query:
        like_pattern = f"%{search_query}%"
        query = query.filter(
            (ContentHistory.title.ilike(like_pattern)) |
            (ContentHistory.input_text.ilike(like_pattern)) |
            (ContentHistory.output_text.ilike(like_pattern))
        )

    # Operation type filter
    if operation_filter and operation_filter != 'all':
        query = query.filter(ContentHistory.operation_type == operation_filter)

    # Order newest first
    query = query.order_by(ContentHistory.created_at.desc())

    total_count = query.count()
    paginated_items = query.paginate(page=page, per_page=limit, error_out=False)

    return jsonify({
        'success': True,
        'total': total_count,
        'page': page,
        'limit': limit,
        'history': [item.to_dict() for item in paginated_items.items]
    }), 200

@history_bp.route('/<int:record_id>', methods=['GET'])
@token_required
def get_history_detail(current_user, record_id):
    """Retrieve full details of a specific history item."""
    record = ContentHistory.query.filter_by(id=record_id, user_id=current_user.id).first()
    if not record:
        return jsonify({'success': False, 'message': 'History entry not found.'}), 404

    return jsonify({
        'success': True,
        'record': record.to_dict()
    }), 200

@history_bp.route('/<int:record_id>', methods=['DELETE'])
@token_required
def delete_history_item(current_user, record_id):
    """Delete a specific history record owned by the user."""
    record = ContentHistory.query.filter_by(id=record_id, user_id=current_user.id).first()
    if not record:
        return jsonify({'success': False, 'message': 'History entry not found or unauthorized.'}), 404

    try:
        db.session.delete(record)
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Record deleted successfully.'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Failed to delete: {str(e)}'}), 500

@history_bp.route('/clear', methods=['DELETE'])
@token_required
def clear_all_history(current_user):
    """Clear all history items belonging to the authenticated user."""
    try:
        deleted_count = ContentHistory.query.filter_by(user_id=current_user.id).delete()
        db.session.commit()
        return jsonify({
            'success': True,
            'message': f'Cleared {deleted_count} history records successfully.'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Clear operation failed: {str(e)}'}), 500
