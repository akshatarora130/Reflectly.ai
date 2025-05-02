import json
import os
import time
import sys
import subprocess
import random

class WouldYouRatherAgent:
    def __init__(self):
        self.model = "mistral:latest"
        print(f"🎮 Initializing WouldYouRatherAgent with model: {self.model}")
        self._check_ollama_status()
        
    def _check_ollama_status(self):
        """Check Ollama status without making actual API calls"""
        print("🔍 Checking Ollama installation for Would You Rather Agent")
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
    
    def ollama_generate(self, prompt):
        """Generate a response using Ollama CLI"""
        try:
            print(f"🔄 Calling Ollama CLI with model {self.model} for would you rather questions")
            
            # Call Ollama CLI
            result = subprocess.run(
                ['ollama', 'run', self.model],
                input=prompt.encode('utf-8'),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=120
            )
            
            if result.returncode == 0:
                response = result.stdout.decode('utf-8').strip()
                print(f"✅ Generated would you rather questions ({len(response)} chars)")
                return response
            else:
                error = result.stderr.decode('utf-8')
                print(f"❌ Ollama CLI error: {error}")
                return f"I'm sorry, I encountered an issue while generating game content. Error: {error}"
                
        except subprocess.TimeoutExpired:
            print("❌ Ollama process timed out after 120 seconds")
            return "I'm sorry, it's taking longer than expected to generate content. Please try again."
        except Exception as e:
            print(f"❌ Error calling Ollama: {str(e)}")
            return f"I'm sorry, I'm having trouble connecting to the language model. Error: {str(e)}"
    
    def generate_questions(self, count=10, category="general"):
        """Generate 'would you rather' questions related to mental health"""
        prompt = f"""
Generate {count} "would you rather" questions related to mental health, wellness, and personal growth.
Each question should present two options that make the player think about their values, preferences, or coping strategies.
The questions should be positive or neutral in tone, not distressing.

Category: {category}

Respond ONLY with JSON in this format:
{{
  "questions": [
    {{
      "id": "q1",
      "option_a": "First option text",
      "option_b": "Second option text",
      "insight_a": "Brief insight about choosing option A",
      "insight_b": "Brief insight about choosing option B"
    }},
    ...more questions...
  ],
  "category": "{category}",
  "title": "A title for this set of questions",
  "description": "A brief description of what these questions explore"
}}
"""
        try:
            response = self.ollama_generate(prompt)
            # Extract JSON from response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = response[json_start:json_end]
                content = json.loads(json_str)
                
                # Ensure we have all required fields
                if not all(key in content for key in ["questions", "category", "title", "description"]):
                    raise ValueError("Missing required fields in generated content")
                
                # Ensure we have enough questions
                if len(content["questions"]) < 5:
                    # Add default questions if needed
                    content["questions"].extend(self._get_default_questions(5 - len(content["questions"])))
                
                return content
            else:
                # If JSON parsing fails, create a default response
                return self._get_default_would_you_rather(count, category)
        except Exception as e:
            print(f"❌ Error generating would you rather questions: {str(e)}")
            return self._get_default_would_you_rather(count, category)
    
    def _get_default_would_you_rather(self, count=10, category="general"):
        """Provide default 'would you rather' questions if generation fails"""
        default_questions = [
            {
                "id": "q1",
                "option_a": "Practice meditation for 10 minutes daily",
                "option_b": "Take a 30-minute nature walk weekly",
                "insight_a": "You value consistent, brief moments of mindfulness in your daily routine",
                "insight_b": "You prefer deeper connection with nature even if less frequent"
            },
            {
                "id": "q2",
                "option_a": "Have a deep conversation with one close friend",
                "option_b": "Have light social interactions with many acquaintances",
                "insight_a": "You value depth and intimacy in relationships",
                "insight_b": "You enjoy variety and breadth in social connections"
            },
            {
                "id": "q3",
                "option_a": "Express your feelings through art or writing",
                "option_b": "Talk through your feelings with someone else",
                "insight_a": "You process emotions internally through creative expression",
                "insight_b": "You process emotions externally through verbal communication"
            },
            {
                "id": "q4",
                "option_a": "Have perfect work-life balance but average career success",
                "option_b": "Have outstanding career success but struggle with work-life balance",
                "insight_a": "You prioritize overall life satisfaction and balance",
                "insight_b": "You're willing to make sacrifices for professional achievement"
            },
            {
                "id": "q5",
                "option_a": "Be able to fully control your dreams",
                "option_b": "Need 2 hours less sleep without feeling tired",
                "insight_a": "You value the quality and experience of rest",
                "insight_b": "You value efficiency and having more waking hours"
            },
            {
                "id": "q6",
                "option_a": "Have the ability to instantly calm yourself in any situation",
                "option_b": "Have the ability to motivate yourself to do anything",
                "insight_a": "You value emotional regulation and peace of mind",
                "insight_b": "You value drive and accomplishment"
            },
            {
                "id": "q7",
                "option_a": "Live in a bustling city with many opportunities",
                "option_b": "Live in a peaceful rural area with fewer distractions",
                "insight_a": "You thrive on stimulation and possibilities",
                "insight_b": "You value tranquility and simplicity"
            },
            {
                "id": "q8",
                "option_a": "Have one lifelong best friend",
                "option_b": "Have many good friends throughout life",
                "insight_a": "You value depth and consistency in friendship",
                "insight_b": "You value variety and new perspectives in relationships"
            },
            {
                "id": "q9",
                "option_a": "Be able to read others' emotions perfectly",
                "option_b": "Be able to communicate your own emotions perfectly",
                "insight_a": "You value understanding others and empathy",
                "insight_b": "You value self-expression and being understood"
            },
            {
                "id": "q10",
                "option_a": "Have more time to pursue hobbies",
                "option_b": "Have more energy throughout the day",
                "insight_a": "You value personal interests and self-development",
                "insight_b": "You value vitality and consistent performance"
            }
        ]
        
        return {
            "questions": default_questions[:count],
            "category": category,
            "title": "Mental Wellness Reflections",
            "description": "Explore your preferences and values related to mental wellbeing and personal growth"
        }
    
    def _get_default_questions(self, count):
        """Get a specified number of default questions"""
        all_defaults = self._get_default_would_you_rather(10)["questions"]
        return all_defaults[:count]
