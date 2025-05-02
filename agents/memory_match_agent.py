import json
import os
import time
import sys
import subprocess
import random

class MemoryMatchAgent:
    def __init__(self):
        self.model = "mistral:latest"
        print(f"🎮 Initializing MemoryMatchAgent with model: {self.model}")
        self._check_ollama_status()
        
    def _check_ollama_status(self):
        """Check Ollama status without making actual API calls"""
        print("🔍 Checking Ollama installation for Memory Match Agent")
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
            print(f"🔄 Calling Ollama CLI with model {self.model} for memory match content")
            
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
                print(f"✅ Generated memory match content ({len(response)} chars)")
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
    
    def generate_card_pairs(self, difficulty="medium", theme="mindfulness"):
        """Generate card pairs for the memory match game"""
        prompt = f"""
Generate pairs of matching concepts related to mental health and wellbeing for a memory matching game.
Each pair should consist of a concept and a brief description or related term.

Theme: {theme}
Difficulty level: {difficulty}

Respond ONLY with JSON in this format:
{{
  "pairs": [
    {{
      "id": "pair1",
      "concept": "Concept name",
      "match": "Matching description or related term",
      "category": "Category of the concept"
    }},
    ...more pairs...
  ],
  "difficulty": "{difficulty}",
  "theme": "{theme}",
  "title": "A title for this set of cards",
  "description": "A brief description of the concepts covered"
}}

For easy difficulty, generate 6 pairs (12 cards total).
For medium difficulty, generate 8 pairs (16 cards total).
For hard difficulty, generate 12 pairs (24 cards total).
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
                if not all(key in content for key in ["pairs", "difficulty", "theme", "title", "description"]):
                    raise ValueError("Missing required fields in generated content")
                
                # Ensure we have enough pairs based on difficulty
                required_pairs = 6  # default for easy
                if difficulty == "medium":
                    required_pairs = 8
                elif difficulty == "hard":
                    required_pairs = 12
                
                if len(content["pairs"]) < required_pairs:
                    # Add default pairs if needed
                    content["pairs"].extend(self._get_default_pairs(required_pairs - len(content["pairs"])))
                
                return content
            else:
                # If JSON parsing fails, create a default response
                return self._get_default_card_pairs(difficulty, theme)
        except Exception as e:
            print(f"❌ Error generating memory match content: {str(e)}")
            return self._get_default_card_pairs(difficulty, theme)
    
    def _get_default_card_pairs(self, difficulty="medium", theme="mindfulness"):
        """Provide default card pairs if generation fails"""
        default_pairs = [
            {
                "id": "pair1",
                "concept": "Mindfulness",
                "match": "Present moment awareness",
                "category": "Meditation"
            },
            {
                "id": "pair2",
                "concept": "Self-compassion",
                "match": "Being kind to yourself",
                "category": "Self-care"
            },
            {
                "id": "pair3",
                "concept": "Gratitude",
                "match": "Appreciating what you have",
                "category": "Positive psychology"
            },
            {
                "id": "pair4",
                "concept": "Resilience",
                "match": "Bouncing back from challenges",
                "category": "Coping skills"
            },
            {
                "id": "pair5",
                "concept": "Deep breathing",
                "match": "Calming the nervous system",
                "category": "Stress reduction"
            },
            {
                "id": "pair6",
                "concept": "Growth mindset",
                "match": "Believing abilities can be developed",
                "category": "Personal development"
            },
            {
                "id": "pair7",
                "concept": "Emotional intelligence",
                "match": "Understanding and managing feelings",
                "category": "Emotional wellness"
            },
            {
                "id": "pair8",
                "concept": "Social connection",
                "match": "Building meaningful relationships",
                "category": "Social wellness"
            },
            {
                "id": "pair9",
                "concept": "Cognitive reframing",
                "match": "Changing negative thought patterns",
                "category": "Cognitive techniques"
            },
            {
                "id": "pair10",
                "concept": "Boundaries",
                "match": "Healthy limits in relationships",
                "category": "Interpersonal skills"
            },
            {
                "id": "pair11",
                "concept": "Flow state",
                "match": "Complete absorption in an activity",
                "category": "Optimal experience"
            },
            {
                "id": "pair12",
                "concept": "Self-reflection",
                "match": "Examining your thoughts and actions",
                "category": "Self-awareness"
            }
        ]
        
        # Determine how many pairs to return based on difficulty
        pairs_count = 6  # default for easy
        if difficulty == "medium":
            pairs_count = 8
        elif difficulty == "hard":
            pairs_count = 12
        
        return {
            "pairs": default_pairs[:pairs_count],
            "difficulty": difficulty,
            "theme": theme,
            "title": f"{theme.capitalize()} Concepts",
            "description": f"Match these {theme} concepts with their descriptions to improve your understanding of mental wellness."
        }
    
    def _get_default_pairs(self, count):
        """Get a specified number of default pairs"""
        all_defaults = self._get_default_card_pairs("hard")["pairs"]
        return all_defaults[:count]

    def generate_memory_pairs(self):
        """Generate pairs of positive mental health affirmations for the memory match game."""
        pairs = [
            "I am worthy of love and respect",
            "I embrace challenges as opportunities",
            "My feelings are valid and important",
            "I am resilient and can overcome difficulties",
            "I choose to focus on the positive",
            "I am grateful for what I have",
            "I am enough just as I am",
            "I deserve happiness and peace",
        ]
        return {"pairs": pairs}
