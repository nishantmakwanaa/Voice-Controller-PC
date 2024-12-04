import cv2
import mediapipe as mp
import pyautogui
from threading import Thread


class EyeController:
    gc_mode = False

    def __init__(self):
        self.face_mesh = mp.solutions.face_mesh.FaceMesh(refine_landmarks=True)
        self.mp_drawing = mp.solutions.drawing_utils

        self.cam = cv2.VideoCapture(0)
        self.screen_w, self.screen_h = pyautogui.size()

    def start(self):
        EyeController.gc_mode = True
        while EyeController.gc_mode:

            ret, image = self.cam.read()
            if not ret:
                break

            image = cv2.flip(image, 1)
            window_h, window_w, _ = image.shape
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            processed_image = self.face_mesh.process(rgb_image)
            all_faces_landmarks_points = processed_image.multi_face_landmarks

            if all_faces_landmarks_points:
                one_face_landmark_point = all_faces_landmarks_points[0].landmark

                for id, landmark_point in enumerate(one_face_landmark_point[474:478]):
                    x = int(landmark_point.x * window_w)
                    y = int(landmark_point.y * window_h)

                    if id == 1:
                        mouse_x = int(self.screen_w / window_w * x)
                        mouse_y = int(self.screen_h / window_h * y)
                        pyautogui.moveTo(mouse_x, mouse_y)

                    cv2.circle(image, (x, y), 3, (0, 0, 225))

                left_eye = [one_face_landmark_point[145], one_face_landmark_point[159]]
                for landmark_point in left_eye:
                    x = int(landmark_point.x * window_w)
                    y = int(landmark_point.y * window_h)
                    cv2.circle(image, (x, y), 3, (0, 225, 225))

                if left_eye[0].y - left_eye[1].y < 0.01:
                    pyautogui.click()
                    pyautogui.sleep(2)
                    print("Mouse clicked")

            cv2.imshow("Eye Control Mouse", image)
            key = cv2.waitKey(100)
            if key == 27:
                break

        self.cam.release()
        cv2.destroyAllWindows()
        EyeController.gc_mode = False