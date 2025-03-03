import os
import sys
import json
import time
import threading
import logging
import speech_recognition as sr
import pyttsx3
import pyaudio
import wave
import win32api
import win32con
import win32gui
import win32process
import psutil
import webbrowser
import subprocess
import ctypes
import shutil
from datetime import datetime
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("voice_commander.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("VoiceCommander")

class VoiceCommander:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.engine = pyttsx3.init()
        self.is_listening = False
        self.wake_word = "hey pc"
        self.commands = {}
        self.recent_commands = []
        self.settings = self.load_settings()
        self.initialize_commands()
        
        # Set up voice properties
        voices = self.engine.getProperty('voices')
        self.engine.setProperty('voice', voices[0].id)  # Default to first voice
        self.engine.setProperty('rate', 175)  # Speed of speech
        
        logger.info("VoiceCommander initialized")
    
    def load_settings(self):
        """Load settings from config file"""
        default_settings = {
            "wake_word": "hey pc",
            "language": "en-US",
            "voice_feedback": True,
            "run_in_background": True,
            "auto_start_listening": False,
            "microphone_sensitivity": 75,
            "selected_microphone": "default",
            "command_feedback": True,
            "voice_confirmation": True,
            "dark_mode": True
        }
        
        try:
            if os.path.exists("settings.json"):
                with open("settings.json", "r") as f:
                    settings = json.load(f)
                    # Update with any missing default settings
                    for key, value in default_settings.items():
                        if key not in settings:
                            settings[key] = value
                    return settings
            else:
                return default_settings
        except Exception as e:
            logger.error(f"Error loading settings: {e}")
            return default_settings
    
    def save_settings(self):
        """Save settings to config file"""
        try:
            with open("settings.json", "w") as f:
                json.dump(self.settings, f, indent=4)
            logger.info("Settings saved successfully")
            return True
        except Exception as e:
            logger.error(f"Error saving settings: {e}")
            return False
    
    def speak(self, text):
        """Convert text to speech if voice feedback is enabled"""
        if self.settings.get("voice_feedback", True):
            self.engine.say(text)
            self.engine.runAndWait()
    
    def initialize_commands(self):
        """Initialize all available commands"""
        # System Control Commands
        self.commands["shut down the computer"] = self.shutdown_computer
        self.commands["restart the computer"] = self.restart_computer
        self.commands["put the computer to sleep"] = self.sleep_computer
        self.commands["hibernate the computer"] = self.hibernate_computer
        self.commands["lock the computer"] = self.lock_computer
        self.commands["sign out of the computer"] = self.sign_out
        self.commands["switch user"] = self.switch_user
        self.commands["open task manager"] = self.open_task_manager
        self.commands["open control panel"] = self.open_control_panel
        self.commands["open settings"] = self.open_settings
        self.commands["check battery level"] = self.check_battery
        self.commands["show system information"] = self.show_system_info
        
        # File and Folder Management
        self.commands["open file explorer"] = self.open_file_explorer
        self.commands["create a new folder"] = self.create_new_folder
        self.commands["open the recycle bin"] = self.open_recycle_bin
        self.commands["empty the recycle bin"] = self.empty_recycle_bin
        
        # Application Management
        self.commands["open"] = self.open_application  # Partial command, needs app name
        self.commands["close"] = self.close_application  # Partial command, needs app name
        
        # Web Browsing Commands
        self.commands["search for"] = self.web_search  # Partial command, needs search query
        
        # Media Control Commands
        self.commands["play"] = self.media_play
        self.commands["pause"] = self.media_pause
        self.commands["stop"] = self.media_stop
        self.commands["next track"] = self.media_next
        self.commands["previous track"] = self.media_previous
        self.commands["increase volume"] = self.volume_up
        self.commands["decrease volume"] = self.volume_down
        self.commands["mute"] = self.volume_mute
        self.commands["unmute"] = self.volume_unmute
        
        # Miscellaneous Commands
        self.commands["take a screenshot"] = self.take_screenshot
        self.commands["open calculator"] = lambda: self.open_application("calculator")
        self.commands["open notepad"] = lambda: self.open_application("notepad")
        self.commands["open command prompt"] = self.open_command_prompt
        
        logger.info(f"Initialized {len(self.commands)} commands")
    
    def start_listening(self):
        """Start listening for voice commands"""
        self.is_listening = True
        threading.Thread(target=self._listen_loop, daemon=True).start()
        logger.info("Started listening for commands")
        return {"status": "listening", "message": "Started listening for commands"}
    
    def stop_listening(self):
        """Stop listening for voice commands"""
        self.is_listening = False
        logger.info("Stopped listening for commands")
        return {"status": "stopped", "message": "Stopped listening for commands"}
    
    def _listen_loop(self):
        """Background thread that continuously listens for commands"""
        with sr.Microphone() as source:
            # Adjust for ambient noise
            self.recognizer.adjust_for_ambient_noise(source)
            
            while self.is_listening:
                try:
                    logger.debug("Listening for audio...")
                    audio = self.recognizer.listen(source, timeout=1, phrase_time_limit=5)
                    
                    try:
                        text = self.recognizer.recognize_google(audio, language=self.settings.get("language", "en-US"))
                        text = text.lower()
                        logger.info(f"Recognized: {text}")
                        
                        # Check for wake word
                        if self.wake_word in text:
                            # Remove wake word from command
                            command = text.replace(self.wake_word, "").strip()
                            self.process_command(command)
                        elif self.is_listening and not self.wake_word:
                            # If no wake word is set, process all recognized speech
                            self.process_command(text)
                    
                    except sr.UnknownValueError:
                        logger.debug("Could not understand audio")
                    except sr.RequestError as e:
                        logger.error(f"Error with speech recognition service: {e}")
                
                except Exception as e:
                    logger.error(f"Error in listen loop: {e}")
                    time.sleep(1)  # Prevent tight loop in case of repeated errors
    
    def process_command(self, command_text):
        """Process a recognized command"""
        try:
            # Add to recent commands
            self.recent_commands.append({
                "command": command_text,
                "timestamp": datetime.now().isoformat()
            })
            if len(self.recent_commands) > 10:
                self.recent_commands.pop(0)
            
            # Check for exact command match
            if command_text in self.commands:
                logger.info(f"Executing command: {command_text}")
                if self.settings.get("command_feedback", True):
                    self.speak(f"Executing {command_text}")
                result = self.commands[command_text]()
                return {"status": "success", "command": command_text, "result": result}
            
            # Check for partial command match (commands that start with a keyword)
            for cmd_prefix, cmd_func in self.commands.items():
                if command_text.startswith(cmd_prefix):
                    # Extract the argument (everything after the command prefix)
                    argument = command_text[len(cmd_prefix):].strip()
                    if argument:
                        logger.info(f"Executing command: {cmd_prefix} with argument: {argument}")
                        if self.settings.get("command_feedback", True):
                            self.speak(f"Executing {cmd_prefix} {argument}")
                        result = cmd_func(argument)
                        return {"status": "success", "command": command_text, "result": result}
            
            # No matching command found
            logger.warning(f"Unknown command: {command_text}")
            if self.settings.get("command_feedback", True):
                self.speak("Sorry, I don't understand that command")
            return {"status": "error", "message": "Unknown command", "command": command_text}
        
        except Exception as e:
            logger.error(f"Error processing command '{command_text}': {e}")
            if self.settings.get("command_feedback", True):
                self.speak("Error executing command")
            return {"status": "error", "message": str(e), "command": command_text}
    
    def execute_command(self, command_text):
        """Execute a command programmatically (not from voice)"""
        return self.process_command(command_text)
    
    def get_recent_commands(self):
        """Get list of recent commands"""
        return self.recent_commands
    
    def update_settings(self, new_settings):
        """Update settings with new values"""
        self.settings.update(new_settings)
        self.save_settings()
        
        # Apply any immediate setting changes
        if "wake_word" in new_settings:
            self.wake_word = new_settings["wake_word"]
        
        return {"status": "success", "message": "Settings updated"}
    
    def get_available_microphones(self):
        """Get list of available microphones"""
        try:
            mics = []
            for index, name in enumerate(sr.Microphone.list_microphone_names()):
                mics.append({"id": index, "name": name})
            return mics
        except Exception as e:
            logger.error(f"Error getting microphones: {e}")
            return []
    
    # System Control Commands
    def shutdown_computer(self):
        """Shut down the computer"""
        self.speak("Shutting down the computer")
        os.system("shutdown /s /t 10")
        return {"status": "success", "message": "Computer will shut down in 10 seconds"}
    
    def restart_computer(self):
        """Restart the computer"""
        self.speak("Restarting the computer")
        os.system("shutdown /r /t 10")
        return {"status": "success", "message": "Computer will restart in 10 seconds"}
    
    def sleep_computer(self):
        """Put the computer to sleep"""
        self.speak("Putting the computer to sleep")
        os.system("rundll32.exe powrprof.dll,SetSuspendState 0,1,0")
        return {"status": "success", "message": "Computer going to sleep"}
    
    def hibernate_computer(self):
        """Hibernate the computer"""
        self.speak("Hibernating the computer")
        os.system("shutdown /h")
        return {"status": "success", "message": "Computer hibernating"}
    
    def lock_computer(self):
        """Lock the computer"""
        self.speak("Locking the computer")
        ctypes.windll.user32.LockWorkStation()
        return {"status": "success", "message": "Computer locked"}
    
    def sign_out(self):
        """Sign out of the computer"""
        self.speak("Signing out")
        os.system("shutdown /l")
        return {"status": "success", "message": "Signing out"}
    
    def switch_user(self):
        """Switch user"""
        self.speak("Switching user")
        os.system("tsdiscon")
        return {"status": "success", "message": "Switching user"}
    
    def open_task_manager(self):
        """Open Task Manager"""
        self.speak("Opening Task Manager")
        subprocess.Popen("taskmgr")
        return {"status": "success", "message": "Task Manager opened"}
    
    def open_control_panel(self):
        """Open Control Panel"""
        self.speak("Opening Control Panel")
        subprocess.Popen("control")
        return {"status": "success", "message": "Control Panel opened"}
    
    def open_settings(self):
        """Open Windows Settings"""
        self.speak("Opening Settings")
        os.system("start ms-settings:")
        return {"status": "success", "message": "Settings opened"}
    
    def check_battery(self):
        """Check battery level"""
        try:
            battery = psutil.sensors_battery()
            if battery:
                percent = battery.percent
                power_plugged = battery.power_plugged
                status = "plugged in" if power_plugged else "not plugged in"
                message = f"Battery is at {percent}% and {status}"
                self.speak(message)
                return {"status": "success", "battery_level": percent, "plugged_in": power_plugged, "message": message}
            else:
                message = "No battery detected"
                self.speak(message)
                return {"status": "error", "message": message}
        except Exception as e:
            logger.error(f"Error checking battery: {e}")
            return {"status": "error", "message": str(e)}
    
    def show_system_info(self):
        """Show system information"""
        try:
            cpu_percent = psutil.cpu_percent()
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            message = f"CPU usage is {cpu_percent}%, Memory usage is {memory.percent}%, Disk usage is {disk.percent}%"
            self.speak(message)
            
            return {
                "status": "success",
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "disk_percent": disk.percent,
                "message": message
            }
        except Exception as e:
            logger.error(f"Error getting system info: {e}")
            return {"status": "error", "message": str(e)}
    
    # File and Folder Management
    def open_file_explorer(self):
        """Open File Explorer"""
        self.speak("Opening File Explorer")
        subprocess.Popen("explorer")
        return {"status": "success", "message": "File Explorer opened"}
    
    def create_new_folder(self, name=None):
        """Create a new folder"""
        try:
            if not name:
                name = f"New Folder {datetime.now().strftime('%Y-%m-%d %H-%M-%S')}"
            
            # Create in Documents folder by default
            documents_path = os.path.join(os.path.expanduser("~"), "Documents")
            new_folder_path = os.path.join(documents_path, name)
            
            os.makedirs(new_folder_path, exist_ok=True)
            
            message = f"Created new folder: {name}"
            self.speak(message)
            
            # Open the folder
            subprocess.Popen(f'explorer "{new_folder_path}"')
            
            return {"status": "success", "path": new_folder_path, "message": message}
        except Exception as e:
            logger.error(f"Error creating folder: {e}")
            return {"status": "error", "message": str(e)}
    
    def open_recycle_bin(self):
        """Open the Recycle Bin"""
        self.speak("Opening Recycle Bin")
        subprocess.Popen("explorer shell:RecycleBinFolder")
        return {"status": "success", "message": "Recycle Bin opened"}
    
    def empty_recycle_bin(self):
        """Empty the Recycle Bin"""
        self.speak("Emptying Recycle Bin")
        try:
            winshell.recycle_bin().empty(confirm=False, show_progress=False, sound=True)
            return {"status": "success", "message": "Recycle Bin emptied"}
        except Exception as e:
            logger.error(f"Error emptying recycle bin: {e}")
            return {"status": "error", "message": str(e)}
    
    # Application Management
    def open_application(self, app_name=None):
        """Open an application"""
        if not app_name:
            return {"status": "error", "message": "No application name provided"}
        
        try:
            app_name = app_name.lower()
            self.speak(f"Opening {app_name}")
            
            # Common applications
            app_map = {
                "chrome": "chrome",
                "firefox": "firefox",
                "edge": "msedge",
                "word": "winword",
                "excel": "excel",
                "powerpoint": "powerpnt",
                "outlook": "outlook",
                "notepad": "notepad",
                "calculator": "calc",
                "paint": "mspaint",
                "spotify": "spotify",
                "vlc": "vlc",
                "steam": "steam",
                "discord": "discord",
                "zoom": "zoom"
            }
            
            if app_name in app_map:
                subprocess.Popen(app_map[app_name])
            else:
                # Try to run the app name directly
                subprocess.Popen(app_name)
            
            return {"status": "success", "message": f"Opened {app_name}"}
        except Exception as e:
            logger.error(f"Error opening application {app_name}: {e}")
            return {"status": "error", "message": str(e)}
    
    def close_application(self, app_name=None):
        """Close an application"""
        if not app_name:
            return {"status": "error", "message": "No application name provided"}
        
        try:
            app_name = app_name.lower()
            self.speak(f"Closing {app_name}")
            
            # Try to find the process and terminate it
            for proc in psutil.process_iter(['pid', 'name']):
                if app_name in proc.info['name'].lower():
                    proc.terminate()
                    return {"status": "success", "message": f"Closed {app_name}"}
            
            return {"status": "error", "message": f"Could not find {app_name}"}
        except Exception as e:
            logger.error(f"Error closing application {app_name}: {e}")
            return {"status": "error", "message": str(e)}
    
    # Web Browsing Commands
    def web_search(self, query=None):
        """Search the web for a query"""
        if not query:
            return {"status": "error", "message": "No search query provided"}
        
        try:
            self.speak(f"Searching for {query}")
            webbrowser.open(f"https://www.google.com/search?q={query}")
            return {"status": "success", "message": f"Searched for {query}"}
        except Exception as e:
            logger.error(f"Error searching web: {e}")
            return {"status": "error", "message": str(e)}
    
    # Media Control Commands
    def media_play(self):
        """Play media"""
        self.speak("Playing media")
        try:
            win32api.keybd_event(win32con.VK_MEDIA_PLAY_PAUSE, 0, 0, 0)
            win32api.keybd_event(win32con.VK_MEDIA_PLAY_PAUSE, 0, win32con.KEYEVENTF_KEYUP, 0)
            return {"status": "success", "message": "Media play command sent"}
        except Exception as e:
            logger.error(f"Error playing media: {e}")
            return {"status": "error", "message": str(e)}
    
    def media_pause(self):
        """Pause media"""
        self.speak("Pausing media")
        try:
            win32api.keybd_event(win32con.VK_MEDIA_PLAY_PAUSE, 0, 0, 0)
            win32api.keybd_event(win32con.VK_MEDIA_PLAY_PAUSE, 0, win32con.KEYEVENTF_KEYUP, 0)
            return {"status": "success", "message": "Media pause command sent"}
        except Exception as e:
            logger.error(f"Error pausing media: {e}")
            return {"status": "error", "message": str(e)}
    
    def media_stop(self):
        """Stop media"""
        self.speak("Stopping media")
        try:
            win32api.keybd_event(win32con.VK_MEDIA_STOP, 0, 0, 0)
            win32api.keybd_event(win32con.VK_MEDIA_STOP, 0, win32con.KEYEVENTF_KEYUP, 0)
            return {"status": "success", "message": "Media stop command sent"}
        except Exception as e:
            logger.error(f"Error stopping media: {e}")
            return {"status": "error", "message": str(e)}
    
    def media_next(self):
        """Next track"""
        self.speak("Next track")
        try:
            win32api.keybd_event(win32con.VK_MEDIA_NEXT_TRACK, 0, 0, 0)
            win32api.keybd_event(win32con.VK_MEDIA_NEXT_TRACK, 0, win32con.KEYEVENTF_KEYUP, 0)
            return {"status": "success", "message": "Next track command sent"}
        except Exception as e:
            logger.error(f"Error next track: {e}")
            return {"status": "error", "message": str(e)}
    
    def media_previous(self):
        """Previous track"""
        self.speak("Previous track")
        try:
            win32api.keybd_event(win32con.VK_MEDIA_PREV_TRACK, 0, 0, 0)
            win32api.keybd_event(win32con.VK_MEDIA_PREV_TRACK, 0, win32con.KEYEVENTF_KEYUP, 0)
            return {"status": "success", "message": "Previous track command sent"}
        except Exception as e:
            logger.error(f"Error previous track: {e}")
            return {"status": "error", "message": str(e)}
    
    def volume_up(self):
        """Increase volume"""
        self.speak("Increasing volume")
        try:
            for _ in range(5):  # Increase by 5 steps
                win32api.keybd_event(win32con.VK_VOLUME_UP, 0, 0, 0)
                win32api.keybd_event(win32con.VK_VOLUME_UP, 0, win32con.KEYEVENTF_KEYUP, 0)
                time.sleep(0.1)
            return {"status": "success", "message": "Volume increased"}
        except Exception as e:
            logger.error(f"Error increasing volume: {e}")
            return {"status": "error", "message": str(e)}
    
    def volume_down(self):
        """Decrease volume"""
        self.speak("Decreasing volume")
        try:
            for _ in range(5):  # Decrease by 5 steps
                win32api.keybd_event(win32con.VK_VOLUME_DOWN, 0, 0, 0)
                win32api.keybd_event(win32con.VK_VOLUME_DOWN, 0, win32con.KEYEVENTF_KEYUP, 0)
                time.sleep(0.1)
            return {"status": "success", "message": "Volume decreased"}
        except Exception as e:
            logger.error(f"Error decreasing volume: {e}")
            return {"status": "error", "message": str(e)}
    
    def volume_mute(self):
        """Mute volume"""
        self.speak("Muting volume")
        try:
            win32api.keybd_event(win32con.VK_VOLUME_MUTE, 0, 0, 0)
            win32api.keybd_event(win32con.VK_VOLUME_MUTE, 0, win32con.KEYEVENTF_KEYUP, 0)
            return {"status": "success", "message": "Volume muted"}
        except Exception as e:
            logger.error(f"Error muting volume: {e}")
            return {"status": "error", "message": str(e)}
    
    def volume_unmute(self):
        """Unmute volume"""
        self.speak("Unmuting volume")
        try:
            win32api.keybd_event(win32con.VK_VOLUME_MUTE, 0, 0, 0)
            win32api.keybd_event(win32con.VK_VOLUME_MUTE, 0, win32con.KEYEVENTF_KEYUP, 0)
            return {"status": "success", "message": "Volume unmuted"}
        except Exception as e:
            logger.error(f"Error unmuting volume: {e}")
            return {"status": "error", "message": str(e)}
    
    # Miscellaneous Commands
    def take_screenshot(self):
        """Take a screenshot"""
        self.speak("Taking screenshot")
        try:
            # Create screenshots directory if it doesn't exist
            screenshots_dir = os.path.join(os.path.expanduser("~"), "Pictures", "Screenshots")
            os.makedirs(screenshots_dir, exist_ok=True)
            
            # Generate filename with timestamp
            filename = f"screenshot_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            filepath = os.path.join(screenshots_dir, filename)
            
            # Take screenshot using pyautogui
            import pyautogui
            screenshot = pyautogui.screenshot()
            screenshot.save(filepath)
            
            # Open the screenshot
            subprocess.Popen(f'explorer "{filepath}"')
            
            return {"status": "success", "path": filepath, "message": f"Screenshot saved to {filepath}"}
        except Exception as e:
            logger.error(f"Error taking screenshot: {e}")
            return {"status": "error", "message": str(e)}
    
    def open_command_prompt(self):
        """Open Command Prompt"""
        self.speak("Opening Command Prompt")
        subprocess.Popen("cmd.exe")
        return {"status": "success", "message": "Command Prompt opened"}

# API server for communication with the React Native frontend
def start_api_server(voice_commander):
    from flask import Flask, request, jsonify
    
    app = Flask(__name__)
    
    @app.route('/api/status', methods=['GET'])
    def get_status():
        return jsonify({
            "is_listening": voice_commander.is_listening,
            "wake_word": voice_commander.wake_word,
            "settings": voice_commander.settings
        })
    
    @app.route('/api/start', methods=['POST'])
    def start_listening():
        result = voice_commander.start_listening()
        return jsonify(result)
    
    @app.route('/api/stop', methods=['POST'])
    def stop_listening():
        result = voice_commander.stop_listening()
        return jsonify(result)
    
    @app.route('/api/execute', methods=['POST'])
    def execute_command():
        data = request.json
        command = data.get('command', '')
        result = voice_commander.execute_command(command)
        return jsonify(result)
    
    @app.route('/api/recent', methods=['GET'])
    def get_recent_commands():
        return jsonify(voice_commander.get_recent_commands())
    
    @app.route('/api/settings', methods=['GET'])
    def get_settings():
        return jsonify(voice_commander.settings)
    
    @app.route('/api/settings', methods=['POST'])
    def update_settings():
        data = request.json
        result = voice_commander.update_settings(data)
        return jsonify(result)
    
    @app.route('/api/microphones', methods=['GET'])
    def get_microphones():
        return jsonify(voice_commander.get_available_microphones())
    
    app.run(host='127.0.0.1', port=5000)

if __name__ == "__main__":
    voice_commander = VoiceCommander()
    
    # Start API server in a separate thread
    threading.Thread(target=start_api_server, args=(voice_commander,), daemon=True).start()
    
    # Auto-start listening if enabled in settings
    if voice_commander.settings.get("auto_start_listening", False):
        voice_commander.start_listening()
    
    # Keep the main thread alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        voice_commander.stop_listening()
        logger.info("VoiceCommander stopped")

