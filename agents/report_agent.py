import json
import time
import random
import traceback
import requests
from typing import Dict, List, Any, Optional

class ReportAgent:
    def __init__(self):
        self.api_url = "http://localhost:11434/api/generate"
        self.model = "llama3"
        print(f"🔍 ReportAgent initialized with model: {self.model}")

    def generate_combined_report(self, chat_history, journal_data, user_id):
        print(f"\n{'='*80}")
        print(f"📊 GENERATING COMBINED REPORT FOR USER: {user_id}")
        print(f"{'='*80}")
        
        start_time = time.time()
        
        # Log the data we're working with
        print(f"📌 Chat history: {len(chat_history)} messages")
        print(f"📌 Journal data: {len(journal_data)} entries")
        
        # Detailed logging of chat history
        self._log_chat_history(chat_history)
        
        # Detailed logging of journal data
        self._log_journal_data(journal_data)
        
        # If there's no data, return a default response
        if not chat_history and not journal_data:
            print("⚠️ No data available for analysis")
            default_response = self._get_empty_data_report()
            print(f"⚠️ Returning default response due to lack of data")
            return default_response
        
        # Process the data
        try:
            # Extract emotions, themes, and moods from the data
            emotions, themes, moods = self._extract_data_from_inputs(chat_history, journal_data)
            
            # Count frequency of emotions and themes
            emotion_counts = self._count_items(emotions)
            theme_counts = self._count_items(themes)
            mood_counts = self._count_items(moods)
            
            # Log the extracted data
            print(f"\n📊 EXTRACTED DATA SUMMARY")
            print(f"{'='*50}")
            print(f"📌 Extracted {len(emotions)} emotions, {len(themes)} themes, and {len(moods)} moods")
            
            # Log top emotions
            print(f"\n📌 Top emotions:")
            for emotion, count in sorted(emotion_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
                print(f"   - {emotion}: {count}")
            
            # Log top themes
            print(f"\n📌 Top themes:")
            for theme, count in sorted(theme_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
                print(f"   - {theme}: {count}")
            
            # Log mood distribution
            print(f"\n📌 Mood distribution:")
            for mood, count in sorted(mood_counts.items(), key=lambda x: x[1], reverse=True):
                print(f"   - {mood}: {count}")
            
            # Prepare the prompt for the LLM
            prompt = self._create_analysis_prompt(chat_history, journal_data, emotion_counts, theme_counts, mood_counts)
            
            print(f"\n🔄 GENERATING ANALYSIS")
            print(f"{'='*50}")
            print(f"📌 Sending prompt to LLM (length: {len(prompt)} characters)")
            
            # Log a truncated version of the prompt
            max_prompt_log_length = 1000
            if len(prompt) > max_prompt_log_length:
                print(f"📌 Prompt preview (first {max_prompt_log_length} chars):")
                print(f"{prompt[:max_prompt_log_length]}...")
            else:
                print(f"📌 Full prompt:")
                print(f"{prompt}")
            
            # Call the LLM to generate the analysis
            try:
                response = requests.post(
                    self.api_url,
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.7,
                            "top_p": 0.9,
                            "max_tokens": 2000
                        }
                    },
                    timeout=30  # Add a timeout to prevent hanging
                )
                
                if response.status_code != 200:
                    print(f"❌ LLM API error: {response.status_code}")
                    print(f"❌ Response: {response.text}")
                    
                    # Fallback to a simpler analysis based on the extracted data
                    print(f"⚠️ Using fallback analysis generation")
                    analysis_result = self._generate_fallback_analysis(emotion_counts, theme_counts, mood_counts)
                else:
                    # Parse the LLM response
                    llm_response = response.json()
                    llm_text = llm_response.get("response", "")
                    
                    print(f"✅ LLM response received (length: {len(llm_text)} characters)")
                    
                    # Log a truncated version of the response
                    max_response_log_length = 500
                    if len(llm_text) > max_response_log_length:
                        print(f"📌 Response preview (first {max_response_log_length} chars):")
                        print(f"{llm_text[:max_response_log_length]}...")
                    else:
                        print(f"📌 Full response:")
                        print(f"{llm_text}")
                    
                    # Try to extract JSON from the response
                    analysis_result = self._extract_json_from_text(llm_text)
                    
                    # If extraction failed, use the fallback
                    if not analysis_result:
                        print(f"⚠️ Could not extract valid JSON from LLM response, using fallback")
                        analysis_result = self._generate_fallback_analysis(emotion_counts, theme_counts, mood_counts)
            
            except requests.exceptions.Timeout:
                print(f"❌ LLM API timeout after 30 seconds")
                analysis_result = self._generate_fallback_analysis(emotion_counts, theme_counts, mood_counts)
            except requests.exceptions.RequestException as e:
                print(f"❌ LLM API request error: {str(e)}")
                analysis_result = self._generate_fallback_analysis(emotion_counts, theme_counts, mood_counts)
            except Exception as e:
                print(f"❌ Unexpected error calling LLM: {str(e)}")
                print(f"❌ Traceback: {traceback.format_exc()}")
                analysis_result = self._generate_fallback_analysis(emotion_counts, theme_counts, mood_counts)
        
        except Exception as e:
            print(f"❌ Error processing data: {str(e)}")
            print(f"❌ Traceback: {traceback.format_exc()}")
            analysis_result = self._get_fallback_report()
        
        # Log the final analysis result
        print(f"\n📊 FINAL ANALYSIS RESULT")
        print(f"{'='*50}")
        self._log_analysis_result(analysis_result)
        
        end_time = time.time()
        time_taken = end_time - start_time
        print(f"✅ Combined analysis generated in {time_taken:.2f} seconds")
        print(f"{'='*80}\n")
        
        return analysis_result

    def _log_chat_history(self, chat_history):
        """Log detailed information about the chat history"""
        if not chat_history:
            print("📌 No chat history provided")
            return
        
        print(f"\n📊 CHAT HISTORY DETAILS")
        print(f"{'='*50}")
        
        # Count messages by role
        role_counts = {}
        for msg in chat_history:
            role = msg.get('role', 'unknown')
            role_counts[role] = role_counts.get(role, 0) + 1
        
        print(f"📌 Message count by role:")
        for role, count in role_counts.items():
            print(f"   - {role}: {count}")
        
        # Log sample messages
        print(f"\n📌 Sample messages (up to 5):")
        for i, msg in enumerate(chat_history[:5]):
            role = msg.get('role', 'unknown')
            content = msg.get('content', '')
            timestamp = msg.get('timestamp', 'unknown')
            
            # Truncate long messages
            if len(content) > 100:
                content_preview = content[:100] + "..."
            else:
                content_preview = content
            
            print(f"   {i+1}. [{timestamp}] {role}: {content_preview}")
        
        # Calculate total content length
        total_content_length = sum(len(msg.get('content', '')) for msg in chat_history)
        avg_content_length = total_content_length / len(chat_history) if chat_history else 0
        
        print(f"\n📌 Content statistics:")
        print(f"   - Total content length: {total_content_length} characters")
        print(f"   - Average message length: {avg_content_length:.2f} characters")
        
        # Log session information if available
        sessions = set()
        for msg in chat_history:
            session_id = msg.get('sessionId')
            if session_id:
                sessions.add(session_id)
        
        if sessions:
            print(f"\n📌 Messages from {len(sessions)} different sessions")

    def _log_journal_data(self, journal_data):
        """Log detailed information about the journal data"""
        if not journal_data:
            print("📌 No journal data provided")
            return
        
        print(f"\n📊 JOURNAL DATA DETAILS")
        print(f"{'='*50}")
        
        # Count entries with analysis
        entries_with_analysis = sum(1 for entry in journal_data if entry.get('analysis'))
        
        print(f"📌 Journal statistics:")
        print(f"   - Total entries: {len(journal_data)}")
        print(f"   - Entries with analysis: {entries_with_analysis}")
        print(f"   - Entries without analysis: {len(journal_data) - entries_with_analysis}")
        
        # Log moods if available
        moods = [entry.get('mood') for entry in journal_data if entry.get('mood')]
        mood_counts = {}
        for mood in moods:
            mood_counts[mood] = mood_counts.get(mood, 0) + 1
        
        if mood_counts:
            print(f"\n📌 Mood distribution:")
            for mood, count in sorted(mood_counts.items(), key=lambda x: x[1], reverse=True):
                print(f"   - {mood}: {count}")
        
        # Log sample entries
        print(f"\n📌 Sample entries (up to 5):")
        for i, entry in enumerate(journal_data[:5]):
            entry_id = entry.get('id', 'unknown')
            content = entry.get('content', '')
            mood = entry.get('mood', 'unknown')
            timestamp = entry.get('timestamp', 'unknown')
            has_analysis = entry.get('analysis') is not None
            
            # Truncate long content
            if len(content) > 100:
                content_preview = content[:100] + "..."
            else:
                content_preview = content
            
            print(f"   {i+1}. ID: {entry_id}, Mood: {mood}, Has Analysis: {has_analysis}")
            print(f"      Timestamp: {timestamp}")
            print(f"      Content: {content_preview}")
            
            # Log analysis preview if available
            if has_analysis:
                analysis = entry.get('analysis')
                if isinstance(analysis, str):
                    try:
                        analysis = json.loads(analysis)
                    except:
                        analysis = {"error": "Could not parse analysis JSON"}
                
                if isinstance(analysis, dict):
                    emotions = analysis.get('emotions', [])
                    themes = analysis.get('themes', [])
                    print(f"      Analysis: {len(emotions)} emotions, {len(themes)} themes")
                    if emotions:
                        print(f"      Top emotions: {', '.join(emotions[:3])}")
                    if themes:
                        print(f"      Top themes: {', '.join(themes[:3])}")
        
        # Calculate total content length
        total_content_length = sum(len(entry.get('content', '')) for entry in journal_data)
        avg_content_length = total_content_length / len(journal_data) if journal_data else 0
        
        print(f"\n📌 Content statistics:")
        print(f"   - Total content length: {total_content_length} characters")
        print(f"   - Average entry length: {avg_content_length:.2f} characters")

    def _extract_data_from_inputs(self, chat_history, journal_data):
        """Extract emotions, themes, and moods from chat history and journal data"""
        emotions = []
        themes = []
        moods = []
        
        # Extract from chat history
        for msg in chat_history:
            if msg.get('role') == 'USER':
                content = msg.get('content', '')
                if content:
                    # Extract emotions and themes from content
                    extracted_emotions = self._extract_emotions_from_text(content)
                    extracted_themes = self._extract_themes_from_text(content)
                    emotions.extend(extracted_emotions)
                    themes.extend(extracted_themes)
        
        # Extract from journal data
        for entry in journal_data:
            # Add mood if available
            mood = entry.get('mood')
            if mood:
                moods.append(mood)
            
            # Extract from analysis if available
            analysis = entry.get('analysis')
            if analysis:
                if isinstance(analysis, str):
                    try:
                        analysis = json.loads(analysis)
                    except:
                        analysis = {}
                
                if isinstance(analysis, dict):
                    entry_emotions = analysis.get('emotions', [])
                    entry_themes = analysis.get('themes', [])
                    
                    if entry_emotions and isinstance(entry_emotions, list):
                        emotions.extend(entry_emotions)
                    
                    if entry_themes and isinstance(entry_themes, list):
                        themes.extend(entry_themes)
            
            # Extract from content if no analysis or as backup
            content = entry.get('content', '')
            if content:
                # Extract emotions and themes from content
                if not analysis or not analysis.get('emotions'):
                    extracted_emotions = self._extract_emotions_from_text(content)
                    emotions.extend(extracted_emotions)
                
                if not analysis or not analysis.get('themes'):
                    extracted_themes = self._extract_themes_from_text(content)
                    themes.extend(extracted_themes)
        
        return emotions, themes, moods

    def _count_items(self, items):
        """Count occurrences of items in a list"""
        counts = {}
        for item in items:
            counts[item] = counts.get(item, 0) + 1
        return counts

    def _extract_emotions_from_text(self, text):
        """Extract emotions from text"""
        # This is a simplified implementation
        # In a real-world scenario, you would use NLP or ML models
        
        emotion_keywords = {
            "happy": ["happy", "joy", "delighted", "pleased", "content", "satisfied"],
            "sad": ["sad", "unhappy", "depressed", "down", "blue", "gloomy"],
            "angry": ["angry", "mad", "furious", "irritated", "annoyed", "frustrated"],
            "anxious": ["anxious", "worried", "nervous", "uneasy", "concerned", "stressed"],
            "calm": ["calm", "peaceful", "relaxed", "serene", "tranquil", "composed"],
            "excited": ["excited", "thrilled", "enthusiastic", "eager", "animated"],
            "tired": ["tired", "exhausted", "fatigued", "drained", "sleepy"],
            "grateful": ["grateful", "thankful", "appreciative", "blessed"],
            "confused": ["confused", "puzzled", "perplexed", "uncertain", "unsure"],
            "hopeful": ["hopeful", "optimistic", "positive", "encouraged"],
            "overwhelmed": ["overwhelmed", "swamped", "overloaded", "burdened"],
            "proud": ["proud", "accomplished", "satisfied", "fulfilled"]
        }
        
        # Count occurrences of emotion keywords
        emotion_counts = {}
        text_lower = text.lower()
        
        for emotion, keywords in emotion_keywords.items():
            count = 0
            for keyword in keywords:
                count += text_lower.count(keyword)
            if count > 0:
                emotion_counts[emotion] = count
        
        # Sort by frequency
        sorted_emotions = sorted(emotion_counts.items(), key=lambda x: x[1], reverse=True)
        
        # Return emotions
        return [emotion for emotion, _ in sorted_emotions]

    def _extract_themes_from_text(self, text):
        """Extract themes from text"""
        # This is a simplified implementation
        # In a real-world scenario, you would use NLP or ML models
        
        theme_keywords = {
            "work": ["work", "job", "career", "office", "professional", "colleague"],
            "relationships": ["relationship", "friend", "family", "partner", "spouse", "love"],
            "health": ["health", "wellness", "exercise", "diet", "sleep", "medical"],
            "personal growth": ["growth", "improvement", "learning", "development", "progress"],
            "stress": ["stress", "pressure", "tension", "overwhelm", "burnout"],
            "self-care": ["self-care", "relax", "rest", "recharge", "break", "me time"],
            "mindfulness": ["mindful", "present", "aware", "conscious", "meditation"],
            "goals": ["goal", "objective", "target", "aim", "aspiration", "achievement"],
            "creativity": ["creative", "art", "write", "music", "express", "imagination"],
            "balance": ["balance", "harmony", "equilibrium", "stability"],
            "change": ["change", "transition", "shift", "adjust", "adapt"],
            "gratitude": ["gratitude", "thankful", "appreciate", "blessing"]
        }
        
        # Count occurrences of theme keywords
        theme_counts = {}
        text_lower = text.lower()
        
        for theme, keywords in theme_keywords.items():
            count = 0
            for keyword in keywords:
                count += text_lower.count(keyword)
            if count > 0:
                theme_counts[theme] = count
        
        # Sort themes by count
        sorted_themes = sorted(theme_counts.items(), key=lambda x: x[1], reverse=True)
        
        # Return themes
        return [theme for theme, _ in sorted_themes]

    def _create_analysis_prompt(self, chat_history, journal_data, emotion_counts, theme_counts, mood_counts):
        """Create a prompt for the LLM to generate an analysis"""
        # Create a summary of the data for the prompt
        chat_summary = f"Chat history contains {len(chat_history)} messages."
        journal_summary = f"Journal data contains {len(journal_data)} entries."
        
        # Get the top emotions and themes
        top_emotions = sorted(emotion_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        top_themes = sorted(theme_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        emotions_summary = ", ".join([f"{emotion} ({count})" for emotion, count in top_emotions])
        themes_summary = ", ".join([f"{theme} ({count})" for theme, count in top_themes])
        
        # Get the most common mood
        most_common_mood = max(mood_counts.items(), key=lambda x: x[1])[0] if mood_counts else "unknown"
        
        # Sample some recent messages and journal entries
        recent_messages = chat_history[-10:] if len(chat_history) > 10 else chat_history
        recent_entries = journal_data[-5:] if len(journal_data) > 5 else journal_data
        
        message_samples = "\n".join([
            f"- {msg.get('role', 'unknown')}: {msg.get('content', '')[:100]}..." 
            for msg in recent_messages if msg.get('role') == 'USER'
        ])
        
        entry_samples = "\n".join([
            f"- Entry {i+1} (Mood: {entry.get('mood', 'unknown')}): {entry.get('content', '')[:100]}..." 
            for i, entry in enumerate(recent_entries)
        ])
        
        # Construct the prompt
        prompt = f"""You are an AI mental health assistant analyzing user data to provide insights.

DATA SUMMARY:
{chat_summary}
{journal_summary}
Most frequent emotions: {emotions_summary}
Most frequent themes: {themes_summary}
Most common mood: {most_common_mood}

SAMPLE CHAT MESSAGES:
{message_samples}

SAMPLE JOURNAL ENTRIES:
{entry_samples}

Based on this data, generate a comprehensive analysis of the user's mental state, emotional patterns, and provide helpful insights.
Your response must be in valid JSON format with the following structure:

{{
  "greeting": "A personalized greeting based on the user's data",
  "personality_analysis": "A brief analysis of the user's personality traits",
  "current_emotion": "The user's current dominant emotion",
  "progress": "An assessment of the user's progress in their mental health journey",
  "self_awareness": {{
    "score": A number between 0-100 representing the user's self-awareness level,
    "comment": "A comment explaining the score"
  }},
  "suggestion": "A helpful suggestion for the user to improve their mental well-being",
  "affirmation": "A positive affirmation tailored to the user's needs"
}}

Ensure your response is ONLY the JSON object with no additional text before or after.
"""
        return prompt

    def _extract_json_from_text(self, text):
        """Extract JSON from text"""
        try:
            # Look for JSON object between curly braces
            start_idx = text.find('{')
            end_idx = text.rfind('}') + 1
            
            if start_idx >= 0 and end_idx > start_idx:
                json_str = text[start_idx:end_idx]
                return json.loads(json_str)
            
            return None
        except json.JSONDecodeError:
            print(f"⚠️ JSON decode error when extracting from text")
            return None
        except Exception as e:
            print(f"⚠️ Error extracting JSON: {str(e)}")
            return None

    def _generate_fallback_analysis(self, emotion_counts, theme_counts, mood_counts):
        """Generate a fallback analysis based on the extracted data"""
        print(f"📌 Generating fallback analysis from extracted data")
        
        # Determine the dominant emotion
        dominant_emotion = max(emotion_counts.items(), key=lambda x: x[1])[0] if emotion_counts else "neutral"
        
        # Determine the dominant theme
        dominant_theme = max(theme_counts.items(), key=lambda x: x[1])[0] if theme_counts else "general"
        
        # Determine the dominant mood
        dominant_mood = max(mood_counts.items(), key=lambda x: x[1])[0] if mood_counts else "neutral"
        
        # Map emotions to personality traits
        personality_traits = {
            "joy": "optimistic",
            "happiness": "positive",
            "sadness": "reflective",
            "anger": "passionate",
            "fear": "cautious",
            "anxiety": "detail-oriented",
            "gratitude": "appreciative",
            "love": "compassionate",
            "hope": "forward-thinking",
            "pride": "confident"
        }
        
        # Determine personality based on dominant emotion
        personality = personality_traits.get(dominant_emotion.lower(), "thoughtful")
        
        # Generate a self-awareness score based on the variety of emotions and themes
        emotion_variety = min(len(emotion_counts), 10) * 5
        theme_variety = min(len(theme_counts), 10) * 5
        self_awareness_score = min(emotion_variety + theme_variety, 100)
        
        # Generate suggestions based on dominant theme
        suggestions = {
            "work": "Consider setting clearer boundaries between work and personal time.",
            "relationships": "Investing time in meaningful connections can boost your emotional well-being.",
            "health": "Regular physical activity might help balance your emotional state.",
            "stress": "Try incorporating mindfulness practices into your daily routine.",
            "growth": "Continue your self-reflection journey through journaling.",
            "goals": "Breaking down your goals into smaller steps might reduce overwhelm.",
            "family": "Open communication with family members could strengthen your support system.",
            "general": "Regular journaling and reflection can help you gain deeper insights."
        }
        
        suggestion = suggestions.get(dominant_theme.lower(), suggestions["general"])
        
        # Generate affirmations based on dominant emotion
        affirmations = {
            "joy": "I embrace the joy in my life and share it with others.",
            "happiness": "I deserve happiness and create it in my daily life.",
            "sadness": "My feelings are valid, and this moment will pass.",
            "anger": "I can transform my passion into positive action.",
            "fear": "I am stronger than my fears and face challenges with courage.",
            "anxiety": "I breathe in calmness and breathe out tension.",
            "gratitude": "I appreciate the abundance in my life.",
            "love": "I am worthy of love and give love freely.",
            "hope": "Each day brings new opportunities for growth and happiness.",
            "pride": "I celebrate my achievements while remaining humble.",
            "neutral": "I am on a journey of self-discovery and growth."
        }
        
        affirmation = affirmations.get(dominant_emotion.lower(), affirmations["neutral"])
        
        # Create the analysis result
        analysis = {
            "greeting": f"Welcome to your insights dashboard. Your recent entries show a focus on {dominant_theme}.",
            "personality_analysis": personality,
            "current_emotion": dominant_emotion,
            "progress": f"You've been expressing a range of emotions, with {dominant_emotion} being most prominent. Your journals often discuss {dominant_theme}.",
            "self_awareness": {
                "score": self_awareness_score,
                "comment": f"Your ability to identify and express various emotions shows good self-awareness. You've recognized {len(emotion_counts)} distinct emotions in your entries."
            },
            "suggestion": suggestion,
            "affirmation": affirmation
        }
        
        print(f"✅ Fallback analysis generated successfully")
        return analysis

    def _log_analysis_result(self, analysis):
        """Log the analysis result"""
        if not analysis:
            print("⚠️ No analysis result to log")
            return
        
        try:
            print(f"📌 Analysis result structure:")
            for key, value in analysis.items():
                if key == "self_awareness" and isinstance(value, dict):
                    print(f"   - {key}:")
                    print(f"     - score: {value.get('score')}")
                    comment = value.get('comment', '')
                    if len(comment) > 50:
                        print(f"     - comment: {comment[:50]}...")
                    else:
                        print(f"     - comment: {comment}")
                else:
                    if isinstance(value, str) and len(value) > 50:
                        print(f"   - {key}: {value[:50]}...")
                    else:
                        print(f"   - {key}: {value}")
        except Exception as e:
            print(f"⚠️ Error logging analysis result: {str(e)}")

    def _get_empty_data_report(self):
        """Return a report for when no data is available"""
        return {
            "greeting": "Welcome to your insights dashboard.",
            "personality_analysis": "analytical",
            "current_emotion": "neutral",
            "progress": "You're just getting started. Add more data by chatting with your AI companion or writing journal entries.",
            "self_awareness": {
                "score": 50,
                "comment": "As you share more, we'll provide deeper insights about your emotional patterns."
            },
            "suggestion": "Try using the AI companion chat or journal features regularly to build a more accurate analysis of your emotional well-being.",
            "affirmation": "Every step I take to understand myself better is valuable progress."
        }

    def _get_fallback_report(self):
        """Return a fallback report if an error occurs"""
        return {
            "greeting": "Welcome to your wellness insights.",
            "personality_analysis": "reflective, thoughtful, introspective",
            "current_emotion": "neutral",
            "progress": "You're taking important steps by reflecting on your experiences and emotions.",
            "self_awareness": {
                "score": 65,
                "comment": "Your engagement with journaling and conversation shows a commitment to self-understanding."
            },
            "suggestion": "Consider setting aside 5-10 minutes each day for reflection. Regular check-ins with yourself can help you identify patterns in your thoughts and emotions, leading to greater self-awareness and emotional regulation.",
            "affirmation": "I am growing in awareness and understanding every day."
        }


if __name__ == "__main__":
    print("\n===== Running Standalone ReportAgent Test =====")
    
    agent = ReportAgent()
    
    # Test with empty data
    print("\nTesting with empty data:")
    report = agent.generate_combined_report([], [])
    print(f"Report type: {type(report)}")
    print(f"Report has greeting: {'greeting' in report}")
    
    # Test with sample data
    print("\nTesting with sample data:")
    
    # Sample chat data
    chat_data = [
        {"role": "USER", "content": "I've been feeling stressed lately", "timestamp": "2023-05-01T10:30:00Z"},
        {"role": "ASSISTANT", "content": "I'm sorry to hear that. What's been causing your stress?", "timestamp": "2023-05-01T10:30:30Z"},
        {"role": "USER", "content": "Work deadlines and not enough sleep", "timestamp": "2023-05-01T10:31:00Z"}
    ]
    
    # Sample journal data
    journal_data = [
        {
            "id": "1",
            "title": "Feeling overwhelmed",
            "content": "Today was a difficult day...",
            "mood": "stressed",
            "timestamp": "2023-05-02T20:00:00Z",
            "analysis": {
                "emotions": ["overwhelmed", "anxious"],
                "themes": ["work pressure", "self-care"],
                "insights": ["I need to set better boundaries"],
                "recommendations": ["Take regular breaks"]
            }
        }
    ]
    
    report = agent.generate_combined_report(chat_data, journal_data, "test-user")
    
    print("\n===== Final Combined Report =====")
    import pprint
    pprint.pprint(report, sort_dicts=False)
    print("\nTest complete.")
