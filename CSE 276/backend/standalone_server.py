#!/usr/bin/env python3
"""
Generative Content Transformation Platform (GCTP)
Standalone Zero-Dependency HTTP/REST Server.
Runs using Python 3 standard library (sqlite3, json, hashlib, http.server, wsgiref).
Provides identical REST API endpoints to the Flask app, allowing immediate execution
and testing on any machine without waiting for external pip packages.
"""

import os
import re
import json
import sqlite3
import hashlib
import hmac
import time
from datetime import datetime, timedelta
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

DB_PATH = os.path.join(os.path.dirname(__file__), 'gctp.db')
SECRET_KEY = os.getenv('SECRET_KEY', 'gctp_college_major_project_secret_key_default')

# ------------------------------------------------------------------
# 1. Database Initialization
# ------------------------------------------------------------------
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS content_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            input_text TEXT NOT NULL,
            output_text TEXT NOT NULL,
            operation_type TEXT NOT NULL,
            word_count INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            preferred_language TEXT NOT NULL DEFAULT 'English',
            preferred_tone TEXT NOT NULL DEFAULT 'Professional',
            theme TEXT NOT NULL DEFAULT 'dark',
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ''')
    conn.commit()
    conn.close()

# ------------------------------------------------------------------
# 2. Cryptographic Security & Simple JWT
# ------------------------------------------------------------------
def hash_password(password: str) -> str:
    salt = os.urandom(16).hex()
    hashed = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()
    return f"{salt}:{hashed}"

def verify_password(stored: str, password: str) -> bool:
    if not stored or ':' not in stored:
        return False
    salt, hashed = stored.split(':', 1)
    computed = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()
    return hmac.compare_digest(hashed, computed)

def create_token(user_id: int) -> str:
    payload = {
        'user_id': user_id,
        'exp': int(time.time()) + 86400  # 24 hours
    }
    payload_str = json.dumps(payload, separators=(',', ':'))
    signature = hmac.new(SECRET_KEY.encode('utf-8'), payload_str.encode('utf-8'), hashlib.sha256).hexdigest()
    # Hex encoded payload + signature
    return f"{payload_str.encode('utf-8').hex()}.{signature}"

def verify_token(token: str):
    if not token or '.' not in token:
        return None
    try:
        payload_hex, signature = token.split('.', 1)
        payload_str = bytes.fromhex(payload_hex).decode('utf-8')
        expected_sig = hmac.new(SECRET_KEY.encode('utf-8'), payload_str.encode('utf-8'), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(signature, expected_sig):
            return None
        payload = json.loads(payload_str)
        if payload.get('exp', 0) < time.time():
            return None
        return payload
    except Exception:
        return None

# ------------------------------------------------------------------
# 3. Content Transformation Logic
# ------------------------------------------------------------------
def count_words(text: str) -> int:
    return len(text.strip().split()) if text else 0

def generate_ai_content(topic, content_type='Article', tone='Professional', length='Medium', language='English', instructions=''):
    clean_topic = topic.strip()
    if language.lower() == 'hindi':
        content = (
            f"# {clean_topic} : एक विस्तृत समीक्षा ({content_type})\n\n"
            f"**शैली:** {tone} | **प्रारूप:** {content_type}\n\n"
            f"## भूमिका\n"
            f"समकालीन परिवेश में {clean_topic} अत्यंत महत्वपूर्ण भूमिका निभाता है। "
            f"यह नवाचार और विकास के नए आयाम प्रस्तुत करता है।\n\n"
            f"## मुख्य निष्कर्ष\n"
            f"- **रणनीतिक महत्व:** सही दिशा में उठाया गया कदम दीर्घकालिक सफलता सुनिश्चित करता है।\n"
            f"- **सकारात्मक प्रभाव:** यह दक्षता और ज्ञान के विस्तार में सहायक है।\n\n"
            f"## निष्कर्ष\n"
            f"संक्षेप में, {clean_topic} भविष्य के निर्माण में एक महत्वपूर्ण आधारशिला है।"
        )
    elif language.lower() == 'punjabi':
        content = (
            f"# {clean_topic} : ਵਿਸ਼ਲੇਸ਼ਣ ਅਤੇ ਦ੍ਰਿਸ਼ਟੀਕੋਣ ({content_type})\n\n"
            f"**ਲਹਿਜਾ:** {tone} | **ਕਿਸਮ:** {content_type}\n\n"
            f"## ਜਾਣ-ਪਛਾਣ\n"
            f"ਅਜੋਕੇ ਦੌਰ ਵਿੱਚ, {clean_topic} ਇੱਕ ਬਹੁਤ ਹੀ ਅਹਿਮ ਅਤੇ ਗੰਭੀਰ ਵਿਸ਼ਾ ਬਣ ਕੇ ਉੱਭਰਿਆ ਹੈ।\n\n"
            f"## ਮੁੱਖ ਨੁਕਤੇ\n"
            f"- {clean_topic} ਨਵੇਂ ਮੌਕੇ ਅਤੇ ਦਿਸ਼ਾਵਾਂ ਪ੍ਰਦਾਨ ਕਰਦਾ ਹੈ।\n"
            f"- ਸਹੀ ਢੰਗ ਨਾਲ ਲਾਗੂ ਕਰਨ 'ਤੇ ਇਹ ਬੇਮਿਸਾਲ ਨਤੀਜੇ ਦੇ ਸਕਦਾ ਹੈ।\n\n"
            f"## ਸਿੱਟਾ\n"
            f"ਅੰਤ ਵਿੱਚ, ਇਹ ਸਾਨੂੰ ਨਵੀਂ ਸੋਚ ਅਤੇ ਖੋਜ ਵੱਲ ਪ੍ਰੇਰਿਤ ਕਰਦਾ ਹੈ।"
        )
    else:
        content = (
            f"# {clean_topic.title()}\n\n"
            f"*Tone: {tone} | Format: {content_type} | Length: {length}*\n\n"
            f"## Executive Summary\n"
            f"In an evolving digital landscape, {clean_topic} serves as a pivotal subject of inquiry and strategic focus. "
            f"Understanding its core dynamics enables practitioners to optimize workflows and drive meaningful results.\n\n"
            f"## Core Analysis and Strategic Pillars\n"
            f"1. **Foundational Consistency:** Establishing structured principles around {clean_topic} minimizes friction.\n"
            f"2. **Operational Efficiency:** Teams leveraging structured methodologies report enhanced productivity.\n"
            f"3. **Long-Term Scalability:** Clear standards ensure qualitative integrity across complex environments.\n\n"
            f"## Conclusion\n"
            f"Mastering {clean_topic} equips organizations and scholars with the insights needed to navigate complexity and achieve sustainable growth."
        )
    return {
        'content': content,
        'word_count': count_words(content),
        'is_demo': True,
        'provider': 'College Demo Engine'
    }

def transform_ai_text(text, op_type='Rewrite Text'):
    op = op_type.lower()
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]
    if not sentences:
        sentences = [text]

    if 'bullet' in op:
        transformed = "\n".join([f"• **Point {i}:** {s.rstrip('.')}." for i, s in enumerate(sentences, 1)])
    elif 'paragraph' in op:
        transformed = " ".join([re.sub(r'^[•\-\*\d\.\s]+', '', line).strip() for line in text.split('\n') if line.strip()])
    elif 'simplify' in op:
        transformed = text.replace('utilize', 'use').replace('facilitate', 'help').replace('subsequently', 'then')
    elif 'expand' in op:
        transformed = f"{text.rstrip('.')}. Furthermore, this premise establishes an empirical foundation that enhances operational velocity and ensures rigorous qualitative standards."
    elif 'shorten' in op:
        transformed = " ".join(sentences[:max(1, len(sentences)//2 + 1)])
    elif 'professional' in op:
        transformed = f"Upon thorough evaluation, it is observed that {text.lower().rstrip('.')}. Implementing these recommendations will ensure structured alignment with key operational goals."
    elif 'academic' in op:
        transformed = f"Empirical evidence demonstrates that {text.lower().rstrip('.')}. Consequently, this provides a defensible theoretical framework for sustained inquiry."
    else:
        transformed = f"In other words, {text.rstrip('.')}. Re-evaluating this statement underscores its core significance for the reader."

    return {
        'transformed_text': transformed,
        'original_word_count': count_words(text),
        'transformed_word_count': count_words(transformed),
        'transformation_type': op_type,
        'is_demo': True
    }

def summarize_ai_text(text, summary_type='Medium Summary'):
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]
    if not sentences:
        sentences = [text]

    summary = " ".join(sentences[:min(2, len(sentences))])
    orig_w = count_words(text)
    sum_w = count_words(summary)
    compression = round(((orig_w - sum_w) / max(1, orig_w)) * 100, 1)

    words = re.findall(r'\b[A-Za-z]{4,}\b', text)
    stop = {'that', 'with', 'this', 'have', 'from', 'which', 'will', 'there'}
    keywords = list(dict.fromkeys([w.capitalize() for w in words if w.lower() not in stop]))[:5]

    return {
        'summary': summary,
        'key_points': [
            f"Core focus: {sentences[0][:60]}...",
            "Methodology ensures consistent quality and transparency."
        ],
        'keywords': keywords or ['Content', 'Strategy', 'Optimization'],
        'main_idea': sentences[0] if sentences else 'Document synthesis',
        'conclusion': sentences[-1] if len(sentences) > 1 else 'Key insights highlighted.',
        'original_word_count': orig_w,
        'summary_word_count': sum_w,
        'compression_percentage': max(0.0, compression),
        'is_demo': True
    }

def grammar_check_ai(text):
    corrected = text.replace('teh', 'the').replace('recieved', 'received').replace('seperate', 'separate')
    corrected = re.sub(r'\bi\b', 'I', corrected)
    if not corrected.endswith('.'):
        corrected += '.'
    corrections = [
        {'original': 'teh', 'suggestion': 'the', 'type': 'Spelling', 'explanation': "Fixed typographical error 'teh' to 'the'."},
        {'original': 'i', 'suggestion': 'I', 'type': 'Punctuation', 'explanation': "Capitalized the first-person singular pronoun 'I'."}
    ]
    return {
        'original_text': text,
        'corrected_text': corrected,
        'corrections': corrections,
        'readability_score_improvement': '+22% Clarity Index',
        'is_demo': True
    }

def change_tone_ai(text, target_tone='Professional'):
    cleaned = text.rstrip('.!?')
    tone_l = target_tone.lower()
    if tone_l == 'professional':
        res = f"I would appreciate your guidance regarding: {cleaned.lower()}. Please let me know your thoughts."
    elif tone_l == 'academic':
        res = f"Empirical inquiry suggests that {cleaned.lower()}, providing a rigorous conceptual baseline."
    elif tone_l == 'friendly':
        res = f"Hey! Just checking in about {cleaned.lower()} - would love to hear what you think! 😊"
    elif tone_l == 'formal':
        res = f"It is respectfully requested that {cleaned.lower()} be considered with due diligence."
    elif tone_l == 'casual':
        res = f"Basically, {cleaned.lower()} - pretty simple when you break it down!"
    elif tone_l == 'persuasive':
        res = f"Now is the ideal time to act on {cleaned.lower()} to unlock undeniable strategic advantage."
    elif tone_l == 'creative':
        res = f"Imagine this: {cleaned.lower()} - a fresh spark redefining the whole journey!"
    else:
        res = f"In simple terms, {cleaned.lower()}."

    return {
        'original_text': text,
        'transformed_text': res,
        'target_tone': target_tone,
        'original_word_count': count_words(text),
        'transformed_word_count': count_words(res),
        'is_demo': True
    }

# ------------------------------------------------------------------
# 4. HTTP Request Handler & REST Dispatcher
# ------------------------------------------------------------------
class GCTPRequestHandler(BaseHTTPRequestHandler):

    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def _send_json(self, data, status_code=200):
        body = json.dumps(data).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def _parse_body(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length > 0:
            raw = self.rfile.read(content_length)
            return json.loads(raw.decode('utf-8'))
        return {}

    def _get_authenticated_user(self):
        auth = self.headers.get('Authorization', '')
        if not auth.startswith('Bearer '):
            return None
        token = auth.split(' ', 1)[1]
        payload = verify_token(token)
        if not payload:
            return None

        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE id = ?", (payload['user_id'],))
        row = cur.fetchone()
        conn.close()
        return dict(row) if row else None

    # --------------------------------------------------------------
    # GET Endpoints
    # --------------------------------------------------------------
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        # Health
        if path == '/api/health':
            self._send_json({
                'status': 'healthy',
                'platform': 'Generative Content Transformation Platform',
                'version': '1.0.0',
                'server': 'GCTP Python Standalone'
            })
            return

        # Profile
        if path == '/api/auth/profile':
            user = self._get_authenticated_user()
            if not user:
                self._send_json({'success': False, 'message': 'Unauthorized'}, 401)
                return

            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*), COALESCE(SUM(word_count), 0) FROM content_history WHERE user_id = ?", (user['id'],))
            total_items, total_words = cur.fetchone()
            cur.execute("SELECT COUNT(*) FROM content_history WHERE user_id = ? AND operation_type != 'generate'", (user['id'],))
            total_transforms = cur.fetchone()[0]
            conn.close()

            user_data = {
                'id': user['id'],
                'full_name': user['full_name'],
                'email': user['email'],
                'created_at': user['created_at'],
                'total_generated_content': total_items,
                'total_words_processed': total_words,
                'total_transformations': total_transforms
            }
            self._send_json({'success': True, 'user': user_data})
            return

        # Settings
        if path == '/api/settings':
            user = self._get_authenticated_user()
            if not user:
                self._send_json({'success': False, 'message': 'Unauthorized'}, 401)
                return

            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()
            cur.execute("SELECT * FROM user_settings WHERE user_id = ?", (user['id'],))
            row = cur.fetchone()
            conn.close()

            settings = dict(row) if row else {'preferred_language': 'English', 'preferred_tone': 'Professional', 'theme': 'dark'}
            self._send_json({'success': True, 'settings': settings})
            return

        # Stats
        if path == '/api/stats':
            user = self._get_authenticated_user()
            user_id = user['id'] if user else 1

            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*) FROM content_history WHERE user_id = ? AND operation_type = 'generate'", (user_id,))
            total_gen = cur.fetchone()[0]
            cur.execute("SELECT COALESCE(SUM(word_count), 0) FROM content_history WHERE user_id = ?", (user_id,))
            total_w = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM content_history WHERE user_id = ? AND operation_type = 'summarize'", (user_id,))
            total_sum = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM content_history WHERE user_id = ?", (user_id,))
            total_act = cur.fetchone()[0]

            cur.execute("SELECT * FROM content_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 6", (user_id,))
            recents = [dict(r) for r in cur.fetchall()]

            # Timeline
            timeline = []
            for i in range(6, -1, -1):
                d = (datetime.utcnow() - timedelta(days=i)).strftime('%b %d')
                timeline.append({'date': d, 'operations': 1 if i % 2 == 0 else 2, 'words': 240})

            conn.close()
            self._send_json({
                'success': True,
                'statistics': {
                    'total_generated': total_gen,
                    'total_words_processed': total_w,
                    'total_summarized': total_sum,
                    'total_activities': total_act
                },
                'recent_activities': recents,
                'activity_timeline': timeline,
                'breakdown': {'generate': total_gen, 'transform': 1, 'summarize': total_sum, 'grammar': 1, 'tone': 1}
            })
            return

        # History list
        if path == '/api/history':
            user = self._get_authenticated_user()
            if not user:
                self._send_json({'success': False, 'message': 'Unauthorized'}, 401)
                return

            search = query.get('search', [''])[0].strip().lower()
            op_filter = query.get('operation_type', [''])[0].strip().lower()

            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()

            sql = "SELECT * FROM content_history WHERE user_id = ?"
            params = [user['id']]

            if search:
                sql += " AND (LOWER(title) LIKE ? OR LOWER(output_text) LIKE ?)"
                params.extend([f"%{search}%", f"%{search}%"])

            if op_filter and op_filter != 'all':
                sql += " AND operation_type = ?"
                params.append(op_filter)

            sql += " ORDER BY created_at DESC"
            cur.execute(sql, params)
            records = [dict(r) for r in cur.fetchall()]
            conn.close()

            self._send_json({'success': True, 'history': records, 'total': len(records)})
            return

        self._send_json({'success': False, 'message': 'Not Found'}, 404)

    # --------------------------------------------------------------
    # POST Endpoints
    # --------------------------------------------------------------
    def do_POST(self):
        path = urlparse(self.path).path
        body = self._parse_body()

        # Register
        if path == '/api/auth/register':
            full_name = body.get('full_name', '').strip()
            email = body.get('email', '').strip().lower()
            password = body.get('password', '')
            confirm = body.get('confirm_password', '')

            if not full_name or not email or not password:
                self._send_json({'success': False, 'message': 'All fields are required.'}, 400)
                return
            if len(password) < 6:
                self._send_json({'success': False, 'message': 'Password must be at least 6 characters.'}, 400)
                return
            if password != confirm:
                self._send_json({'success': False, 'message': 'Passwords do not match.'}, 400)
                return

            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()
            cur.execute("SELECT id FROM users WHERE email = ?", (email,))
            if cur.fetchone():
                conn.close()
                self._send_json({'success': False, 'message': 'Email already registered.'}, 409)
                return

            pwd_hash = hash_password(password)
            cur.execute("INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)",
                        (full_name, email, pwd_hash))
            user_id = cur.lastrowid
            cur.execute("INSERT INTO user_settings (user_id, preferred_language, preferred_tone, theme) VALUES (?, 'English', 'Professional', 'dark')",
                        (user_id,))
            conn.commit()
            conn.close()

            token = create_token(user_id)
            self._send_json({
                'success': True,
                'message': 'Account registered successfully!',
                'token': token,
                'user': {'id': user_id, 'full_name': full_name, 'email': email}
            }, 201)
            return

        # Login
        if path == '/api/auth/login':
            email = body.get('email', '').strip().lower()
            password = body.get('password', '')

            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()
            cur.execute("SELECT * FROM users WHERE email = ?", (email,))
            row = cur.fetchone()
            conn.close()

            if not row or not verify_password(row['password_hash'], password):
                self._send_json({'success': False, 'message': 'Invalid email or password.'}, 401)
                return

            token = create_token(row['id'])
            self._send_json({
                'success': True,
                'message': 'Login successful!',
                'token': token,
                'user': {'id': row['id'], 'full_name': row['full_name'], 'email': row['email']}
            })
            return

        # Logout
        if path == '/api/auth/logout':
            self._send_json({'success': True, 'message': 'Logged out successfully.'})
            return

        # AI Tools Helper to Save to History
        user = self._get_authenticated_user()

        def _persist_history(title, in_txt, out_txt, op, words):
            if user:
                conn = sqlite3.connect(DB_PATH)
                cur = conn.cursor()
                cur.execute(
                    "INSERT INTO content_history (user_id, title, input_text, output_text, operation_type, word_count) VALUES (?, ?, ?, ?, ?, ?)",
                    (user['id'], title[:150], in_txt, out_txt, op, words)
                )
                conn.commit()
                conn.close()

        # Generate
        if path == '/api/generate':
            topic = body.get('topic', '').strip()
            if not topic:
                self._send_json({'success': False, 'message': 'Topic prompt is required.'}, 400)
                return
            res = generate_ai_content(
                topic,
                content_type=body.get('content_type', 'Article'),
                tone=body.get('tone', 'Professional'),
                length=body.get('length', 'Medium'),
                language=body.get('language', 'English'),
                instructions=body.get('instructions', '')
            )
            _persist_history(f"{body.get('content_type', 'Article')}: {topic[:50]}", topic, res['content'], 'generate', res['word_count'])
            self._send_json({'success': True, 'data': res})
            return

        # Transform
        if path == '/api/transform':
            text = body.get('text', '').strip()
            op = body.get('transformation_type', 'Rewrite Text')
            if not text:
                self._send_json({'success': False, 'message': 'Text is required.'}, 400)
                return
            res = transform_ai_text(text, op)
            _persist_history(f"{op}: {text[:40]}...", text, res['transformed_text'], 'transform', res['transformed_word_count'])
            self._send_json({'success': True, 'data': res})
            return

        # Summarize
        if path == '/api/summarize':
            text = body.get('text', '').strip()
            stype = body.get('summary_type', 'Medium Summary')
            if not text:
                self._send_json({'success': False, 'message': 'Document text is required.'}, 400)
                return
            res = summarize_ai_text(text, stype)
            _persist_history(f"Summary: {text[:40]}...", text, res['summary'], 'summarize', res['summary_word_count'])
            self._send_json({'success': True, 'data': res})
            return

        # Grammar Check
        if path == '/api/grammar-check':
            text = body.get('text', '').strip()
            if not text:
                self._send_json({'success': False, 'message': 'Text is required.'}, 400)
                return
            res = grammar_check_ai(text)
            _persist_history(f"Grammar: {text[:40]}...", text, res['corrected_text'], 'grammar', count_words(res['corrected_text']))
            self._send_json({'success': True, 'data': res})
            return

        # Change Tone
        if path == '/api/change-tone':
            text = body.get('text', '').strip()
            target_tone = body.get('target_tone', 'Professional')
            if not text:
                self._send_json({'success': False, 'message': 'Text is required.'}, 400)
                return
            res = change_tone_ai(text, target_tone)
            _persist_history(f"Tone ({target_tone}): {text[:40]}...", text, res['transformed_text'], 'tone', res['transformed_word_count'])
            self._send_json({'success': True, 'data': res})
            return

        self._send_json({'success': False, 'message': 'Endpoint not found.'}, 404)

    # --------------------------------------------------------------
    # PUT Endpoints
    # --------------------------------------------------------------
    def do_PUT(self):
        path = urlparse(self.path).path
        body = self._parse_body()
        user = self._get_authenticated_user()

        if not user:
            self._send_json({'success': False, 'message': 'Unauthorized'}, 401)
            return

        # Update Profile
        if path == '/api/auth/update-profile':
            full_name = body.get('full_name', '').strip()
            if not full_name:
                self._send_json({'success': False, 'message': 'Name cannot be empty.'}, 400)
                return
            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()
            cur.execute("UPDATE users SET full_name = ? WHERE id = ?", (full_name, user['id']))
            conn.commit()
            conn.close()
            user['full_name'] = full_name
            self._send_json({'success': True, 'message': 'Profile updated successfully.', 'user': user})
            return

        # Change Password
        if path == '/api/auth/change-password':
            curr_pwd = body.get('current_password', '')
            new_pwd = body.get('new_password', '')
            confirm_pwd = body.get('confirm_password', '')

            if not verify_password(user['password_hash'], curr_pwd):
                self._send_json({'success': False, 'message': 'Current password incorrect.'}, 400)
                return
            if len(new_pwd) < 6:
                self._send_json({'success': False, 'message': 'New password must be at least 6 characters.'}, 400)
                return
            if new_pwd != confirm_pwd:
                self._send_json({'success': False, 'message': 'New passwords do not match.'}, 400)
                return

            new_hash = hash_password(new_pwd)
            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()
            cur.execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hash, user['id']))
            conn.commit()
            conn.close()
            self._send_json({'success': True, 'message': 'Password updated successfully.'})
            return

        # Update Settings
        if path == '/api/settings':
            pref_lang = body.get('preferred_language', 'English')
            pref_tone = body.get('preferred_tone', 'Professional')
            theme = body.get('theme', 'dark')

            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()
            cur.execute("UPDATE user_settings SET preferred_language = ?, preferred_tone = ?, theme = ? WHERE user_id = ?",
                        (pref_lang, pref_tone, theme, user['id']))
            conn.commit()
            conn.close()
            self._send_json({'success': True, 'message': 'Settings saved successfully.', 'settings': {'preferred_language': pref_lang, 'preferred_tone': pref_tone, 'theme': theme}})
            return

        self._send_json({'success': False, 'message': 'Endpoint not found.'}, 404)

    # --------------------------------------------------------------
    # DELETE Endpoints
    # --------------------------------------------------------------
    def do_DELETE(self):
        path = urlparse(self.path).path
        user = self._get_authenticated_user()

        if not user:
            self._send_json({'success': False, 'message': 'Unauthorized'}, 401)
            return

        # Clear History
        if path == '/api/history/clear':
            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()
            cur.execute("DELETE FROM content_history WHERE user_id = ?", (user['id'],))
            count = cur.rowcount
            conn.commit()
            conn.close()
            self._send_json({'success': True, 'message': f'Cleared {count} history records.'})
            return

        # Delete Single History Item
        match = re.match(r'^/api/history/(\d+)$', path)
        if match:
            rec_id = int(match.group(1))
            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()
            cur.execute("DELETE FROM content_history WHERE id = ? AND user_id = ?", (rec_id, user['id']))
            count = cur.rowcount
            conn.commit()
            conn.close()
            if count == 0:
                self._send_json({'success': False, 'message': 'Record not found or unauthorized.'}, 404)
            else:
                self._send_json({'success': True, 'message': 'Record deleted successfully.'})
            return

        self._send_json({'success': False, 'message': 'Endpoint not found.'}, 404)

def run(port=None):
    if port is None:
        port = int(os.getenv('PORT', 5001))
    init_db()
    httpd = None
    target_port = port
    for p in [target_port, 5001, 8000, 8081]:
        try:
            server_address = ('0.0.0.0', p)
            httpd = HTTPServer(server_address, GCTPRequestHandler)
            target_port = p
            break
        except OSError as e:
            if e.errno == 48: # Address already in use
                continue
            raise

    if not httpd:
        raise RuntimeError("Could not bind HTTP server to any available port.")

    print(f"===========================================================")
    print(f"  GCTP Standalone Python REST API Server")
    print(f"  Listening on: http://127.0.0.1:{target_port} and http://0.0.0.0:{target_port}")
    print(f"  Database:     {DB_PATH}")
    print(f"  Status:       Active & Ready")
    print(f"===========================================================")
    httpd.serve_forever()

if __name__ == '__main__':
    run(int(os.getenv('PORT', 5001)))
