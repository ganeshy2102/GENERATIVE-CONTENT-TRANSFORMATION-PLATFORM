from . import db

class UserSettings(db.Model):
    __tablename__ = 'user_settings'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False, index=True)
    preferred_language = db.Column(db.String(30), default='English', nullable=False)
    preferred_tone = db.Column(db.String(30), default='Professional', nullable=False)
    theme = db.Column(db.String(20), default='dark', nullable=False)

    def to_dict(self):
        """Serialize settings to JSON-safe dictionary."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'preferred_language': self.preferred_language,
            'preferred_tone': self.preferred_tone,
            'theme': self.theme
        }

    def __repr__(self):
        return f'<UserSettings user_id={self.user_id}>'
