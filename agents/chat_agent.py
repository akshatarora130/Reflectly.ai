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
    
    def self_care_agent(self,entry, emotions, history):
        prompt = f"""
You are a self-care advocate. Suggest a self-care activity to promote relaxation or well-being based on the user's input and emotions.Try to be as human as possible don't say you are computer generated or AI.Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Emotions: {emotions}

Respond with a short, soothing self-care suggestion.
"""
        return self.ollama_generate(prompt, history=history)
    
    def trauma_support_agent(self,entry, emotions, themes, history):
        prompt = f"""
You are a trauma-informed counselor. Provide a gentle, grounding technique or supportive message for the user's emotions and themes.Try to be as human as possible don't say you are computer generated or AI.Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Emotions: {emotions}
Themes: {themes}

Respond with a concise, trauma-sensitive suggestion (2-3 sentences).
"""
        return self.ollama_generate(prompt, history=history)
    def story_teller_agent(self,entry, emotions, themes,history):
        prompt = f"""
You are a creative storyteller. Write a short, engaging story snippet (3-5 sentences) inspired by the user's input, emotions, and themes.Try to be as human as possible don't say you are computer generated or AI.Make it fast and concise but it should fulfil the query.

Input: "{entry}"
Emotions: {emotions}
Themes: {themes}

Respond with a concise story snippet.
"""
        return self.ollama_generate(prompt, history=history)

    def poetry_agent(self,entry, emotions, themes, history):
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

    def journal_prompt_agent(self,entry, emotions, themes, history):
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

    def humor_agent(self,entry, emotions, history):
        prompt = f"""
You are a comedian. Share a lighthearted joke or humorous comment based on the user's input and emotions.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.
Input: "{entry}"
Emotions: {emotions}

Respond with a short, funny message.
"""
        return self.ollama_generate(prompt, history=history)

    def trivia_agent(self,entry, themes, history):
        prompt = f"""
You are a trivia enthusiast. Share a fun fact or trivia question related to the user's input and themes.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.
Input: "{entry}"
Themes: {themes}

Respond with a concise trivia fact or question.
"""
        return self.ollama_generate(prompt, history=history)

    def pop_culture_agent(self,entry, themes, history):
        prompt = f"""
You are a pop culture expert. Offer a casual comment or recommendation about movies, music, or trends based on the user's input and themes.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.
Input: "{entry}"
Themes: {themes}

Respond with a short, relatable message.
"""
        return self.ollama_generate(prompt, history=history)
    def attack_support_agent(self,entry, themes, history):
        prompt = f"""
You are a attack support agent. Offer a solution for the user to heal from the attack based on the user's input and themes.
Try to be as human as possible don't say you are computer generated or AI.
Make it fast and concise but it should fulfil the query.
Input: "{entry}"
Themes: {themes}

Respond with a short, relatable message.
"""
        return self.ollama_generate(prompt, history=history)
    
    
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
        
        if any(theme in ["calm", "peace", "mindfulness", "meditation"] for theme in themes):
            responses.append(self.mindfulness_agent(user_input, emotions, chat_history))
        
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