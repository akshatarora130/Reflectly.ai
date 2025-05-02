import json
import os
import time
import sys
import subprocess
import random

class BreathingRhythmAgent:
    def __init__(self):
        self.model = "mistral:latest"
        print(f"🎮 Initializing BreathingRhythmAgent with model: {self.model}")
        self._check_ollama_status()
        
    def _check_ollama_status(self):
        """Check Ollama status without making actual API calls"""
        print("🔍 Checking Ollama installation for Breathing Rhythm Agent")
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
            print(f"🔄 Calling Ollama CLI with model {self.model} for breathing rhythm content")
            
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
                print(f"✅ Generated breathing rhythm content ({len(response)} chars)")
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
    
    def generate_breathing_exercise(self, difficulty="beginner", focus="relaxation"):
        """Generate a breathing exercise pattern and guidance"""
        prompt = f"""
Generate a guided breathing exercise for mental wellbeing.

Difficulty level: {difficulty}
Focus area: {focus}

Respond ONLY with JSON in this format:
{{
  "title": "Name of the breathing exercise",
  "description": "Brief description of the exercise and its benefits",
  "difficulty": "{difficulty}",
  "focus": "{focus}",
  "duration": "Total duration in minutes",
  "pattern": {{
    "inhale": "Inhale duration in seconds",
    "hold1": "First hold duration in seconds (0 if none)",
    "exhale": "Exhale duration in seconds",
    "hold2": "Second hold duration in seconds (0 if none)"
  }},
  "instructions": [
    "Step 1 instruction",
    "Step 2 instruction",
    ...
  ],
  "benefits": [
    "Benefit 1",
    "Benefit 2",
    ...
  ],
  "affirmations": [
    "Affirmation 1 to think during exercise",
    "Affirmation 2 to think during exercise",
    ...
  ]
}}

For beginner difficulty, use simpler patterns (e.g., 4-4 or 4-6).
For intermediate difficulty, use moderate patterns (e.g., 4-7-8).
For advanced difficulty, use more complex patterns (e.g., 4-7-8-4).
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
                required_fields = ["title", "description", "difficulty", "focus", "duration", "pattern", "instructions", "benefits", "affirmations"]
                if not all(key in content for key in required_fields):
                    raise ValueError("Missing required fields in generated content")
                
                # Ensure pattern has all required fields
                pattern_fields = ["inhale", "hold1", "exhale", "hold2"]
                if not all(key in content["pattern"] for key in pattern_fields):
                    raise ValueError("Missing required fields in breathing pattern")
                
                return content
            else:
                # If JSON parsing fails, create a default response
                return self._get_default_breathing_exercise(difficulty, focus)
        except Exception as e:
            print(f"❌ Error generating breathing exercise: {str(e)}")
            return self._get_default_breathing_exercise(difficulty, focus)
    
    def _get_default_breathing_exercise(self, difficulty="beginner", focus="relaxation"):
        """Provide default breathing exercise if generation fails"""
        # Define different patterns based on difficulty
        if difficulty == "beginner":
            pattern = {
                "inhale": 4,
                "hold1": 0,
                "exhale": 4,
                "hold2": 0
            }
            title = "Equal Breathing"
            description = "A simple breathing technique where inhale and exhale are equal in duration. Perfect for beginners to establish a calming rhythm."
            duration = "5"
        elif difficulty == "intermediate":
            pattern = {
                "inhale": 4,
                "hold1": 0,
                "exhale": 6,
                "hold2": 0
            }
            title = "Extended Exhale"
            description = "A calming technique that emphasizes longer exhales than inhales, which helps activate the parasympathetic nervous system."
            duration = "7"
        else:  # advanced
            pattern = {
                "inhale": 4,
                "hold1": 7,
                "exhale": 8,
                "hold2": 0
            }
            title = "4-7-8 Breathing"
            description = "A powerful relaxation technique developed by Dr. Andrew Weil that acts as a natural tranquilizer for the nervous system."
            duration = "10"
        
        # Define different instructions and benefits based on focus
        if focus == "relaxation":
            instructions = [
                "Find a comfortable seated position or lie down",
                "Close your eyes and take a normal breath",
                "Begin the breathing pattern, focusing on the counts",
                "Feel your body becoming more relaxed with each breath",
                "Continue for at least 5 minutes"
            ]
            benefits = [
                "Reduces stress and anxiety",
                "Promotes relaxation",
                "Lowers heart rate and blood pressure",
                "Improves sleep quality",
                "Helps manage stress responses"
            ]
            affirmations = [
                "I am calm and at peace",
                "With each breath, I release tension",
                "I am safe and relaxed",
                "My mind is becoming quiet and still"
            ]
        elif focus == "focus":
            instructions = [
                "Sit in an upright, alert position",
                "Keep your spine straight and shoulders relaxed",
                "Begin the breathing pattern, counting mentally",
                "When your mind wanders, gently bring it back to the breath",
                "Continue for your desired duration"
            ]
            benefits = [
                "Improves concentration and focus",
                "Reduces mind wandering",
                "Increases mental clarity",
                "Enhances cognitive performance",
                "Helps manage ADHD symptoms"
            ]
            affirmations = [
                "My mind is clear and focused",
                "I am fully present in this moment",
                "I can direct my attention where I choose",
                "Each breath sharpens my awareness"
            ]
        else:  # energy
            instructions = [
                "Sit comfortably with a straight spine",
                "Begin with a few normal breaths",
                "Start the energizing breathing pattern",
                "Focus on the sensation of air entering and leaving your body",
                "Continue for 2-3 minutes, then return to normal breathing"
            ]
            benefits = [
                "Increases energy and alertness",
                "Improves oxygen flow throughout the body",
                "Enhances mental clarity",
                "Reduces fatigue",
                "Boosts mood and motivation"
            ]
            affirmations = [
                "I am filled with energy and vitality",
                "Each breath energizes my body and mind",
                "I am awake, alert, and alive",
                "My breath is my source of strength"
            ]
        
        return {
            "title": title,
            "description": description,
            "difficulty": difficulty,
            "focus": focus,
            "duration": duration,
            "pattern": pattern,
            "instructions": instructions,
            "benefits": benefits,
            "affirmations": affirmations
        }
