import os
import re
import json
import logging
import requests
from ..utils.validators import count_words

logger = logging.getLogger(__name__)

class AIService:
    """
    Modular AI Service supporting OpenAI API and an intelligent 
    offline College Demo Mode for evaluations and presentations.
    """

    def __init__(self, provider: str = None, api_key: str = None, model: str = None):
        self.provider = provider or os.getenv('AI_PROVIDER', 'demo').lower()
        self.api_key = api_key or os.getenv('OPENAI_API_KEY', '')
        self.model = model or os.getenv('OPENAI_MODEL', 'gpt-4o-mini')

    def _call_openai(self, system_prompt: str, user_prompt: str, temperature: float = 0.7) -> str:
        """Execute request against OpenAI Chat Completions REST endpoint."""
        if not self.api_key:
            raise ValueError("OpenAI API Key is missing.")

        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": temperature
        }

        response = requests.post(url, json=payload, headers=headers, timeout=30)
        if response.status_code != 200:
            error_data = response.json().get('error', {})
            error_msg = error_data.get('message', f"OpenAI API Error: {response.status_code}")
            logger.error(f"OpenAI error: {error_msg}")
            raise RuntimeError(error_msg)

        data = response.json()
        return data['choices'][0]['message']['content'].strip()

    # ------------------------------------------------------------------
    # 1. AI Content Generator
    # ------------------------------------------------------------------
    def generate_content(self, topic: str, content_type: str = 'Article', tone: str = 'Professional',
                         length: str = 'Medium', language: str = 'English', instructions: str = '') -> dict:
        """
        Generate structured content based on topic, type, tone, length, and language.
        """
        word_targets = {
            'Short': '150 to 250 words',
            'Medium': '400 to 600 words',
            'Long': '800 to 1200 words'
        }
        target_words_desc = word_targets.get(length, '400 to 600 words')

        # Live OpenAI Call if configured and key is present
        if self.provider == 'openai' and self.api_key:
            system_prompt = (
                f"You are an expert AI content creator. Create high quality content in {language} language. "
                f"Content type: {content_type}. Tone: {tone}. Target length: {target_words_desc}. "
                f"Format with clean paragraphs, markdown headings, and bullet points where helpful."
            )
            user_prompt = f"Topic: {topic}\n"
            if instructions:
                user_prompt += f"Special Instructions: {instructions}\n"

            try:
                content = self._call_openai(system_prompt, user_prompt)
                return {
                    'content': content,
                    'word_count': count_words(content),
                    'is_demo': False,
                    'provider': 'OpenAI'
                }
            except Exception as e:
                logger.warning(f"Falling back to Demo Engine due to API error: {str(e)}")

        # Intelligent College Major Demo Engine Fallback
        demo_content = self._generate_demo_content(topic, content_type, tone, length, language, instructions)
        return {
            'content': demo_content,
            'word_count': count_words(demo_content),
            'is_demo': True,
            'provider': 'Demo Engine'
        }

    def _generate_demo_content(self, topic: str, content_type: str, tone: str, length: str, language: str, instructions: str) -> str:
        """Deterministic intelligent fallback content generator."""
        clean_topic = topic.strip()
        
        # Multilingual support
        if language.lower() == 'hindi':
            return (
                f"# {clean_topic} : एक विस्तृत समीक्षा ({content_type})\n\n"
                f"**शैली:** {tone} | **प्रारूप:** {content_type}\n\n"
                f"## भूमिका\n"
                f"आज के आधुनिक युग में, {clean_topic} एक अत्यंत महत्वपूर्ण विषय बन चुका है। "
                f"यह न केवल हमारे सोचने के तरीके को प्रभावित करता है, बल्कि विकास के नए अवसरों को भी जन्म देता है।\n\n"
                f"## मुख्य बिंदु एवं विश्लेषण\n"
                f"- **आधुनिक परिप्रेक्ष्य:** समकालीन तकनीकी और सामाजिक परिवेश में {clean_topic} का प्रभाव निरंतर बढ़ रहा है।\n"
                f"- **रणनीतिक महत्व:** सही दिशा और उचित योजना के साथ, हम इसके माध्यम से उत्कृष्ट परिणाम प्राप्त कर सकते हैं।\n"
                f"- **चुनौतियाँ और समाधान:** हर नए विचार की तरह, इसमें भी कुछ बाधाएं आती हैं, परंतु नवाचार द्वारा उनका समाधान संभव है।\n\n"
                f"## निष्कर्ष\n"
                f"संक्षेप में कहा जाए तो {clean_topic} भविष्य के निर्माण में एक आधारशिला का कार्य करता है। "
                f"इसके सकारात्मक पहलुओं को अपनाकर हम निरंतर प्रगति के पथ पर अग्रसर रह सकते हैं।"
            )

        if language.lower() == 'punjabi':
            return (
                f"# {clean_topic} : ਵਿਸ਼ਲੇਸ਼ਣ ਅਤੇ ਦ੍ਰਿਸ਼ਟੀਕੋਣ ({content_type})\n\n"
                f"**ਲਹਿਜਾ (ਟੋਨ):** {tone} | **ਕਿਸਮ:** {content_type}\n\n"
                f"## ਜਾਣ-ਪਛਾਣ\n"
                f"ਅਜੋਕੇ ਦੌਰ ਵਿੱਚ, {clean_topic} ਇੱਕ ਬਹੁਤ ਹੀ ਅਹਿਮ ਅਤੇ ਗੰਭੀਰ ਵਿਸ਼ਾ ਬਣ ਕੇ ਉੱਭਰਿਆ ਹੈ। "
                f"ਇਸਦਾ ਅਸਰ ਸਾਡੀ ਰੋਜ਼ਾਨਾ ਜ਼ਿੰਦਗੀ ਅਤੇ ਆਧੁਨਿਕ ਤਰੱਕੀ 'ਤੇ ਸਾਫ਼ ਦੇਖਿਆ ਜਾ ਸਕਦਾ ਹੈ।\n\n"
                f"## ਪ੍ਰਮੁੱਖ ਵਿਚਾਰ ਅਤੇ ਤੱਥ\n"
                f"- **ਵਿਕਾਸ ਦੇ ਰਾਹ:** {clean_topic} ਨਵੇਂ ਮੌਕੇ ਅਤੇ ਦਿਸ਼ਾਵਾਂ ਪ੍ਰਦਾਨ ਕਰਦਾ ਹੈ।\n"
                f"- **ਸਕਾਰਾਤਮਕ ਪ੍ਰਭਾਵ:** ਜੇਕਰ ਇਸਨੂੰ ਸਹੀ ਢੰਗ ਨਾਲ ਲਾਗੂ ਕੀਤਾ ਜਾਵੇ ਤਾਂ ਇਹ ਬੇਮਿਸਾਲ ਨਤੀਜੇ ਦੇ ਸਕਦਾ ਹੈ।\n"
                f"- **ਭਵਿੱਖ ਦੀ ਸੰਭਾਵਨਾ:** ਆਉਣ ਵਾਲੇ ਸਮੇਂ ਵਿੱਚ ਇਸਦੀ ਮਹੱਤਤਾ ਹੋਰ ਵੀ ਵਧੇਗੀ।\n\n"
                f"## ਸਿੱਟਾ\n"
                f"ਅੰਤ ਵਿੱਚ, ਇਹ ਕਹਿਣਾ ਬਿਲਕੁਲ ਸਹੀ ਹੋਵੇਗਾ ਕਿ {clean_topic} ਸਾਨੂੰ ਨਵੀਂ ਸੋਚ ਅਤੇ ਖੋਜ ਵੱਲ ਪ੍ਰੇਰਿਤ ਕਰਦਾ ਹੈ।"
            )

        # English Generation by Content Type
        if content_type.lower() == 'email':
            return (
                f"Subject: Key Insights and Updates Regarding {clean_topic}\n\n"
                f"Dear Colleagues and Stakeholders,\n\n"
                f"I hope this message finds you well.\n\n"
                f"I am writing to share important perspectives regarding {clean_topic}. "
                f"As we navigate evolving operational priorities, understanding this subject is crucial for driving sustainable progress.\n\n"
                f"Key Highlights:\n"
                f"1. Strategic Alignment: {clean_topic} directly bolsters our core objectives and enhances collaborative productivity.\n"
                f"2. Actionable Focus: Streamlining our approach will mitigate known inefficiencies and unlock tangible value.\n"
                f"3. Timeline & Next Steps: Dedicated working sessions will be scheduled to operationalize these principles.\n\n"
                f"Please feel free to review the attached briefing notes and let me know if you have any questions or feedback.\n\n"
                f"Warm regards,\n"
                f"[Your Name]\n"
                f"Generative Content Transformation Platform User"
            )

        if content_type.lower() == 'social media post':
            return (
                f"🚀 Exploring {clean_topic} today! Here is why it matters more than ever:\n\n"
                f"✨ Innovation does not happen by chance—it happens when we rethink fundamental paradigms. "
                f"Diving deep into {clean_topic} reveals how small, continuous transformations create profound breakthroughs.\n\n"
                f"🔑 3 Quick Takeaways:\n"
                f"• Precision and clarity outperform complexity every time.\n"
                f"• Real-world impact stems from consistent application.\n"
                f"• Staying adaptable is the ultimate competitive advantage.\n\n"
                f"💡 What are your thoughts on {clean_topic}? Drop your perspectives below!\n\n"
                f"#AI #Innovation #Productivity #{re.sub(r'[^a-zA-Z0-9]', '', clean_topic)} #FutureOfWork"
            )

        # Standard Blog / Article / Essay
        intro = (
            f"# {clean_topic.title()}\n\n"
            f"*Tone: {tone} | Format: {content_type} | Target Length: {length}*\n\n"
            f"## Executive Overview\n"
            f"In an increasingly fast-paced digital and intellectual landscape, {clean_topic} has emerged as a cornerstone of modern discourse. "
            f"Whether evaluated from a practical, theoretical, or industry standpoint, comprehending the fundamental mechanics and broader implications "
            f"of this subject allows practitioners to unlock unprecedented value, optimize productivity, and drive strategic impact."
        )

        body_section_1 = (
            f"\n\n## Foundational Principles and Strategic Relevance\n"
            f"To appreciate the depth of {clean_topic}, one must first examine its underlying architecture. "
            f"At its core, the subject is defined by systematic methodologies that emphasize agility, consistency, and rigorous execution. "
            f"Recent empirical analyses demonstrate that integrating structured frameworks around {clean_topic} drastically minimizes friction, "
            f"accelerates workflow velocity, and ensures that qualitative standards are maintained across diverse environments."
        )

        body_section_2 = (
            f"\n\n## Practical Applications and Real-World Impact\n"
            f"The transformation driven by {clean_topic} is not merely theoretical; it manifests across multiple practical dimensions:\n\n"
            f"1. **Operational Optimization:** Implementing these principles eliminates redundancies and establishes transparent workflows.\n"
            f"2. **Collaborative Synergy:** Teams leveraging insights surrounding {clean_topic} report enhanced communication and rapid consensus.\n"
            f"3. **Long-Term Scalability:** By establishing robust standards early, organizations build resilient foundations capable of adapting to future challenges.\n"
            f"4. **Continuous Innovation:** Experimentation and feedback loops ensure continuous refinement over time."
        )

        conclusion = (
            f"\n\n## Summary and Outlook\n"
            f"Ultimately, mastering {clean_topic} is both an opportunity and a vital imperative. "
            f"By combining clear strategic foresight with deliberate execution, individuals and institutions can navigate complexities "
            f"with confidence, turning ambitious ideas into enduring achievements."
        )

        if length == 'Short':
            return intro + body_section_1 + conclusion
        elif length == 'Long':
            extra_section = (
                f"\n\n## Addressing Complexities and Overcoming Challenges\n"
                f"Despite clear benefits, adopting new paradigms around {clean_topic} requires addressing several critical challenges. "
                f"Resistance to procedural change, initial learning curves, and resource allocation often present hurdles. "
                f"However, proactive stakeholder education, transparent benchmarking, and iterative rollout models effectively neutralize these risks.\n\n"
                f"Furthermore, ethical governance and quality assurance must be integrated into every phase of the lifecycle, "
                f"guaranteeing that results remain trustworthy, repeatable, and aligned with organizational values."
            )
            return intro + body_section_1 + body_section_2 + extra_section + conclusion
        else: # Medium
            return intro + body_section_1 + body_section_2 + conclusion

    # ------------------------------------------------------------------
    # 2. Text Transformation
    # ------------------------------------------------------------------
    def transform_text(self, text: str, transformation_type: str = 'Rewrite Text') -> dict:
        """
        Transform text according to one of the 9 transformation options.
        """
        text = text.strip()
        original_words = count_words(text)

        if self.provider == 'openai' and self.api_key:
            system_prompt = (
                f"You are a professional text transformation engine. Execute this operation: '{transformation_type}'. "
                f"Preserve the core meaning while enhancing clarity, structure, and readability. "
                f"Output only the transformed text."
            )
            try:
                result = self._call_openai(system_prompt, text)
                return {
                    'transformed_text': result,
                    'original_word_count': original_words,
                    'transformed_word_count': count_words(result),
                    'transformation_type': transformation_type,
                    'is_demo': False
                }
            except Exception as e:
                logger.warning(f"Demo fallback on transformation: {str(e)}")

        # Intelligent Demo Transformation
        transformed = self._execute_demo_transformation(text, transformation_type)
        return {
            'transformed_text': transformed,
            'original_word_count': original_words,
            'transformed_word_count': count_words(transformed),
            'transformation_type': transformation_type,
            'is_demo': True
        }

    def _execute_demo_transformation(self, text: str, op: str) -> str:
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]
        if not sentences:
            sentences = [text]

        op_lower = op.lower()

        if 'bullet' in op_lower:
            bullets = []
            for i, s in enumerate(sentences, 1):
                clean_s = s.rstrip('.!?')
                bullets.append(f"• **Key Point {i}:** {clean_s}.")
            return "\n".join(bullets)

        if 'paragraph' in op_lower:
            # Flatten bullets or multiple lines into unified flowing paragraphs
            clean_lines = [re.sub(r'^[•\-\*\d\.\s]+', '', line).strip() for line in text.split('\n') if line.strip()]
            return " ".join(clean_lines)

        if 'simplify' in op_lower:
            simplified = []
            replacements = {
                'utilize': 'use', 'facilitate': 'help', 'subsequently': 'then',
                'commence': 'start', 'terminate': 'end', 'endeavor': 'try',
                'demonstrate': 'show', 'implement': 'apply', 'comprehensive': 'complete',
                'optimal': 'best', 'paramount': 'very important', 'leverage': 'use'
            }
            for s in sentences:
                current_s = s
                for complex_w, simple_w in replacements.items():
                    current_s = re.sub(r'\b' + complex_w + r'\b', simple_w, current_s, flags=re.IGNORECASE)
                simplified.append(current_s)
            return " ".join(simplified)

        if 'shorten' in op_lower:
            # Keep top half of sentences or condense
            condensed = sentences[:max(1, len(sentences)//2 + 1)]
            return " ".join(condensed)

        if 'expand' in op_lower:
            expanded = []
            for s in sentences:
                clean_s = s.rstrip('.!?')
                expanded.append(
                    f"{clean_s}. To elaborate further, this point holds significant weight because it establishes a repeatable foundation that eliminates ambiguity and ensures qualitative consistency."
                )
            return " ".join(expanded)

        if 'professional' in op_lower:
            return (
                f"Upon comprehensive evaluation of the subject matter, the analysis indicates that {text.lower().rstrip('.')}."
                f" Implementing these strategic paradigms will enhance institutional resilience, drive measurable performance metrics, and foster structured alignment across all designated objectives."
            )

        if 'academic' in op_lower:
            return (
                f"From an empirical and scholarly standpoint, the evidence underscores that {text.lower().rstrip('.')}."
                f" This observation aligns with contemporary academic literature, demonstrating that methodological rigor and systematic inquiry remain indispensable for sustained intellectual inquiry."
            )

        if 'improve' in op_lower:
            enhanced = " ".join([s.capitalize() for s in sentences])
            return f"Clearly articulated, {enhanced} Furthermore, adopting a refined perspective ensures that the core thesis resonates with maximum clarity and persuasive precision."

        # Default Rewrite
        return (
            f"In other words, {text.rstrip('.')}."
            f" Re-examining this statement from an updated angle highlights its core significance, providing a fresh and captivating perspective for the reader."
        )

    # ------------------------------------------------------------------
    # 3. AI Summarizer
    # ------------------------------------------------------------------
    def summarize_text(self, text: str, summary_type: str = 'Medium Summary',
                       extract_key_points: bool = True, extract_keywords: bool = True) -> dict:
        """
        Summarize documents and compute metrics (compression ratio, keywords, key points).
        """
        text = text.strip()
        orig_words = count_words(text)

        if self.provider == 'openai' and self.api_key:
            system_prompt = (
                f"You are an expert document summarization AI. Summary type: {summary_type}. "
                f"Return a JSON object with keys: 'summary', 'key_points' (array of strings), "
                f"'keywords' (array of strings), 'main_idea' (string), 'conclusion' (string)."
            )
            try:
                res_raw = self._call_openai(system_prompt, text)
                clean_json_str = res_raw.replace('```json', '').replace('```', '').strip()
                data = json.loads(clean_json_str)
                summary_words = count_words(data.get('summary', ''))
                comp_pct = round(((orig_words - summary_words) / max(1, orig_words)) * 100, 1)
                data.update({
                    'original_word_count': orig_words,
                    'summary_word_count': summary_words,
                    'compression_percentage': max(0.0, comp_pct),
                    'is_demo': False
                })
                return data
            except Exception as e:
                logger.warning(f"Summarizer demo fallback: {str(e)}")

        # Intelligent Demo Summarizer
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]
        if not sentences:
            sentences = [text]

        if 'Very Short' in summary_type:
            summary = sentences[0] if sentences else text
        elif 'Short' in summary_type:
            summary = " ".join(sentences[:min(2, len(sentences))])
        elif 'Detailed' in summary_type:
            summary = " ".join(sentences[:min(6, len(sentences))])
            if len(sentences) < 4:
                summary += " In summary, the document comprehensively explores critical operational fundamentals, emphasizing practical methodology and long-term implications."
        else: # Medium
            summary = " ".join(sentences[:min(3, len(sentences))])

        summary_words = count_words(summary)
        compression = round(((orig_words - summary_words) / max(1, orig_words)) * 100, 1)

        # Extract keywords
        words = re.findall(r'\b[A-Za-z]{4,}\b', text)
        stop_words = {'that', 'with', 'this', 'have', 'from', 'which', 'will', 'would', 'there', 'their', 'about', 'these'}
        filtered = [w.capitalize() for w in words if w.lower() not in stop_words]
        keywords = list(dict.fromkeys(filtered))[:6]
        if not keywords:
            keywords = ['Content', 'Strategy', 'Optimization', 'Intelligence', 'Workflow']

        # Key points
        key_points = [
            f"Essential focus on: {sentences[0][:80]}..." if sentences else "Core objective clearly defined.",
            "Systematic execution minimizes operational bottlenecks.",
            "Consistency and quality control are vital for long-term viability."
        ]

        main_idea = sentences[0] if sentences else "Digital transformation through clear, structured communication."
        conclusion = sentences[-1] if len(sentences) > 1 else "Mastering this discipline empowers sustainable success."

        return {
            'summary': summary,
            'key_points': key_points,
            'keywords': keywords,
            'main_idea': main_idea,
            'conclusion': conclusion,
            'original_word_count': orig_words,
            'summary_word_count': summary_words,
            'compression_percentage': max(0.0, compression),
            'is_demo': True
        }

    # ------------------------------------------------------------------
    # 4. Grammar Checker
    # ------------------------------------------------------------------
    def check_grammar(self, text: str) -> dict:
        """
        Analyze text for grammar, punctuation, spelling, and sentence readability issues.
        """
        text = text.strip()
        orig_words = count_words(text)

        if self.provider == 'openai' and self.api_key:
            system_prompt = (
                "You are an expert grammar correction and linguistics AI. Analyze the text. "
                "Return a JSON object with: 'corrected_text', 'corrections' (list of objects with "
                "'original', 'suggestion', 'type' [Grammar/Spelling/Punctuation/Style], 'explanation'), "
                "and 'readability_score_improvement' (string, e.g. '+18%')."
            )
            try:
                res_raw = self._call_openai(system_prompt, text)
                clean_json_str = res_raw.replace('```json', '').replace('```', '').strip()
                data = json.loads(clean_json_str)
                data.update({
                    'original_text': text,
                    'word_count': orig_words,
                    'is_demo': False
                })
                return data
            except Exception as e:
                logger.warning(f"Grammar checker demo fallback: {str(e)}")

        # Intelligent Demo Grammar Diagnostics
        corrected = text
        corrections = []

        rules = [
            (r'\bteh\b', 'the', 'Spelling', "Common typographical error corrected from 'teh' to 'the'."),
            (r'\brecieve\b', 'receive', 'Spelling', "Rule: 'i' before 'e' except after 'c'."),
            (r'\bseperate\b', 'separate', 'Spelling', "Corrected spelling of 'separate'."),
            (r'\btheir is\b', 'there is', 'Grammar', "Used possessive pronoun 'their' instead of existential 'there'."),
            (r'\byour welcome\b', "you're welcome", 'Grammar', "Contraction 'you are' required instead of possessive 'your'."),
            (r'\bi\b', 'I', 'Punctuation', "The first-person singular pronoun 'I' must always be capitalized."),
            (r'\bdont\b', "don't", 'Punctuation', "Missing apostrophe in the contraction 'don't'."),
            (r'\bcant\b', "can't", 'Punctuation', "Missing apostrophe in the contraction 'can't'."),
            (r'\bwont\b', "won't", 'Punctuation', "Missing apostrophe in the contraction 'won't'."),
            (r'\bgooder\b', 'better', 'Grammar', "Irregular comparative form: 'good' becomes 'better'."),
            (r'\bvery unique\b', 'unique', 'Style', "'Unique' is an absolute state; degree modifiers like 'very' are redundant."),
            (r'\bin order to\b', 'to', 'Style', "Conciseness: 'in order to' can be simplified to 'to'.")
        ]

        for pattern, replacement, category, explanation in rules:
            match = re.search(pattern, corrected, flags=re.IGNORECASE)
            if match:
                orig_substr = match.group(0)
                corrected = re.sub(pattern, replacement, corrected, flags=re.IGNORECASE)
                corrections.append({
                    'original': orig_substr,
                    'suggestion': replacement,
                    'type': category,
                    'explanation': explanation
                })

        # Ensure trailing punctuation
        if corrected and not corrected[-1] in '.!?':
            corrections.append({
                'original': '(end of sentence)',
                'suggestion': '.',
                'type': 'Punctuation',
                'explanation': 'Added terminal period to complete the sentence structure.'
            })
            corrected += '.'

        if not corrections:
            corrections.append({
                'original': 'Overall sentence clarity',
                'suggestion': 'Style enhancement',
                'type': 'Style',
                'explanation': 'Sentence mechanics and syntax are sound; refined cadence for enhanced academic flow.'
            })

        return {
            'original_text': text,
            'corrected_text': corrected,
            'corrections': corrections,
            'corrections_count': len(corrections),
            'readability_score_improvement': '+24% Clarity Index',
            'word_count': orig_words,
            'is_demo': True
        }

    # ------------------------------------------------------------------
    # 5. Tone Changer
    # ------------------------------------------------------------------
    def change_tone(self, text: str, target_tone: str = 'Professional') -> dict:
        """
        Convert text into one of 8 distinct tones:
        Professional, Academic, Friendly, Formal, Casual, Creative, Persuasive, Simple
        """
        text = text.strip()
        orig_words = count_words(text)

        if self.provider == 'openai' and self.api_key:
            system_prompt = (
                f"You are an expert stylistic writer. Rewrite the input text into a strictly '{target_tone}' tone. "
                f"Keep the original intent accurate while completely adjusting vocabulary, sentence structure, and style."
            )
            try:
                res = self._call_openai(system_prompt, text)
                return {
                    'original_text': text,
                    'transformed_text': res,
                    'target_tone': target_tone,
                    'original_word_count': orig_words,
                    'transformed_word_count': count_words(res),
                    'is_demo': False
                }
            except Exception as e:
                logger.warning(f"Tone changer demo fallback: {str(e)}")

        # Intelligent Tone Shifter
        tone_lower = target_tone.lower()
        cleaned_core = text.rstrip('.!?')

        if tone_lower == 'professional':
            transformed = (
                f"I would like to bring to your attention that {cleaned_core.lower()}. "
                f"Please let me know if additional documentation or alignment is required to move forward effectively."
            )
        elif tone_lower == 'academic':
            transformed = (
                f"Empirical consideration suggests that {cleaned_core.lower()}. "
                f"Consequently, this premise provides a defensible theoretical foundation for subsequent qualitative inquiry."
            )
        elif tone_lower == 'friendly':
            transformed = (
                f"Hey there! Just wanted to share that {cleaned_core.lower()}. "
                f"Hope this helps, and I'd love to chat more about it whenever you're free! 😊"
            )
        elif tone_lower == 'formal':
            transformed = (
                f"It is respectfully submitted that {cleaned_core.lower()}. "
                f"Your esteemed consideration regarding this matter would be sincerely appreciated."
            )
        elif tone_lower == 'casual':
            transformed = (
                f"So basically, {cleaned_core.lower()}. Pretty straightforward once you look at it that way!"
            )
        elif tone_lower == 'creative':
            transformed = (
                f"Picture this: amidst the constant buzz of ambition, {cleaned_core.lower()}! "
                f"It is a spark of inspiration reshaping how the entire story unfolds."
            )
        elif tone_lower == 'persuasive':
            transformed = (
                f"Now is the decisive moment to act: {cleaned_core.lower()}. "
                f"By seizing this opportunity today, you gain an undeniable competitive advantage that guarantees long-term returns."
            )
        elif tone_lower == 'simple':
            transformed = (
                f"In simple words, {cleaned_core.lower()}. This is easy to understand and apply right away."
            )
        else:
            transformed = f"Regarding your input: {cleaned_core}. This has been carefully adapted into a {target_tone} tone."

        return {
            'original_text': text,
            'transformed_text': transformed,
            'target_tone': target_tone,
            'original_word_count': orig_words,
            'transformed_word_count': count_words(transformed),
            'is_demo': True
        }

# Global singleton service instance
ai_service = AIService()
