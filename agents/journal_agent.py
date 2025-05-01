import subprocess
import json
import os
import datetime
import traceback

class JournalAgent:
    def __init__(self):
        print("\n" + "="*70)
        print("🚀 Starting Journal Analysis Agent")
        print("="*70)
        self.model = "mistral"
        print(f"📌 Using Ollama model: {self.model}")
        
    def analyze_journal_entry(self, content, entry_id=None, user_id=None):
        """
        Analyze a journal entry and return insights in JSON format.
        This function will process the journal entry using Ollama and return structured analysis.
        """
        print(f"\n" + "-"*50)
        print(f"📝 Analyzing journal entry: {entry_id}")
        print(f"👤 User ID: {user_id}")
        
        start_time = datetime.datetime.now()
        
        try:
            # Extract a sample of the content for logging
            content_sample = content[:100] + "..." if len(content) > 100 else content
            print(f"📌 Journal content (sample): {content_sample}")
            
            # Get previous entries - in a real implementation, we would fetch from the database
            # For now, we'll just use an empty list since we don't have access to previous entries
            previous_entries = []
            
            # Create the prompt for Ollama
            prompt = (
                "You are a mental health journaling coach. Analyze the following journal entry.\n\n"
                f"Entry:\n\"{content}\"\n\n"
                f"Previous entries:\n{json.dumps(previous_entries, indent=2)}\n\n"
                "Respond ONLY in valid JSON format with the following fields:\n"
                "- summary: (a brief summary of the journal entry)\n"
                "- emotions: (list of emotions detected in the entry, at least 3)\n"
                "- themes: (list of key themes or topics in the entry, at least 3)\n"
                "- insights: (list of 3-5 insights or observations about the entry)\n"
                "- recommendations: (list of 3-4 actionable recommendations based on the entry)\n"
                "- sentiment_score: (a number from -1 to 1 representing the sentiment, where -1 is very negative and 1 is very positive)\n"
                "- affirmation: (generate an affirmation for the person to feel better and happy)\n"
                "- mindfulness_score: (a score from 0-100 evaluating the user's awareness, reflection, and presence in their entry)\n\n"
                "Only return a raw JSON object. Do not include any explanation or commentary."
            )
            
            print(f"🔄 Calling Ollama with model {self.model}...")
            
            # Call Ollama to analyze the journal entry
            result = subprocess.run(
                ["ollama", "run", self.model],
                input=prompt,
                text=True,
                capture_output=True,
                check=True,
                timeout=60
            )
            
            output = result.stdout.strip()
            print(f"✅ Received response from Ollama")
            
            # Extract JSON from the response
            json_start = output.find('{')
            if json_start == -1:
                raise ValueError("No JSON found in Ollama response")
                
            json_output = output[json_start:]
            parsed = json.loads(json_output)
            
            # Log the analysis results
            print(f"📊 Analysis results:")
            print(f"  - Emotions: {', '.join(parsed.get('emotions', ['unknown'])[:3])}")
            print(f"  - Themes: {', '.join(parsed.get('themes', ['unknown'])[:3])}")
            print(f"  - Sentiment score: {parsed.get('sentiment_score', 'unknown')}")
            
            end_time = datetime.datetime.now()
            time_taken = (end_time - start_time).total_seconds()
            print(f"✅ Analysis completed in {time_taken:.2f} seconds")
            print("-"*50 + "\n")
            
            return parsed
            
        except json.JSONDecodeError as e:
            end_time = datetime.datetime.now()
            time_taken = (end_time - start_time).total_seconds()
            print(f"❌ Error parsing JSON after {time_taken:.2f} seconds: {str(e)}")
            print(f"❌ Raw output: {output if 'output' in locals() else 'No output'}")
            print("-"*50 + "\n")
            
            # Return a fallback analysis
            return self._generate_fallback_analysis(content)
            
        except subprocess.CalledProcessError as e:
            end_time = datetime.datetime.now()
            time_taken = (end_time - start_time).total_seconds()
            print(f"❌ Ollama subprocess failed after {time_taken:.2f} seconds: {str(e)}")
            print(f"❌ Error output: {e.stderr}")
            print("-"*50 + "\n")
            
            # Return a fallback analysis
            return self._generate_fallback_analysis(content)
            
        except Exception as e:
            end_time = datetime.datetime.now()
            time_taken = (end_time - start_time).total_seconds()
            print(f"❌ Error analyzing journal entry after {time_taken:.2f} seconds: {str(e)}")
            print(f"❌ Exception details: {type(e).__name__}: {str(e)}")
            print(f"❌ Traceback: {traceback.format_exc()}")
            print("-"*50 + "\n")
            
            # Return a fallback analysis
            return self._generate_fallback_analysis(content)
    
    def _generate_fallback_analysis(self, content):
        """Generate a fallback analysis when Ollama fails"""
        print("⚠️ Generating fallback analysis")
        
        # Extract some basic information from the content
        word_count = len(content.split())
        has_question = "?" in content
        has_exclamation = "!" in content
        
        # Create a simple sentiment analysis based on positive and negative words
        positive_words = ["happy", "good", "great", "love", "enjoy", "wonderful", "excited", "grateful"]
        negative_words = ["sad", "bad", "angry", "upset", "worried", "anxious", "stressed", "frustrated"]
        
        content_lower = content.lower()
        positive_count = sum(content_lower.count(word) for word in positive_words)
        negative_count = sum(content_lower.count(word) for word in negative_words)
        
        # Calculate a simple sentiment score
        total_count = positive_count + negative_count
        sentiment_score = 0
        if total_count > 0:
            sentiment_score = (positive_count - negative_count) / total_count
        
        # Generate a fallback analysis
        return {
            "summary": f"This is a {word_count}-word journal entry that expresses the author's thoughts and feelings.",
            "emotions": ["reflective", "thoughtful", "expressive"],
            "themes": ["self-reflection", "daily experience", "personal thoughts"],
            "insights": [
                "The journal entry shows a willingness to engage in self-reflection.",
                "Writing down thoughts is an important step in processing emotions.",
                "Regular journaling can help track personal growth over time."
            ],
            "recommendations": [
                "Continue the practice of regular journaling.",
                "Try exploring specific emotions in more depth in future entries.",
                "Consider setting aside a specific time each day for reflection."
            ],
            "sentiment_score": max(min(sentiment_score, 1.0), -1.0),
            "affirmation": "My thoughts and feelings are valid, and I am growing through self-reflection.",
            "mindfulness_score": 65
        }
