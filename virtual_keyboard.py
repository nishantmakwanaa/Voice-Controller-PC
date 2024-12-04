import tkinter as tk
import pyautogui


class FullVirtualKeyboard:
    def __init__(self, root):
        self.root = root
        self.root.title("Virtual Keyboard")
        self.create_widgets()

    def create_widgets(self):
        keys = [
            [
                "Esc",
                "F1",
                "F2",
                "F3",
                "F4",
                "F5",
                "F6",
                "F7",
                "F8",
                "F9",
                "F10",
                "F11",
                "F12",
                "PrtSc",
                "ScrLk",
                "Pause",
            ],
            [
                "`",
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                "0",
                "-",
                "=",
                "Backspace",
            ],
            ["Tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\"],
            [
                "CapsLock",
                "A",
                "S",
                "D",
                "F",
                "G",
                "H",
                "J",
                "K",
                "L",
                ";",
                "'",
                "Enter",
            ],
            ["Shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "Shift"],
            ["Ctrl", "Win", "Alt", "Space", "Alt", "Win", "Menu", "Ctrl"],
        ]

        row_val = 0

        for row in keys:
            col_val = 0
            for key in row:
                action = lambda x=key: self.on_button_click(x)
                b = tk.Button(self.root, text=key, width=5, height=2, command=action)
                b.grid(row=row_val, column=col_val)
                col_val += 1
            row_val += 1

    def on_button_click(self, key):
        if key == "Space":
            pyautogui.press("space")
        elif key == "Backspace":
            pyautogui.press("backspace")
        elif key == "Enter":
            pyautogui.press("enter")
        elif key == "Tab":
            pyautogui.press("tab")
        elif key == "Shift":
            pyautogui.press("shift")
        elif key == "Ctrl":
            pyautogui.press("ctrl")
        elif key == "Alt":
            pyautogui.press("alt")
        elif key == "CapsLock":
            pyautogui.press("capslock")
        elif key == "Esc":
            pyautogui.press("esc")
        elif key == "Win":
            pyautogui.press("winleft")
        elif key == "Menu":
            pyautogui.press("menu")
        else:
            pyautogui.typewrite(key)


if __name__ == "__main__":
    root = tk.Tk()
    FullVirtualKeyboard(root)
    root.mainloop()