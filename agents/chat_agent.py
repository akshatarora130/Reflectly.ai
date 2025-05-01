import json
import os
import time
import sys
import subprocess
import random

class ChatAgent:
    def __init__(self):
        # Use mistral:latest as specified
        self.model = "mistral:latest"
        
        print(f"🚀 Initializing Multi-Agent ChatAgent with model: {self.model}")
        print(f"🤖 Multiple specialized agents will collaborate to generate responses")
        
        # Check if Ollama is installed and the model is available
        self._check_ollama_status()
    def _check_ollama_status(self):
        """Simulate checking Ollama status without making actual API calls"""
        print("🔍 Checking Ollama installation")
        try:
            result = subprocess.run(
                ['ollama', 'list'],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=10
            )
            
            if result.returncode == 0:
                output = result.stdout.decode('utf-8')
                print(f"✅ Ollama is installed and running")
                print(f"📋 Available models: {output.strip()}")
                
                if self.model not in output:
                    print(f"⚠️ Model {self.model} might not be available. Please ensure it's pulled.")
                else:
                    print(f"✅ Model {self.model} appears to be available")
            else:
                error = result.stderr.decode('utf-8')
                print(f"⚠️ Warning: Ollama CLI returned error: {error}")
        except Exception as e:
            print(f"⚠️ Warning: Error checking Ollama status: {str(e)}")
            print(f"⚠️ Make sure Ollama is installed and in your PATH")
    
    def ollama_generate(self, prompt, history=None):
        """Generate a response using Ollama CLI"""
        try:
            print(f"🔄 Calling Ollama CLI with model {self.model}")
            
            # Format history if provided
            history_text = ""
            if history and len(history) > 0:
                for turn in history[-6:]:  # Use last 6 turns for context
                    role = "User" if turn['role'] == 'USER' else "Assistant"
                    history_text += f"{role}: {turn['content']}\n"
            
            full_prompt = f"""
Here is the recent conversation:

{history_text}

Now based on the current input:

{prompt}
"""
            
            # Call Ollama CLI
            result = subprocess.run(
                ['ollama', 'run', self.model],
                input=full_prompt.encode('utf-8'),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=120
            )
            
            if result.returncode == 0:
                response = result.stdout.decode('utf-8').strip()
                print(f"✅ Generated response ({len(response)} chars)")
                return response
            else:
                error = result.stderr.decode('utf-8')
                print(f"❌ Ollama CLI error: {error}")
                return f"I'm sorry, I encountered an issue while processing your request. Error: {error}"
                
        except subprocess.TimeoutExpired:
            print("❌ Ollama process timed out after 120 seconds")
            return "I'm sorry, it's taking me longer than expected to respond. Could you try again with a simpler question?"
        except Exception as e:
            print(f"❌ Error calling Ollama: {str(e)}")
            return f"I'm sorry, I'm having trouble connecting to the language model. Error: {str(e)}"
    
    # Agent 1: Emotion Detector
    def emotion_detector(self, entry, history):
        prompt = f"""
You are an emotion detection expert. Analyze the following user input and identify the primary emotions expressed. Return a JSON object with a list of emotions (e.g., ["sad", "stressed"]).
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.
Input: "{entry}"

Respond ONLY with JSON: {{ "emotions": ["emotion1", "emotion2", ...] }}
"""
        try:
            response = self.ollama_generate(prompt, history=history)
            # Extract JSON from response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = response[json_start:json_end]
                return json.loads(json_str)
            return {"emotions": ["neutral"]}
        except:
            print("❌ Error parsing emotion detector response")
            return {"emotions": ["neutral"]}

    # Agent 2: Theme Extractor
    def theme_extractor(self, entry, emotions, history):
        prompt = f"""
You are a mental health analyst. Extract key emotional and mental themes from this user input, considering the detected emotions.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.
Input: "{entry}"
Emotions: {emotions}

Respond ONLY with JSON: {{ "themes": ["theme1", "theme2", ...] }}
"""
        try:
            response = self.ollama_generate(prompt, history=history)
            # Extract JSON from response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = response[json_start:json_end]
                return json.loads(json_str)
            return {"themes": ["general"]}
        except:
            print("❌ Error parsing theme extractor response")
            return {"themes": ["general"]}

    # Agent 3: Therapy Agent
    def therapy_agent(self, entry, emotions, themes, history):
        prompt = f"""
You are a compassionate therapist. Provide a supportive, empathetic response to the user's input, addressing their emotions and themes.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Emotions: {emotions}
Themes: {themes}

Respond with a concise, empathetic message (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)

    # Agent 4: Casual Chat Agent
    def casual_chat_agent(self, entry, history):
        prompt = f"""
