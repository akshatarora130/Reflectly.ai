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
        print(f"📌 Chat history length: {len(chat_history)}")
        
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
        print("-"*50 + "\n")
        return jsonify({'error': str(e)}), 500

@app.route('/api/status', methods=['GET'])
def status():
    print("\n" + "-"*50)
    print("ℹ️ STATUS ENDPOINT CALLED")
    
    status_info = {
        'status': 'ok',
        'ollama_status': 'simulated',
        'available_models': ['mistral:latest (simulated)'],
        'current_model': chat_agent.model,
        'api_url': chat_agent.api_url,
        'mode': 'simulation'
    }
    
    print(f"✅ Status check successful: {status_info}")
    print("-"*50 + "\n")
    
    return jsonify(status_info)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 4000))
    print(f"🌐 Starting Flask server on port {port}...")
    print(f"📌 API will be available at http://localhost:{port}")
    print(f"📌 Running in SIMULATION MODE - no actual Ollama calls will be made")
    print(f"📌 Press Ctrl+C to stop the server")
    print("\n" + "="*70)
    app.run(host='0.0.0.0', port=port, debug=True)
