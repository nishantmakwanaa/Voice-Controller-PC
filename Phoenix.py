import pyttsx3
import speech_recognition as sr
from datetime import date
import time
import webbrowser
import datetime
from pynput.keyboard import Key, Controller
import pyautogui
import sys
import os
from os import listdir
from os.path import isfile, join
import smtplib
import wikipedia
import Gesture_Controller
import eye_control
import app
from threading import Thread

today = date.today()
r = sr.Recognizer()
keyboard = Controller()
engine = pyttsx3.init("sapi5")
engine.setProperty("voice", engine.getProperty("voices")[0].id)

file_exp_status = False
files = []
path = ""
is_awake = True


def reply(message):
    print(message)


def reply(audio):
    app.ChatBot.addAppMsg(audio)
    print(audio)
    engine.say(audio)
    engine.runAndWait()


def wish():
    hour = int(datetime.datetime.now().hour)

    if hour >= 0 and hour < 12:
        reply("Good Morning!")
    elif hour >= 12 and hour < 18:
        reply("Good Afternoon!")
    else:
        reply("Good Evening!")

    reply("I am Phoenix, How May I Help You?")


with sr.Microphone() as source:
    r.energy_threshold = 500
    r.dynamic_energy_threshold = False


def record_audio():
    with sr.Microphone() as source:
        r.pause_threshold = 0.8
        voice_data = ""
        audio = r.listen(source, phrase_time_limit=5)

        try:
            voice_data = r.recognize_google(audio)
        except sr.RequestError:
            reply("Sorry My Service Is Down. Please Check Your Internet Connection.")
        except sr.UnknownValueError:
            print("Cannot Recognize.")
            pass
        return voice_data.lower()