You are a friendly, casual companion. Respond to the user's input with a lighthearted, engaging message. Keep it conversational and fun.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.
IMPORTANT: Provide ONLY ONE short message. Do not give multiple options, variations, or alternatives.

Input: "{entry}"

Respond with a SINGLE short, friendly message.
"""
        return self.ollama_generate(prompt, history=history)

    # Agent 5: Wellness Advisor
    def wellness_advisor_agent(self, entry, themes, history):
        prompt = f"""
You are a wellness coach. Provide practical wellness advice (e.g., relaxation techniques, self-care tips) based on the user's input and themes.
Try to be as human as possible don't say you are computer generated or AI. Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Themes: {themes}

Respond with a concise, actionable suggestion.
"""
        return self.ollama_generate(prompt, history=history)

    # Agent 6: Mindfulness Agent
    def mindfulness_agent(self, entry, emotions, history):
        prompt = f"""
You are a mindfulness guide. Offer a brief mindfulness exercise (e.g., breathing, grounding technique) tailored to the user's emotions.
Try to be as human as possible don't say you are computer generated or AI.Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Emotions: {emotions}

Respond with a short, guided exercise (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)

    # Agent 7: Coping Strategy Agent
    def coping_strategy_agent(self, entry, emotions, themes, history):
        prompt = f"""
You are a mental health coach specializing in coping strategies. Ask user what makes them feel that specific way and then provide a specific, practical coping technique for the user's emotions and themes.Make it fast and concise but it should fulfil the query.
Input: "{entry}"
Emotions: {emotions}
Themes: {themes}
Try to be as human as possible don't say you are computer generated or AI.
Respond with a concise, actionable coping strategy (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)

    # Agent 8: CBT Agent
    def cbt_agent(self, entry, emotions, themes, history):
        prompt = f"""
You are a CBT therapist. Offer a cognitive-behavioral therapy technique (e.g., reframing negative thoughts) tailored to the user's emotions and themes.
Try to be as human as possible don't say you are computer generated or AI.Make it fast and concise but it should fulfil the query.
Input: "{entry}"
Emotions: {emotions}
Themes: {themes}

