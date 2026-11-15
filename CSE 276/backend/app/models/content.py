from datetime import datetime
from . import db

class ContentHistory(db.Model):
    __tablename__ = 'content_history'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    input_text = db.Column(db.Text, nullable=False)
    output_text = db.Column(db.Text, nullable=False)
    operation_type = db.Column(db.String(50), nullable=False)  # 'generate', 'transform', 'summarize', 'grammar', 'tone'
    word_count = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)

    def to_dict(self):
        """Serialize content history record to JSON-safe dictionary."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'input_text': self.input_text,
            'output_text': self.output_text,
            'operation_type': self.operation_type,
            'word_count': self.word_count,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f'<ContentHistory {self.id}:{self.operation_type}>'