def respond(voice_data):
    global file_exp_status, files, is_awake, path
    print(voice_data)
    voice_data = voice_data.replace("phoenix", "")
    app.eel.addUserMsg(voice_data)

    if not is_awake:
        if "wake up" in voice_data:
            is_awake = True
            wish()

    elif "hello" in voice_data:
        wish()

    elif "what is your name" in voice_data:
        reply("My Name Is Phoenix!")

    elif "date" in voice_data:
        reply(today.strftime("%B %d, %Y"))

    elif "time" in voice_data:
        reply(str(datetime.datetime.now()).split(" ")[1].split(".")[0])

    elif "search" in voice_data:
        query = voice_data.split("search")[1].strip()
        reply(f"Searching for {query}")
        url = f"https://google.com/search?q={query}"
        try:
            webbrowser.get().open(url)
            reply("This Is What I Found Sir On Google.")
        except:
            reply("Please Check Your Internet.")

    elif "location" in voice_data:
        reply("Which Place Are You Looking For?")
        temp_audio = record_audio()
        app.eel.addUserMsg(temp_audio)
        reply("Locating...")
        url = f"https://google.nl/maps/place/{temp_audio}/&amp;"
        try:
            webbrowser.get().open(url)
            reply("This Is What I Found Sir On Google.")
        except:
            reply("Please Check Your Internet.")

    elif "bye" in voice_data or "by" in voice_data:
        reply("Good Bye Sir! Have A Nice Day.")
        is_awake = False

    elif "exit" in voice_data or "terminate" in voice_data:
        if Gesture_Controller.GestureController.gc_mode:
            Gesture_Controller.GestureController.gc_mode = 0
        app.ChatBot.close()
        sys.exit()

    elif "start gesture control" in voice_data:
        if Gesture_Controller.GestureController.gc_mode:
            reply("Gesture Control Mode Is Actived.")
        else:
            gc = Gesture_Controller.GestureController()
            t = Thread(target=gc.start)
            t.start()
            reply("Launched Successfully.")

    elif "stop gesture control" in voice_data:
        if Gesture_Controller.GestureController.gc_mode:
            Gesture_Controller.GestureController.gc_mode = 0
            reply("Gesture Control Mode Is Deactivated.")
        else:
            reply("Gesture Control Mode Is Already Deactivated.")

    elif "start eye control" in voice_data:
        if eye_control.EyeController.gc_mode:
            reply("Eye Control Mode Is Actived.")
        else:
            gc = eye_control.EyeController()
            t = Thread(target=gc.start)
            t.start()
            reply("Launched Successfully.")

    elif "stop eye control" in voice_data:
        if eye_control.EyeController.gc_mode:
            eye_control.EyeController.gc_mode = 0
            reply("Eye Control Mode Is Deactivated.")
        else:
            reply("Eye Control Mode Is Already Deactivated.")

    elif "copy" in voice_data:
        with keyboard.pressed(Key.ctrl):
            keyboard.press("c")
            keyboard.release("c")
        reply("Copied.")

    elif "paste" in voice_data:
        with keyboard.pressed(Key.ctrl):
            keyboard.press("v")
            keyboard.release("v")
        reply("Pasted.")

    elif "list" in voice_data:
        counter = 0
        path = "C://"
        files = listdir(path)
        filestr = ""
        for f in files:
            counter += 1
            filestr += str(counter) + ":  " + f + "<br>"
        file_exp_status = True
        reply("These Are The Files In Your Root Directory.")
        app.ChatBot.addAppMsg(filestr)

    elif "open" in voice_data:
        app_name = voice_data.replace("open", "").strip()
        try:
            os.startfile(app_name)
            reply(f"Opened {app_name}.")
        except Exception:
            reply(f"Failed to open {app_name}. Please check the name or file.")

    elif "window maximise" in voice_data:
        pyautogui.hotkey("alt", "space")
        pyautogui.press("x")
        reply("Window maximized.")

    elif "window minimise" in voice_data:
        pyautogui.hotkey("alt", "space")
        pyautogui.press("n")
        reply("Window minimized.")

    elif "voice typing" in voice_data:
        if "on" in voice_data:
            reply("Voice typing mode on.")

        elif "off" in voice_data:
            reply("Voice typing mode off.")

    elif "insert tab" in voice_data:
        keyboard.press(Key.tab)
        keyboard.release(Key.tab)
        reply("Tab inserted.")

    elif "insert whitespace" in voice_data:
        keyboard.press(Key.space)
        keyboard.release(Key.space)
        reply("Whitespace inserted.")

    elif "clear" in voice_data:
        pyautogui.hotkey("ctrl", "a")
        pyautogui.press("delete")
        reply("Cleared.")

    elif "cut" in voice_data:
        pyautogui.hotkey("ctrl", "x")
        reply("Cut.")

    elif "backspace" in voice_data:
        pyautogui.press("backspace")
        reply("Backspace pressed.")

    elif "press" in voice_data:
        key_name = voice_data.replace("press", "").strip()
        pyautogui.press(key_name)
        reply(f"Pressed {key_name}.")

    elif "start" in voice_data:
        pyautogui.press("win")
        reply("Start menu opened.")

    elif "recycle bin" in voice_data:
        os.startfile("shell:RecycleBinFolder")
        reply("Recycle bin opened.")

    elif "show desktop" in voice_data:
        pyautogui.hotkey("win", "d")
        reply("Desktop shown.")

    elif "scroll up" in voice_data:
        pyautogui.scroll(10)
        reply("Scrolled up.")

    elif "scroll down" in voice_data:
        pyautogui.scroll(-10)
        reply("Scrolled down.")

    elif file_exp_status:
        counter = 0
        if "open" in voice_data:
            if isfile(join(path, files[int(voice_data.split(" ")[-1]) - 1])):
                os.startfile(path + files[int(voice_data.split(" ")[-1]) - 1])
                file_exp_status = False
            else:
                try:
                    path = path + files[int(voice_data.split(" ")[-1]) - 1] + "//"
                    files = listdir(path)
                    filestr = ""
                    for f in files:
                        counter += 1
                        filestr += str(counter) + ":  " + f + "<br>"
                    reply("Opened Successfully.")
                    app.ChatBot.addAppMsg(filestr)

                except:
                    reply("You Do Not Have Permission To Access This Folder.")

        if "back" in voice_data:
            filestr = ""
            if path == "C://":
                reply("Sorry, This Is The Root Directory.")
            else:
                a = path.split("//")[:-2]
                path = "//".join(a)
                path += "//"
                files = listdir(path)
                for f in files:
                    counter += 1
                    filestr += str(counter) + ":  " + f + "<br>"
                reply("ok")
                app.ChatBot.addAppMsg(filestr)

    else:
        reply("I Am Not Functioned To Do This!")


t1 = Thread(target=app.ChatBot.start)
t1.start()

while not app.ChatBot.started:
    time.sleep(0.5)

wish()
voice_data = None
while True:
    if app.ChatBot.isUserInput():
        voice_data = app.ChatBot.popUserInput()
    else:
        voice_data = record_audio()

    if "phoenix" in voice_data:
        try:
            respond(voice_data)
        except SystemExit:
            reply("Exit Successful.")
            break
        except Exception as e:
            print(f"EXCEPTION: {e}")
            break