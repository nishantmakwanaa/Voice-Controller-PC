"""
Bridge module to facilitate communication between Python backend and React Native frontend
"""

import json
import sys
import os
import time
import threading
import subprocess
import logging
from flask import Flask, request, jsonify

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("bridge.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("VoiceCommanderBridge")

class Bridge:
    """Bridge class to handle communication between Python and React Native"""
    
    def __init__(self, port=5000):
        self.port = port
        self.app = Flask(__name__)
        self.setup_routes()
        self.voice_commander = None
        
    def setup_routes(self):
        """Set up Flask routes for API endpoints"""
        
        @self.app.route('/api/status', methods=['GET'])
        def get_status():
            if not self.voice_commander:
                return jsonify({"error": "Voice Commander not initialized"}), 500
            
            return jsonify({
                "is_listening": self.voice_commander.is_listening,
                "wake_word": self.voice_commander.wake_word,
                "settings": self.voice_commander.settings
            })
        
        @self.app.route('/api/start', methods=['POST'])
        def start_listening():
            if not self.voice_commander:
                return jsonify({"error": "Voice Commander not initialized"}), 500
            
            result = self.voice_commander.start_listening()
            return jsonify(result)
        
        @self.app.route('/api/stop', methods=['POST'])
        def stop_listening():
            if not self.voice_commander:
                return jsonify({"error": "Voice Commander not initialized"}), 500
            
            result = self.voice_commander.stop_listening()
            return jsonify(result)
        
        @self.app.route('/api/execute', methods=['POST'])
        def execute_command():
            if not self.voice_commander:
                return jsonify({"error": "Voice Commander not initialized"}), 500
            
            data = request.json
            command = data.get('command', '')
            result = self.voice_commander.execute_command(command)
            return jsonify(result)
        
        @self.app.route('/api/recent', methods=['GET'])
        def get_recent_commands():
            if not self.voice_commander:
                return jsonify({"error": "Voice Commander not initialized"}), 500
            
            return jsonify(self.voice_commander.get_recent_commands())
        
        @self.app.route('/api/settings', methods=['GET'])
        def get_settings():
            if not self.voice_commander:
                return jsonify({"error": "Voice Commander not initialized"}), 500
            
            return jsonify(self.voice_commander.settings)
        
        @self.app.route('/api/settings', methods=['POST'])
        def update_settings():
            if not self.voice_commander:
                return jsonify({"error": "Voice Commander not initialized"}), 500
            
            data = request.json
            result = self.voice_commander.update_settings(data)
            return jsonify(result)
        
        @self.app.route('/api/microphones', methods=['GET'])
        def get_microphones():
            if not self.voice_commander:
                return jsonify({"error": "Voice Commander not initialized"}), 500
            
            return jsonify(self.voice_commander.get_available_microphones())
        
        @self.app.route('/api/test', methods=['GET'])
        def test_connection():
            return jsonify({"status": "ok", "message": "Bridge is running"})
    
    def set_voice_commander(self, voice_commander):
        """Set the voice commander instance"""
        self.voice_commander = voice_commander
    
    def start(self):
        """Start the Flask server"""
        logger.info(f"Starting bridge server on port {self.port}")
        self.app.run(host='127.0.0.1', port=self.port, threaded=True)
    
    def start_in_thread(self):
        """Start the Flask server in a separate thread"""
        threading.Thread(target=self.start, daemon=True).start()
        logger.info("Bridge server started in background thread")

def start_bridge(voice_commander, port=5000):
    """Start the bridge with the given voice commander instance"""
    bridge = Bridge(port=port)
    bridge.set_voice_commander(voice_commander)
    bridge.start_in_thread()
    return bridge

if __name__ == "__main__":
    # This is just for testing the bridge independently
    bridge = Bridge()
    bridge.start()

