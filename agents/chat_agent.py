import requests
import json
import os
import time
import sys
import subprocess

class ChatAgent:
    def __init__(self):
        # Ollama API endpoint (default for local installation)
        self.api_url = os.environ.get('OLLAMA_API_URL', 'http://localhost:11434/api/generate')
        # Use mistral:latest as specified
        self.model = "mistral:latest"
        
        print(f"🚀 Initializing ChatAgent with model: {self.model}")
        print(f"🔗 API URL: {self.api_url}")
        
        # Check if Ollama is running and the model is available
        self._check_ollama_status()
    
    def _check_ollama_status(self):
        """Simulate checking Ollama status without making actual API calls"""
        print("🔍 Simulating Ollama status check (no actual API call)")
        print("✅ Simulation mode active - no need for actual Ollama service")
        print(f"📋 Using simulated model: {self.model}")

    def _pull_model(self):
        """Pull the model if it's not available"""
        try:
            print(f"🔄 Pulling model {self.model}. This may take a while...")
            
            # Make a request to pull the model
            pull_url = self.api_url.replace('/generate', '/pull')
            response = requests.post(pull_url, json={"name": self.model})
            
            if response.status_code == 200:
                print(f"✅ Successfully pulled model {self.model}")
                return True
            else:
                print(f"❌ Failed to pull model {self.model}")
                print(f"❌ Status code: {response.status_code}")
                print(f"❌ Response: {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Error pulling model: {str(e)}")
            return False
    
    def call_ollama_mistral(self, prompt):
        """Call Ollama CLI with the given prompt"""
        try:
            print(f"🔄 Calling Ollama CLI with model {self.model}")
            
            result = subprocess.run(
                ['ollama', 'run', self.model],
                input=prompt.encode('utf-8'),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=120
            )
            
            if result.returncode == 0:
                return result.stdout.decode('utf-8')
            else:
                error = result.stderr.decode('utf-8')
                print(f"❌ Ollama CLI error: {error}")
                return f"I'm sorry, I encountered an issue while processing your request. Error: {error}"
                
        except subprocess.TimeoutExpired:
            print("❌ Ollama process timed out after 120 seconds")
            return '{"response": "The model took too long to respond."}'
        except Exception as e:
            print(f"❌ Error calling Ollama: {str(e)}")
            return f"I'm sorry, I'm having trouble connecting to the language model. Error: {str(e)}"
    
    def _generate_response(self, prompt, system_prompt=None, max_tokens=400):
        """Generate a response from Ollama using subprocess instead of API"""
        print("\n" + "="*50)
        print(f"🔄 Generating response from Ollama using CLI")
        print(f"📝 System prompt: {system_prompt[:100] + '...' if system_prompt and len(system_prompt) > 100 else system_prompt or 'None'}")
        # Log the full prompt in a more readable format
        print(f"📝 Full prompt:")
        print("---BEGIN PROMPT---")
        print(prompt)
        print("---END PROMPT---")
        
        # Track time for performance monitoring
        start_time = time.time()
        
        # Prepare the full prompt with system prompt if provided
        full_prompt = prompt
        if system_prompt:
            full_prompt = f"{system_prompt}\n\n{prompt}"
        
        # Call Ollama CLI using subprocess
        response_text = self.call_ollama_mistral(full_prompt)
        
        # Calculate time taken
        end_time = time.time()
        time_taken = end_time - start_time
        
        # Log response details
        print(f"✅ Response generated in {time_taken:.2f} seconds")
        print(f"📊 Response length: {len(response_text)} characters")
        print(f"📊 Response: {response_text[:100]}..." if len(response_text) > 100 else f"📊 Response: {response_text}")
        print("="*50 + "\n")
        
        return response_text
    
    def chat(self, message, session_id=None, user_id=None, chat_history=None):
        """Generate a chat response based on the message and optional chat history"""
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

        system_prompt = """ "You are Reflectly — an empathetic, human-like AI built for meaningful, context-aware conversations". 
       "responses should be concise and more optimal towards the question"
       "Give concise, optimized replies that retain emotional depth and clarity."
       " Preserve the essence of each response, and only elaborate when the user asks."
       " Maintain continuity using past context naturally,act like youre an CBT based therapist, a true friend,motivaational coach,amindfullness coach,relationship counselor, fitness buddy, productivity hacker, pop culture fan, creative writer, "
        "financial guide, gratitude mentor, and emotional coping expert and never forget that while giving every answer you have to e as humas as possible"
"""
    
        # Include chat history in the prompt if provided
        history_text = ""
        if chat_history and len(chat_history) > 0:
            history_text = "Previous messages:\n"
            for msg in chat_history:
                role = "User" if msg['role'] == 'USER' else "Assistant"
                history_text += f"{role}: {msg['content']}\n"
            history_text += "\n"
    
        prompt = f"{history_text}User: {message}\nAssistant:"
    
        response_text = self._generate_response(prompt, system_prompt, max_tokens=400)
    
        # Format the response as required
        return {
            "messages": [
                response_text
            ]
        }