Respond with a concise CBT-based suggestion (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 9: Self Care Agent
    def self_care_agent(self, entry, emotions, history):
        prompt = f"""
You are a self-care advocate. Suggest a self-care activity to promote relaxation or well-being based on the user's input and emotions.Try to be as human as possible don't say you are computer generated or AI.Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Emotions: {emotions}

Respond with a short, soothing self-care suggestion.
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 10: Trauma Support Agent
    def trauma_support_agent(self, entry, emotions, themes, history):
        prompt = f"""
You are a trauma-informed counselor. Provide a gentle, grounding technique or supportive message for the user's emotions and themes.Try to be as human as possible don't say you are computer generated or AI.Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Emotions: {emotions}
Themes: {themes}

Respond with a concise, trauma-sensitive suggestion (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 11: Story Teller Agent
    def story_teller_agent(self, entry, emotions, themes, history):
        prompt = f"""
You are a creative storyteller. Write a short, engaging story snippet (3-5 sentences) inspired by the user's input, emotions, and themes.Try to be as human as possible don't say you are computer generated or AI.Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Emotions: {emotions}
Themes: {themes}

Respond with a concise story snippet.
"""
        return self.ollama_generate(prompt, history=history)

    # Agent 12: Poetry Agent
    def poetry_agent(self, entry, emotions, themes, history):
        prompt = f"""
You are a poet. Craft a short poem (4-6 lines) reflecting the user's emotions and themes. 
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.
Input: "{entry}"
Emotions: {emotions}
Themes: {themes}

Respond with a concise poem.
"""
        return self.ollama_generate(prompt, history=history)

    # Agent 13: Journal Prompt Agent
    def journal_prompt_agent(self, entry, emotions, themes, history):
        prompt = f"""
You are a journaling coach. Suggest a reflective journal prompt tailored to the user's emotions and themes.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.
Input: "{entry}"
Emotions: {emotions}
Themes: {themes}

Respond with a concise journal prompt (1-2 sentences).
"""
        return self.ollama_generate(prompt, history=history)

    # Agent 14: Humor Agent
    def humor_agent(self, entry, emotions, history):
        prompt = f"""
You are a comedian. Share a lighthearted joke or humorous comment based on the user's input and emotions.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.
Input: "{entry}"
Emotions: {emotions}

Respond with a short, funny message.
"""
        return self.ollama_generate(prompt, history=history)

    # Agent 15: Trivia Agent
    def trivia_agent(self, entry, themes, history):
        prompt = f"""
You are a trivia enthusiast. Share a fun fact or trivia question related to the user's input and themes.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.
Input: "{entry}"
Themes: {themes}

Respond with a concise trivia fact or question.
"""
        return self.ollama_generate(prompt, history=history)

    # Agent 16: Pop Culture Agent
    def pop_culture_agent(self, entry, themes, history):
        prompt = f"""
You are a pop culture expert. Offer a casual comment or recommendation about movies, music, or trends based on the user's input and themes.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.
Input: "{entry}"
Themes: {themes}

Respond with a short, relatable message.
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 17: Attack Support Agent
    def attack_support_agent(self, entry, themes, history):
        prompt = f"""
You are a attack support agent. Offer a solution for the user to heal from the attack based on the user's input and themes.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.
Input: "{entry}"
Themes: {themes}

Respond with a short, relatable message.
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 18: Motivation Agent
    def motivation_agent(self, entry, emotions, themes, history):
        prompt = f"""
You are a motivational coach. Provide an encouraging, uplifting message based on the user's input, emotions, and themes.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Emotions: {emotions}
Themes: {themes}

Respond with a concise, motivational message (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)

    # Agent 19: Gratitude Agent
    def gratitude_agent(self, entry, emotions, themes, history):
        prompt = f"""
You are a gratitude guide. Suggest a gratitude practice or perspective shift based on the user's input and emotional state.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Emotions: {emotions}
Themes: {themes}

Respond with a concise gratitude-focused suggestion (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)

    # Agent 20: Sleep Improvement Agent
    def sleep_improvement_agent(self, entry, emotions, themes, history):
        prompt = f"""
You are a sleep specialist. Offer advice for improving sleep quality based on the user's input, emotions, and themes.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Emotions: {emotions}
Themes: {themes}

Respond with a concise sleep improvement tip (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)

    # Agent 21: Nutrition Agent
    def nutrition_agent(self, entry, themes, history):
        prompt = f"""
You are a nutrition coach. Suggest a healthy eating tip or food choice related to the user's input and themes.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Themes: {themes}

Respond with a concise nutrition suggestion (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)

    # Agent 22: Exercise Agent
    def exercise_agent(self, entry, emotions, history):
        prompt = f"""
You are a fitness coach. Recommend a simple exercise or movement practice based on the user's input and emotional state.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Emotions: {emotions}

Respond with a concise exercise suggestion (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)

    # Agent 23: Relationship Advice Agent
    def relationship_advice_agent(self, entry, emotions, themes, history):
        prompt = f"""
You are a relationship counselor. Offer perspective or advice on interpersonal relationships based on the user's input.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Emotions: {emotions}
Themes: {themes}

Respond with concise relationship insight (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)

    # Agent 24: Career Guidance Agent
    def career_guidance_agent(self, entry, themes, history):
        prompt = f"""
You are a career coach. Provide professional development advice or perspective based on the user's input and themes.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Themes: {themes}

Respond with concise career guidance (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)

    # Agent 25: Financial Wellness Agent
    def financial_wellness_agent(self, entry, themes, history):
        prompt = f"""
You are a financial wellness coach. Offer a simple financial tip or perspective based on the user's input and themes.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Themes: {themes}

Respond with a concise financial wellness suggestion (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)

    # Agent 26: Creativity Spark Agent
    def creativity_spark_agent(self, entry, emotions, history):
        prompt = f"""
You are a creativity coach. Suggest a creative activity or exercise based on the user's input and emotional state.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Emotions: {emotions}

Respond with a concise creative suggestion (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)

    # Agent 27: Nature Connection Agent
    def nature_connection_agent(self, entry, emotions, history):
        prompt = f"""
You are a nature guide. Suggest a way to connect with nature based on the user's input and emotional state.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Emotions: {emotions}

Respond with a concise nature connection suggestion (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 28: Meditation Guide Agent
    def meditation_guide_agent(self, entry, emotions, history):
        prompt = f"""
You are a meditation teacher. Offer a brief meditation practice tailored to the user's emotional state and input.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Emotions: {emotions}

Respond with a concise meditation guidance (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 29: Philosophical Perspective Agent
    def philosophical_perspective_agent(self, entry, themes, history):
        prompt = f"""
You are a philosophical guide. Offer a thoughtful perspective or insight from philosophy related to the user's input and themes.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Themes: {themes}

Respond with a concise philosophical insight (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 30: Spiritual Guidance Agent
    def spiritual_guidance_agent(self, entry, emotions, themes, history):
        prompt = f"""
You are a spiritual guide. Offer a non-denominational spiritual perspective or practice related to the user's input.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Emotions: {emotions}
Themes: {themes}

Respond with a concise spiritual insight (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 31: Time Management Agent
    def time_management_agent(self, entry, themes, history):
        prompt = f"""
You are a productivity coach. Suggest a time management technique or perspective based on the user's input and themes.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Themes: {themes}

Respond with a concise time management tip (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 32: Learning Strategy Agent
    def learning_strategy_agent(self, entry, themes, history):
        prompt = f"""
You are a learning coach. Suggest an effective learning strategy or technique based on the user's input and themes.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Themes: {themes}

Respond with a concise learning strategy (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 33: Habit Formation Agent
    def habit_formation_agent(self, entry, themes, history):
        prompt = f"""
You are a habit coach. Suggest a technique for building or breaking habits based on the user's input and themes.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Themes: {themes}

Respond with a concise habit formation strategy (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 34: Conflict Resolution Agent
    def conflict_resolution_agent(self, entry, emotions, themes, history):
        prompt = f"""
You are a conflict resolution specialist. Offer a perspective or technique for resolving interpersonal conflict based on the user's input.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Emotions: {emotions}
Themes: {themes}

Respond with a concise conflict resolution strategy (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 35: Parenting Advice Agent
    def parenting_advice_agent(self, entry, themes, history):
        prompt = f"""
You are a parenting coach. Offer a perspective or technique for positive parenting based on the user's input and themes.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Themes: {themes}

Respond with concise parenting advice (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 36: Stress Management Agent
    def stress_management_agent(self, entry, emotions, history):
        prompt = f"""
You are a stress management specialist. Suggest a technique for managing stress based on the user's input and emotional state.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Emotions: {emotions}

Respond with a concise stress management technique (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 37: Positive Psychology Agent
    def positive_psychology_agent(self, entry, emotions, history):
        prompt = f"""
You are a positive psychology coach. Suggest a practice from positive psychology based on the user's input and emotional state.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Emotions: {emotions}

Respond with a concise positive psychology practice (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 38: Emotional Intelligence Agent
    def emotional_intelligence_agent(self, entry, emotions, history):
        prompt = f"""
You are an emotional intelligence coach. Offer insight or a technique for developing emotional awareness based on the user's input.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Emotions: {emotions}

Respond with a concise emotional intelligence insight (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 39: Social Skills Agent
    def social_skills_agent(self, entry, themes, history):
        prompt = f"""
You are a social skills coach. Suggest a technique or perspective for improving social interactions based on the user's input.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Themes: {themes}

Respond with a concise social skills tip (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 40: Confidence Building Agent
    def confidence_building_agent(self, entry, emotions, history):
        prompt = f"""
You are a confidence coach. Suggest a technique or perspective for building self-confidence based on the user's input.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Emotions: {emotions}

Respond with a concise confidence-building strategy (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 41: Decision Making Agent
    def decision_making_agent(self, entry, themes, history):
        prompt = f"""
You are a decision-making coach. Suggest a framework or technique for making better decisions based on the user's input.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Themes: {themes}

Respond with a concise decision-making strategy (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 42: Goal Setting Agent
    def goal_setting_agent(self, entry, themes, history):
        prompt = f"""
You are a goal-setting coach. Suggest an effective approach to setting and achieving goals based on the user's input.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Themes: {themes}

Respond with a concise goal-setting strategy (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 43: Resilience Building Agent
    def resilience_building_agent(self, entry, emotions, themes, history):
        prompt = f"""
You are a resilience coach. Suggest a technique or perspective for building emotional resilience based on the user's input.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Emotions: {emotions}
Themes: {themes}

Respond with a concise resilience-building strategy (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 44: Forgiveness Agent
    def forgiveness_agent(self, entry, emotions, themes, history):
        prompt = f"""
You are a forgiveness coach. Offer a perspective or technique for practicing forgiveness based on the user's input.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Emotions: {emotions}
Themes: {themes}

Respond with a concise forgiveness practice (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 45: Compassion Agent
    def compassion_agent(self, entry, emotions, history):
        prompt = f"""
You are a compassion coach. Suggest a practice for developing self-compassion or compassion for others based on the user's input.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Emotions: {emotions}

Respond with a concise compassion practice (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 46: Boundary Setting Agent
    def boundary_setting_agent(self, entry, themes, history):
        prompt = f"""
You are a boundaries coach. Suggest a technique or perspective for setting healthy boundaries based on the user's input.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Themes: {themes}

Respond with a concise boundary-setting strategy (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 47: Communication Skills Agent
    def communication_skills_agent(self, entry, themes, history):
        prompt = f"""
You are a communication coach. Suggest a technique for improving communication based on the user's input and themes.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Themes: {themes}

Respond with a concise communication tip (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 48: Assertiveness Agent
    def assertiveness_agent(self, entry, themes, history):
        prompt = f"""
You are an assertiveness coach. Suggest a technique for being more assertive in communication based on the user's input.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Themes: {themes}

Respond with a concise assertiveness strategy (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 49: Anger Management Agent
    def anger_management_agent(self, entry, emotions, history):
        prompt = f"""
You are an anger management specialist. Suggest a technique for managing anger based on the user's input and emotional state.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Emotions: {emotions}

Respond with a concise anger management technique (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 50: Anxiety Management Agent
    def anxiety_management_agent(self, entry, emotions, history):
        prompt = f"""
You are an anxiety management specialist. Suggest a technique for managing anxiety based on the user's input and emotional state.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Emotions: {emotions}

Respond with a concise anxiety management technique (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 51: Grief Support Agent
    def grief_support_agent(self, entry, emotions, history):
        prompt = f"""
You are a grief counselor. Offer a supportive perspective or technique for processing grief based on the user's input.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Emotions: {emotions}

Respond with a concise grief support message (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 52: Addiction Recovery Agent
    def addiction_recovery_agent(self, entry, themes, history):
        prompt = f"""
You are an addiction recovery specialist. Offer a supportive perspective or technique for recovery based on the user's input.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Themes: {themes}

Respond with a concise recovery support message (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 53: Loneliness Support Agent
    def loneliness_support_agent(self, entry, emotions, history):
        prompt = f"""
You are a loneliness support specialist. Offer a perspective or technique for managing feelings of loneliness based on the user's input.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Emotions: {emotions}

Respond with a concise loneliness support message (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 54: Body Image Agent
    def body_image_agent(self, entry, emotions, themes, history):
        prompt = f"""
You are a body image coach. Offer a perspective or technique for developing a healthier relationship with one's body based on the user's input.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Emotions: {emotions}
Themes: {themes}

Respond with a concise body image support message (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 55: Perfectionism Management Agent
    def perfectionism_management_agent(self, entry, themes, history):
        prompt = f"""
You are a perfectionism coach. Suggest a technique for managing perfectionist tendencies based on the user's input.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Themes: {themes}

Respond with a concise perfectionism management strategy (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 56: Procrastination Management Agent
    def procrastination_management_agent(self, entry, themes, history):
        prompt = f"""
You are a procrastination coach. Suggest a technique for overcoming procrastination based on the user's input.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Themes: {themes}

Respond with a concise procrastination management strategy (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 57: Imposter Syndrome Agent
    def imposter_syndrome_agent(self, entry, emotions, themes, history):
        prompt = f"""
You are an imposter syndrome coach. Offer a perspective or technique for managing imposter syndrome based on the user's input.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Emotions: {emotions}
Themes: {themes}

Respond with a concise imposter syndrome management strategy (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 58: Digital Wellbeing Agent
    def digital_wellbeing_agent(self, entry, themes, history):
        prompt = f"""
You are a digital wellbeing coach. Suggest a technique for maintaining a healthy relationship with technology based on the user's input.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Themes: {themes}

Respond with a concise digital wellbeing strategy (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 59: Work-Life Balance Agent
    def work_life_balance_agent(self, entry, themes, history):
        prompt = f"""
You are a work-life balance coach. Suggest a technique for maintaining healthy boundaries between work and personal life based on the user's input.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Themes: {themes}

Respond with a concise work-life balance strategy (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    
    # Agent 60: Environmental Wellness Agent
    def environmental_wellness_agent(self, entry, themes, history):
        prompt = f"""
You are an environmental wellness coach. Suggest a way to improve one's living or working environment for better wellbeing based on the user's input.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Themes: {themes}

Respond with a concise environmental wellness tip (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)

    def generate_chat_report(self, session_id, history):
        if not history or len(history) < 10:
            return {"error": "Not enough messages to generate a report. Minimum 10 required."}

        # Extract user messages for context
        user_entries = [msg['content'] for msg in chat_history if msg.get('role') == 'USER']
        combined_text = "\n".join(user_entries)

        prompt = f"""
You are a chat summarizer. Summarize the full conversation below in a concise, structured way and it should be professional.
Include:
- Key emotions observed
- Main themes discussed
- Helpful responses provided
- A short motivational message to end the summary
- Avoid any personal opinions or commentary.
- intensity: (a number from 0-10 representing the emotional intensity of the journal)
- trigger_or_catalyst: (reply in a humanly way that how the primary situation or event that triggered the emotional state. give a proper statement with everything included in it.)
- growth_opportunity: (what the user can learn or take away from this experience that would help them grow in thir reflected mood or theme. )
- mindfulness_score: (a score from 0-100 evaluating the user's awareness, reflection, and presence in their entry. it should be more on the calmer side as it should define the clarity of thought and how at peace the person is. )
-Only return a raw JSON object. Do not include any explanation or commentary.

Conversation:
{combined_text}

Respond ONLY in structured JSON format:
{{
  "summary": "...",
  "emotions": ["..."],
  "themes": ["..."],
  "motivational_closing": "...",
  "mindfulness_score": "...",
  "intensity": "...",
  "trigger_or_catalyst": "...",
  "growth_opportunity": "..."
}}
"""

        result = self.ollama_generate(prompt, history=history)
        try:
            json_data = json.loads(result)
        except Exception as e:
            print(f"❌ Error parsing summary: {e}")
            return {"error": "Failed to parse summary"}

        # Save to file
        os.makedirs("chat_reports", exist_ok=True)
        report_path = f"chat_reports/{session_id}.json"
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(json_data, f, indent=2, ensure_ascii=False)

        print(f"✅ Chat report saved to {report_path}")
        return json_data
    
    # Main processing function
    def process_user_input(self, user_input, chat_history=None):
        print("\n" + "="*50)
        print(f"🔄 Processing user input with multi-agent system")
        print(f"📝 User input: {user_input}")
        
        # Track time for performance monitoring
        start_time = time.time()
        
        # Step 1: Detect emotions
        emotion_data = self.emotion_detector(user_input, chat_history)
        emotions = emotion_data.get("emotions", ["neutral"])
        print(f"🔍 Detected emotions: {emotions}")
        
        # Step 2: Extract themes
        theme_data = self.theme_extractor(user_input, emotions, chat_history)
        themes = theme_data.get("themes", ["general"])
        print(f"🔍 Extracted themes: {themes}")
        
        # Step 3: Generate responses from different agents
        responses = []
        
        # Always include therapy and casual chat responses
        therapy_response = self.therapy_agent(user_input, emotions, themes, chat_history)
        casual_response = self.casual_chat_agent(user_input, chat_history)
        
        responses.append(therapy_response)
        responses.append(casual_response)
        
        # Conditionally include other agent responses based on themes
        if any(theme in ["stress", "anxiety", "overwhelm", "pressure"] for theme in themes):
            responses.append(self.wellness_advisor_agent(user_input, themes, chat_history))
            responses.append(self.stress_management_agent(user_input, emotions, chat_history))
            responses.append(self.anxiety_management_agent(user_input, emotions, chat_history))
        
        if any(theme in ["calm", "peace", "mindfulness", "meditation"] for theme in themes):
            responses.append(self.mindfulness_agent(user_input, emotions, chat_history))
            responses.append(self.meditation_guide_agent(user_input, emotions, chat_history))
        
        if any(theme in ["cope", "manage", "handle", "deal"] for theme in themes):
            responses.append(self.coping_strategy_agent(user_input, emotions, themes, chat_history))
        
        if any(theme in ["thoughts", "thinking", "cognitive", "mind"] for theme in themes):
            responses.append(self.cbt_agent(user_input, emotions, themes, chat_history))

        if any(theme in ["self-care", "relax", "well-being"] for theme in themes):
            responses.append(self.self_care_agent(user_input, emotions, chat_history))
            
        if any(theme in ["trauma", "support", "grounding"] for theme in themes):
            responses.append(self.trauma_support_agent(user_input, emotions, themes, chat_history))

        if any(theme in ["story", "storytelling", "storyteller"] for theme in themes):
            responses.append(self.story_teller_agent(user_input, emotions, themes, chat_history))

        if any(theme in ["poetry", "poem", "poetic"] for theme in themes):
            responses.append(self.poetry_agent(user_input, emotions, themes, chat_history))

        if any(theme in ["journal", "journalism", "journalist"] for theme in themes):
            responses.append(self.journal_prompt_agent(user_input, emotions, themes, chat_history))

        if any(theme in ["humor", "funny", "joke"] for theme in themes):
            responses.append(self.humor_agent(user_input, emotions, chat_history))
            
        if any(theme in ["trivia", "fun fact", "fun trivia"] for theme in themes):
            responses.append(self.trivia_agent(user_input, themes, chat_history))

        if any(theme in ["pop culture", "popular culture", "popular"] for theme in themes):
            responses.append(self.pop_culture_agent(user_input, themes, chat_history))
            
        if any(theme in ["attack", "support", "heal"] for theme in themes):
            responses.append(self.attack_support_agent(user_input, themes, chat_history))
            
        if any(theme in ["motivation", "inspire", "encouragement"] for theme in themes):
            responses.append(self.motivation_agent(user_input, emotions, themes, chat_history))
            
        if any(theme in ["gratitude", "thankful", "appreciation"] for theme in themes):
            responses.append(self.gratitude_agent(user_input, emotions, themes, chat_history))
            
        if any(theme in ["sleep", "insomnia", "rest", "tired"] for theme in themes):
            responses.append(self.sleep_improvement_agent(user_input, emotions, themes, chat_history))
            
        if any(theme in ["nutrition", "food", "diet", "eating"] for theme in themes):
            responses.append(self.nutrition_agent(user_input, themes, chat_history))
            
        if any(theme in ["exercise", "fitness", "movement", "physical"] for theme in themes):
            responses.append(self.exercise_agent(user_input, emotions, chat_history))
            
        if any(theme in ["relationship", "partner", "friend", "family"] for theme in themes):
            responses.append(self.relationship_advice_agent(user_input, emotions, themes, chat_history))
            
        if any(theme in ["career", "job", "work", "professional"] for theme in themes):
            responses.append(self.career_guidance_agent(user_input, themes, chat_history))
            
        if any(theme in ["money", "finance", "financial", "budget"] for theme in themes):
            responses.append(self.financial_wellness_agent(user_input, themes, chat_history))
            
        if any(theme in ["creativity", "creative", "art", "expression"] for theme in themes):
            responses.append(self.creativity_spark_agent(user_input, emotions, chat_history))
            
        if any(theme in ["nature", "outdoors", "environment", "natural"] for theme in themes):
            responses.append(self.nature_connection_agent(user_input, emotions, chat_history))
            
        if any(theme in ["philosophy", "meaning", "purpose", "existential"] for theme in themes):
            responses.append(self.philosophical_perspective_agent(user_input, themes, chat_history))
            
        if any(theme in ["spiritual", "spirit", "soul", "faith"] for theme in themes):
            responses.append(self.spiritual_guidance_agent(user_input, emotions, themes, chat_history))
            
        if any(theme in ["time", "schedule", "planning", "productivity"] for theme in themes):
            responses.append(self.time_management_agent(user_input, themes, chat_history))
            
        if any(theme in ["learn", "learning", "education", "study"] for theme in themes):
            responses.append(self.learning_strategy_agent(user_input, themes, chat_history))
            
        if any(theme in ["habit", "routine", "consistency", "practice"] for theme in themes):
            responses.append(self.habit_formation_agent(user_input, themes, chat_history))
            
        if any(theme in ["conflict", "argument", "disagreement", "fight"] for theme in themes):
            responses.append(self.conflict_resolution_agent(user_input, emotions, themes, chat_history))
            
        if any(theme in ["parent", "child", "kid", "family"] for theme in themes):
            responses.append(self.parenting_advice_agent(user_input, themes, chat_history))
            
        if any(theme in ["positive", "optimism", "happiness", "joy"] for theme in themes):
            responses.append(self.positive_psychology_agent(user_input, emotions, chat_history))
            
        if any(theme in ["emotion", "feeling", "emotional", "awareness"] for theme in themes):
            responses.append(self.emotional_intelligence_agent(user_input, emotions, chat_history))
            
        if any(theme in ["social", "interaction", "people", "group"] for theme in themes):
            responses.append(self.social_skills_agent(user_input, themes, chat_history))
            
        if any(theme in ["confidence", "self-esteem", "worth", "value"] for theme in themes):
            responses.append(self.confidence_building_agent(user_input, emotions, chat_history))
            
        if any(theme in ["decision", "choice", "option", "choose"] for theme in themes):
            responses.append(self.decision_making_agent(user_input, themes, chat_history))
            
        if any(theme in ["goal", "aim", "target", "objective"] for theme in themes):
            responses.append(self.goal_setting_agent(user_input, themes, chat_history))
            
        if any(theme in ["resilience", "strength", "bounce back", "overcome"] for theme in themes):
            responses.append(self.resilience_building_agent(user_input, emotions, themes, chat_history))
            
        if any(theme in ["forgive", "forgiveness", "let go", "release"] for theme in themes):
            responses.append(self.forgiveness_agent(user_input, emotions, themes, chat_history))
            
        if any(theme in ["compassion", "kindness", "empathy", "care"] for theme in themes):
            responses.append(self.compassion_agent(user_input, emotions, chat_history))
            
        if any(theme in ["boundary", "limit", "space", "respect"] for theme in themes):
            responses.append(self.boundary_setting_agent(user_input, themes, chat_history))
            
        if any(theme in ["communicate", "communication", "talk", "express"] for theme in themes):
            responses.append(self.communication_skills_agent(user_input, themes, chat_history))
            
        if any(theme in ["anger", "mad", "furious", "rage"] for theme in themes):
            responses.append(self.anger_management_agent(user_input, emotions, chat_history))
            
        if any(theme in ["grief", "loss", "mourn", "bereavement"] for theme in themes):
            responses.append(self.grief_support_agent(user_input, emotions, chat_history))
            
        if any(theme in ["lonely", "loneliness", "alone", "isolated"] for theme in themes):
            responses.append(self.loneliness_support_agent(user_input, emotions, chat_history))
            
        if any(theme in ["body", "appearance", "look", "weight"] for theme in themes):
            responses.append(self.body_image_agent(user_input, emotions, themes, chat_history))
            
        if any(theme in ["perfect", "perfectionism", "flawless", "ideal"] for theme in themes):
            responses.append(self.perfectionism_management_agent(user_input, themes, chat_history))
            
        if any(theme in ["imposter", "fraud", "fake", "undeserving"] for theme in themes):
            responses.append(self.imposter_syndrome_agent(user_input, emotions, themes, chat_history))
            
        if any(theme in ["digital", "technology", "screen", "online"] for theme in themes):
            responses.append(self.digital_wellbeing_agent(user_input, themes, chat_history))
            
        if any(theme in ["work-life", "balance", "burnout", "overwork"] for theme in themes):
            responses.append(self.work_life_balance_agent(user_input, themes, chat_history))
            
        if any(theme in ["environment", "space", "surroundings", "home"] for theme in themes):
            responses.append(self.environmental_wellness_agent(user_input, themes, chat_history))
        
        # Filter out any non-string responses and select the best one
        valid_responses = [r for r in responses if isinstance(r, str) and len(r.strip()) > 0]
        
        # Calculate time taken
        end_time = time.time()
        time_taken = end_time - start_time
        
        print(f"✅ Generated {len(valid_responses)} responses in {time_taken:.2f} seconds")
        print("="*50 + "\n")
        
        # Select the best response - for now, we'll use the therapy response as primary
        # and randomly select a secondary response if available
        primary_response = therapy_response if therapy_response and isinstance(therapy_response, str) else "I'm here to listen and support you."
        
        # Format the response as required
        return {
            "messages": [primary_response]
        }
    
    def chat(self, message, session_id=None, user_id=None, chat_history=None):
        """Generate a chat response based on the message and optional chat history. Make it as fast as possible. But the data should be as accurate as possible."""
        print(f"💬 Generating chat response for message: {message}")
        if session_id:
            print(f"   Session ID: {session_id}")
        if user_id:
            print(f"   User ID: {user_id}")
    
        # Log chat history if available
        if chat_history and len(chat_history) > 0:
            print(f"📜 Chat history ({len(chat_history)} messages):")
            for i, msg in enumerate(chat_history):
                role = "User" if msg['role'] == 'USER' else "Assistant"
                content = msg['content']
                # Truncate long messages in the log
                if len(content) > 100:
                    content = content[:100] + "..."
                print(f"   {i+1}. {role}: {content}")
        else:
            print("📜 No chat history provided")
        
        print(f"💬 Current message: {message}")
        
        # Process the user input with the multi-agent system
        return self.process_user_input(message, chat_history)