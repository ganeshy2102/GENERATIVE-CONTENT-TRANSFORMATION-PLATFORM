from datetime import datetime, timedelta
from flask import Blueprint, jsonify
from ..models import db, ContentHistory
from ..utils.auth import token_required

stats_bp = Blueprint('stats', __name__, url_prefix='/api/stats')

@stats_bp.route('', methods=['GET'])
@token_required
def get_user_dashboard_stats(current_user):
    """
    Compute real-time database statistics and activity chart data
    specifically for the authenticated user.
    """
    user_id = current_user.id

    # 1. Total Content Generated
    total_generated = ContentHistory.query.filter_by(user_id=user_id, operation_type='generate').count()

    # 2. Total Words Processed
    total_words = db.session.query(db.func.sum(ContentHistory.word_count))\
        .filter(ContentHistory.user_id == user_id).scalar() or 0

    # 3. Total Documents Summarized
    total_summarized = ContentHistory.query.filter_by(user_id=user_id, operation_type='summarize').count()

    # Total Transformations (Transform, Tone, Grammar)
    total_transformations = ContentHistory.query.filter(
        ContentHistory.user_id == user_id,
        ContentHistory.operation_type.in_(['transform', 'grammar', 'tone'])
    ).count()

    # Total all activities
    total_activities = ContentHistory.query.filter_by(user_id=user_id).count()

    # 4. Recent Activities (limit 6)
    recent_records = ContentHistory.query.filter_by(user_id=user_id)\
        .order_by(ContentHistory.created_at.desc())\
        .limit(6)\
        .all()

    # 5. Activity Over Time (Past 7 Days Time-Series for Chart)
    today = datetime.utcnow().date()
    days = [(today - timedelta(days=i)) for i in range(6, -1, -1)]
    activity_timeline = []

    for day in days:
        day_start = datetime.combine(day, datetime.min.time())
        day_end = datetime.combine(day, datetime.max.time())

        count = ContentHistory.query.filter(
            ContentHistory.user_id == user_id,
            ContentHistory.created_at >= day_start,
            ContentHistory.created_at <= day_end
        ).count()

        words = db.session.query(db.func.sum(ContentHistory.word_count))\
            .filter(
                ContentHistory.user_id == user_id,
                ContentHistory.created_at >= day_start,
                ContentHistory.created_at <= day_end
            ).scalar() or 0

        activity_timeline.append({
            'date': day.strftime('%b %d'),
            'operations': count,
            'words': words
        })

    # Breakdown by operation type
    operations_breakdown = {
        'generate': ContentHistory.query.filter_by(user_id=user_id, operation_type='generate').count(),
        'transform': ContentHistory.query.filter_by(user_id=user_id, operation_type='transform').count(),
        'summarize': ContentHistory.query.filter_by(user_id=user_id, operation_type='summarize').count(),
        'grammar': ContentHistory.query.filter_by(user_id=user_id, operation_type='grammar').count(),
        'tone': ContentHistory.query.filter_by(user_id=user_id, operation_type='tone').count()
    }

    return jsonify({
        'success': True,
        'statistics': {
            'total_generated': total_generated,
            'total_words_processed': total_words,
            'total_summarized': total_summarized,
            'total_transformations': total_transformations,
            'total_activities': total_activities
        },
        'recent_activities': [record.to_dict() for record in recent_records],
        'activity_timeline': activity_timeline,
        'breakdown': operations_breakdown
    }), 200
