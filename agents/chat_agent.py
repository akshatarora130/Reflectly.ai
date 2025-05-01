import requests
import json
import os
import time
import sys

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
    
    def _generate_response(self, prompt, system_prompt=None, max_tokens=400):
        """Simulate a response from Ollama with a fixed message"""
        print("\n" + "="*50)
        print(f"🔄 Simulating Ollama response (no actual API call)")
        print(f"📝 System prompt: {system_prompt[:100] + '...' if system_prompt and len(system_prompt) > 100 else system_prompt or 'None'}")
        print(f"📝 User prompt: {prompt[:100] + '...' if len(prompt) > 100 else prompt}")
        
        # Track time for realistic simulation
        start_time = time.time()
        print("⏱️ Simulating request...")
        
        # Sleep for a short time to simulate processing
        time.sleep(0.5)
        
        # Fixed response
        response_text = "Hello! I'm your AI companion. How can I help you today? This is a simulated response since we're not actually calling Ollama right now."
        
        # Calculate time taken
        end_time = time.time()
        time_taken = end_time - start_time
        
        # Log response details
        print(f"✅ Simulated response generated in {time_taken:.2f} seconds")
        print(f"📊 Response length: {len(response_text)} characters")
        print(f"📊 Response: {response_text}")
        print("="*50 + "\n")
        
        return response_text
    
    def chat(self, message, session_id=None, user_id=None, chat_history=None):
        """Generate a chat response based on the message and optional chat history"""
        print(f"💬 Generating chat response for message: {message}")
        if session_id:
            print(f"   Session ID: {session_id}")
        if user_id:
            print(f"   User ID: {user_id}")
        
        system_prompt = """You are reflectly.ai, a helpful and friendly AI companion. 
        Your responses are concise, thoughtful, and conversational. 
        You help users with their questions and engage in meaningful conversations."""
        
        # Include chat history in the prompt if provided
        history_text = ""
        if chat_history and len(chat_history) > 0:
            history_text = "Previous messages:\n"
            for msg in chat_history:
                role = "User" if msg['role'] == 'user' else "Assistant"
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
