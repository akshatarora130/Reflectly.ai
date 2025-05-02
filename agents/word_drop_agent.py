import json
import os
import time
import sys
import subprocess
import random

class WordDropAgent:
    def __init__(self):
        self.model = "mistral:latest"
        print(f"🎮 Initializing WordDropAgent with model: {self.model}")
        self._check_ollama_status()
        
    def _check_ollama_status(self):
        """Check Ollama status without making actual API calls"""
        print("🔍 Checking Ollama installation for Word Drop Agent")
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
            print(f"🔄 Calling Ollama CLI with model {self.model} for word drop content")
            
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
                print(f"✅ Generated word drop content ({len(response)} chars)")
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
    
    def generate_content(self, difficulty="medium", theme="general"):
        """Generate content for the word-dropping game"""
        prompt = f"""
Generate an inspiring, uplifting paragraph about mental health and wellbeing. 
The paragraph should be positive, encouraging, and focus on resilience, growth, self-care, or mindfulness.
It should be approximately 3-4 sentences long and use accessible language.

The theme is: {theme}
Difficulty level: {difficulty}

Respond ONLY with JSON in this format:
{{
  "paragraph": "The inspiring paragraph text goes here...",
  "difficulty": "{difficulty}",
  "theme": "{theme}",
}}
"""
        try:
            response = self.ollama_generate(prompt)
            # Extract JSON from response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = response[json_start:json_end]
                try:
                    content = json.loads(json_str)
                    
                    # Ensure we have all required fields
                    required_fields = ["paragraph"]
                    if not all(key in content for key in required_fields):
                        print(f"⚠️ Missing required fields in generated content, using default content")
                        missing_fields = [field for field in required_fields if field not in content]
                        print(f"⚠️ Missing fields: {missing_fields}")
                        return self._get_default_content(difficulty, theme)
                    
                    # Add missing fields from default if needed
                    if "difficulty" not in content:
                        content["difficulty"] = difficulty
                    if "theme" not in content:
                        content["theme"] = theme
                    
                    return content
                except json.JSONDecodeError as e:
                    print(f"⚠️ Error decoding JSON: {str(e)}")
                    return self._get_default_content(difficulty, theme)
            else:
                print(f"⚠️ No JSON found in response")
                return self._get_default_content(difficulty, theme)
        except Exception as e:
            print(f"❌ Error generating word game content: {str(e)}")
            return self._get_default_content(difficulty, theme)
    
    def _get_default_content(self, difficulty="medium", theme="general"):
        """Provide default content if generation fails"""
        default_content = {
            "paragraph": "Taking care of your mental health is just as important as physical health. Remember to be kind to yourself and practice self-compassion daily. Small steps toward wellness can lead to significant positive changes in your life.",
            "difficulty": difficulty,
            "theme": theme,
        }
        
        print(f"📌 Using default content due to generation error")
        return default_content
