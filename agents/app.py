from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import time
import sys
import requests
import json
from chat_agent import ChatAgent

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize the chat agent
print("\n" + "="*70)
print("🚀 Starting AI Companion Python Backend")
print("="*70)
chat_agent = ChatAgent()
print("✅ ChatAgent initialized successfully")
print("="*70 + "\n")

@app.route('/api/chat', methods=['POST'])
def chat():
    print("\n" + "-"*50)
    print("💬 CHAT ENDPOINT CALLED")
    start_time = time.time()
    
    try:
        data = request.json
        message = data.get('message', '')
        session_id = data.get('sessionId', 'unknown')
        user_id = data.get('userId', 'unknown')
        chat_history = data.get('chatHistory', [])
        
        print(f"📌 Message received: {message}")
        print(f"📌 Session ID: {session_id}")
        print(f"📌 User ID: {user_id}")
        print(f"📌 Chat history length: {len(chat_history)} messages")
        
        # Log detailed chat history
        if chat_history and len(chat_history) > 0:
            print("📌 Complete chat history:")
            for i, msg in enumerate(chat_history):
                role = "User" if msg['role'] == 'USER' else "Assistant"
                content = msg['content']
                # Truncate long messages in the log
                if len(content) > 50:
                    content = content[:50] + "..."
                print(f"   {i+1}. {role}: {content}")
        
        print(f"📌 Full message: {message}")
        
        if not message:
            print("❌ Error: Message is required")
            return jsonify({'error': 'Message is required'}), 400
        
        print("🔄 Calling ChatAgent.chat()...")
        response = chat_agent.chat(message, session_id, user_id, chat_history)
        
        end_time = time.time()
        time_taken = end_time - start_time
        print(f"✅ Chat response generated successfully in {time_taken:.2f} seconds")
        print(f"📊 Response: {response}")
        print("-"*50 + "\n")
        
        return jsonify(response)
    
    except Exception as e:
        end_time = time.time()
        time_taken = end_time - start_time
        print(f"❌ Error generating chat response after {time_taken:.2f} seconds: {str(e)}")
        print(f"❌ Exception details: {type(e).__name__}: {str(e)}")
        import traceback
        print(f"❌ Traceback: {traceback.format_exc()}")
        print("-"*50 + "\n")
        return jsonify({'error': str(e)}), 500

@app.route('/api/status', methods=['GET'])
def status():
    print("\n" + "-"*50)
    print("ℹ️ STATUS ENDPOINT CALLED")
    
    try:
        # Check Ollama status
        api_url = chat_agent.api_url.replace('/generate', '/models')
        response = requests.get(api_url)
        
        if response.status_code == 200:
            models = response.json().get('models', [])
            model_names = [model.get('name') for model in models]
            
            # Check if our model is available
            model_available = chat_agent.model in model_names
            
            status_info = {
                'status': 'ok' if model_available else 'warning',
                'ollama_status': 'running',
                'available_models': model_names,
                'current_model': chat_agent.model,
                'model_available': model_available,
                'api_url': chat_agent.api_url,
                'mode': 'production'
            }
            
            if not model_available:
                status_info['warning'] = f"Model {chat_agent.model} is not available. Try pulling it with 'ollama pull {chat_agent.model}'"
        else:
            status_info = {
                'status': 'warning',
                'ollama_status': f'error: {response.status_code}',
                'error_details': response.text,
                'available_models': [],
                'current_model': chat_agent.model,
                'api_url': chat_agent.api_url,
                'mode': 'production',
                'troubleshooting': [
                    "Make sure Ollama is running with 'ollama serve'",
                    "Check if the API URL is correct",
                    "Verify there are no firewall or network issues"
                ]
            }
    except requests.exceptions.RequestException as e:
        status_info = {
            'status': 'warning',
            'ollama_status': f'connection error: {str(e)}',
            'available_models': [],
            'current_model': chat_agent.model,
            'api_url': chat_agent.api_url,
            'mode': 'production',
            'troubleshooting': [
                "Make sure Ollama is running with 'ollama serve'",
                "Check if the API URL is correct",
                "Verify there are no firewall or network issues",
                f"Error details: {str(e)}"
            ]
        }
    
    print(f"✅ Status check: {status_info}")
    print("-"*50 + "\n")
    
    return jsonify(status_info)

@app.route('/api/transcribe', methods=['POST'])
def transcribe():
    print("\n" + "-"*50)
    print("🎤 TRANSCRIBE ENDPOINT CALLED")
    start_time = time.time()
    
    try:
        data = request.json
        audio = data.get('audio', '')
        user_id = data.get('userId', 'unknown')
        
        print(f"📌 Audio data received from user: {user_id}")
        print(f"📌 Audio data length: {len(str(audio)) if audio else 0} characters")
        
        if not audio:
            print("❌ Error: Audio data is required")
            return jsonify({'error': 'Audio data is required'}), 400
        
        # In a real implementation, we would process the audio here
        # For now, we'll just return a simulated transcription
        transcription = "This is a simulated transcription. In a real implementation, we would process the audio data."
        
        end_time = time.time()
        time_taken = end_time - start_time
        print(f"✅ Transcription generated successfully in {time_taken:.2f} seconds")
        print(f"📊 Transcription: {transcription}")
        print("-"*50 + "\n")
        
        return jsonify({'transcription': transcription})
    
    except Exception as e:
        end_time = time.time()
        time_taken = end_time - start_time
        print(f"❌ Error generating transcription after {time_taken:.2f} seconds: {str(e)}")
        print("-"*50 + "\n")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 4000))
    print(f"🌐 Starting Flask server on port {port}...")
    print(f"📌 API will be available at http://localhost:{port}")
    print(f"📌 Using Ollama model: {chat_agent.model}")
    print(f"📌 Press Ctrl+C to stop the server")
    print("\n" + "="*70)
    app.run(host='0.0.0.0', port=port, debug=True)
