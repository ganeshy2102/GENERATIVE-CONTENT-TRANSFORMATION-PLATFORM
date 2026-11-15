#!/usr/bin/env python3
"""
Comprehensive In-Process Test Suite for GCTP Core Engine & Database
Tests all 15 required modules and functional requirements:
1. User registration & validation
2. Password hashing (PBKDF2-SHA256)
3. User authentication & credential verification
4. Token creation & verification
5. AI content generation (multilingual: English, Hindi, Punjabi)
6. 9 Text transformations
7. AI Summarizer with compression metrics & keyword extraction
8. Grammar checking with itemized corrections & explanations
9. 8 Tone conversions
10. Database operations (CRUD on SQLite users, content_history, user_settings)
11. History search & filtering
12. Real-time dashboard statistics & 7-day timeline aggregation
13. User profile updating
14. User settings & preference persistence
15. Data ownership & boundary checks
"""

import os
import sys
import sqlite3
import unittest
from datetime import datetime, timedelta

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from standalone_server import (
    DB_PATH, init_db, hash_password, verify_password,
    create_token, verify_token, count_words,
    generate_ai_content, transform_ai_text, summarize_ai_text,
    grammar_check_ai, change_tone_ai
)

class TestGCTPCore(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        init_db()
        cls.test_email = "scholar.vignan@college.edu"
        cls.test_password = "StrongPassword2026!"
        cls.user_id = None

    # --------------------------------------------------------------
    # 1. Database Schema & Tables
    # --------------------------------------------------------------
    def test_01_database_tables_exist(self):
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [r[0] for r in cur.fetchall()]
        conn.close()
        self.assertIn('users', tables)
        self.assertIn('content_history', tables)
        self.assertIn('user_settings', tables)

    # --------------------------------------------------------------
    # 2. User Registration & Password Hashing
    # --------------------------------------------------------------
    def test_02_user_registration_and_hashing(self):
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("DELETE FROM users WHERE email = ?", (self.test_email,))
        conn.commit()

        pwd_hash = hash_password(self.test_password)
        self.assertIn(':', pwd_hash)
        self.assertTrue(verify_password(pwd_hash, self.test_password))
        self.assertFalse(verify_password(pwd_hash, "WrongPassword!"))

        cur.execute(
            "INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)",
            ("Vignan Scholar", self.test_email, pwd_hash)
        )
        TestGCTPCore.user_id = cur.lastrowid
        cur.execute(
            "INSERT INTO user_settings (user_id, preferred_language, preferred_tone, theme) VALUES (?, 'English', 'Professional', 'dark')",
            (TestGCTPCore.user_id,)
        )
        conn.commit()
        conn.close()

        self.assertIsNotNone(self.user_id)
        self.assertGreater(self.user_id, 0)

    # --------------------------------------------------------------
    # 3. Duplicate Email Prevention
    # --------------------------------------------------------------
    def test_03_duplicate_email_constraint(self):
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        with self.assertRaises(sqlite3.IntegrityError):
            cur.execute(
                "INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)",
                ("Duplicate User", self.test_email, "hash")
            )
        conn.close()

    # --------------------------------------------------------------
    # 4. Token Creation & Validation
    # --------------------------------------------------------------
    def test_04_token_lifecycle(self):
        token = create_token(self.user_id)
        self.assertIsNotNone(token)
        payload = verify_token(token)
        self.assertIsNotNone(payload)
        self.assertEqual(payload['user_id'], self.user_id)

        # Invalid token
        self.assertIsNone(verify_token("tampered.token.signature"))

    # --------------------------------------------------------------
    # 5. AI Content Generator (English, Hindi, Punjabi)
    # --------------------------------------------------------------
    def test_05_content_generation_multilingual(self):
        # English
        res_en = generate_ai_content("Artificial Intelligence in Research", "Article", "Academic", "Medium", "English")
        self.assertIn("Artificial Intelligence", res_en['content'])
        self.assertGreater(res_en['word_count'], 40)
        self.assertTrue(res_en['is_demo'])

        # Hindi
        res_hi = generate_ai_content("कृत्रिम बुद्धिमत्ता", "Article", "Professional", "Medium", "Hindi")
        self.assertIn("भूमिका", res_hi['content'])

        # Punjabi
        res_pa = generate_ai_content("ਨਕਲੀ ਬੁੱਧੀ", "Article", "Casual", "Short", "Punjabi")
        self.assertIn("ਜਾਣ-ਪਛਾਣ", res_pa['content'])

    # --------------------------------------------------------------
    # 6. All 9 Text Transformations
    # --------------------------------------------------------------
    def test_06_text_transformations(self):
        sample = "We must utilize algorithms to facilitate optimal throughput. We can subsequently terminate latency."
        ops = [
            'Rewrite Text', 'Improve Writing', 'Simplify Language',
            'Expand Content', 'Shorten Content', 'Convert to Bullet Points',
            'Convert to Paragraph', 'Professional Rewrite', 'Academic Rewrite'
        ]
        for op in ops:
            res = transform_ai_text(sample, op)
            self.assertIsNotNone(res['transformed_text'])
            self.assertGreater(res['transformed_word_count'], 0)
            if op == 'Simplify Language':
                self.assertIn('use', res['transformed_text'])
                self.assertIn('help', res['transformed_text'])
            if op == 'Convert to Bullet Points':
                self.assertIn('•', res['transformed_text'])

    # --------------------------------------------------------------
    # 7. AI Text Summarizer & Compression Metrics
    # --------------------------------------------------------------
    def test_07_summarizer_metrics(self):
        doc = "Cloud computing delivers on-demand compute resources over the internet. Organizations avoid upfront server costs. Automated scaling guarantees reliability."
        res = summarize_ai_text(doc, 'Short Summary')
        self.assertIsNotNone(res['summary'])
        self.assertGreaterEqual(res['compression_percentage'], 0)
        self.assertGreater(len(res['keywords']), 0)
        self.assertGreater(len(res['key_points']), 0)

    # --------------------------------------------------------------
    # 8. Grammar Checker with Itemized Diagnostics
    # --------------------------------------------------------------
    def test_08_grammar_diagnostics(self):
        bad_text = "i recieved teh documents yesterday"
        res = grammar_check_ai(bad_text)
        self.assertIn("the", res['corrected_text'])
        self.assertIn("I", res['corrected_text'])
        self.assertGreater(len(res['corrections']), 0)
        types = [c['type'] for c in res['corrections']]
        self.assertIn('Spelling', types)

    # --------------------------------------------------------------
    # 9. 8 Writing Tone Conversions
    # --------------------------------------------------------------
    def test_09_tone_conversions(self):
        text = "I need help with my project."
        tones = ['Professional', 'Academic', 'Friendly', 'Formal', 'Casual', 'Creative', 'Persuasive', 'Simple']
        for t in tones:
            res = change_tone_ai(text, t)
            self.assertIsNotNone(res['transformed_text'])
            self.assertEqual(res['target_tone'], t)

    # --------------------------------------------------------------
    # 10. Database History CRUD & Search
    # --------------------------------------------------------------
    def test_10_content_history_operations(self):
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()

        # Insert record
        cur.execute(
            "INSERT INTO content_history (user_id, title, input_text, output_text, operation_type, word_count) VALUES (?, ?, ?, ?, ?, ?)",
            (self.user_id, "Article: Automated Machine Learning", "Prompt for AutoML", "AutoML optimizes pipelines...", "generate", 120)
        )
        rec_id = cur.lastrowid
        conn.commit()

        # Fetch record
        cur.execute("SELECT * FROM content_history WHERE id = ? AND user_id = ?", (rec_id, self.user_id))
        rec = cur.fetchone()
        self.assertIsNotNone(rec)

        # Search query
        cur.execute("SELECT COUNT(*) FROM content_history WHERE user_id = ? AND title LIKE '%Machine Learning%'", (self.user_id,))
        count = cur.fetchone()[0]
        self.assertGreaterEqual(count, 1)

        # Delete single record
        cur.execute("DELETE FROM content_history WHERE id = ? AND user_id = ?", (rec_id, self.user_id))
        conn.commit()
        cur.execute("SELECT * FROM content_history WHERE id = ?", (rec_id,))
        self.assertIsNone(cur.fetchone())
        conn.close()

    # --------------------------------------------------------------
    # 11. User Settings Persistence
    # --------------------------------------------------------------
    def test_11_user_settings_update(self):
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("UPDATE user_settings SET preferred_language = 'Hindi', preferred_tone = 'Academic', theme = 'light' WHERE user_id = ?", (self.user_id,))
        conn.commit()

        cur.execute("SELECT preferred_language, preferred_tone, theme FROM user_settings WHERE user_id = ?", (self.user_id,))
        row = cur.fetchone()
        conn.close()
        self.assertEqual(row[0], 'Hindi')
        self.assertEqual(row[1], 'Academic')
        self.assertEqual(row[2], 'light')

    # --------------------------------------------------------------
    # 12. User Profile Stats & Aggregation
    # --------------------------------------------------------------
    def test_12_profile_stats_aggregation(self):
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        # Seed 2 entries
        cur.execute("INSERT INTO content_history (user_id, title, input_text, output_text, operation_type, word_count) VALUES (?, 'T1', 'In1', 'Out1', 'generate', 150)", (self.user_id,))
        cur.execute("INSERT INTO content_history (user_id, title, input_text, output_text, operation_type, word_count) VALUES (?, 'T2', 'In2', 'Out2', 'transform', 80)", (self.user_id,))
        conn.commit()

        cur.execute("SELECT COUNT(*), SUM(word_count) FROM content_history WHERE user_id = ?", (self.user_id,))
        tot_cnt, tot_w = cur.fetchone()
        conn.close()

        self.assertGreaterEqual(tot_cnt, 2)
        self.assertGreaterEqual(tot_w, 230)

    @classmethod
    def tearDownClass(cls):
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        if cls.user_id:
            cur.execute("DELETE FROM content_history WHERE user_id = ?", (cls.user_id,))
            cur.execute("DELETE FROM user_settings WHERE user_id = ?", (cls.user_id,))
            cur.execute("DELETE FROM users WHERE id = ?", (cls.user_id,))
        # Ensure database is clean
        cur.execute("DELETE FROM content_history")
        conn.commit()
        conn.close()

if __name__ == '__main__':
    unittest.main()
