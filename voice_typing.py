import speech_recognition as sr
import pyautogui
import threading
import time


def voice_typing():
    recognizer = sr.Recognizer()
    microphone = sr.Microphone()

    while True:
        try:
            with microphone as source:
                print("Adjusting for ambient noise... Please wait.")
                recognizer.adjust_for_ambient_noise(source, duration=1)
                print("Listening for your speech... Please speak.")
                audio = recognizer.listen(source)

            command = recognizer.recognize_google(audio)
            print(f"You said: {command}")

            pyautogui.write(command, interval=0.05)

        except sr.UnknownValueError:
            print("Could not understand the audio, please try again.")
        except sr.RequestError as e:
            print(f"Could not request results from Google Speech Recognition; {e}")
        except Exception as e:
            print(f"An error occurred: {e}")


def start_voice_typing():
    typing_thread = threading.Thread(target=voice_typing)
    typing_thread.daemon = True
    typing_thread.start()


if __name__ == "__main__":
    print("Starting voice typing program...")
    start_voice_typing()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Program terminated.")
