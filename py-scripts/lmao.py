import cv2
import mediapipe as mp
import os

count = 600
capture_offset = 50
gesture_name = "none"
save_dir = f"dataset/{gesture_name}"
os.makedirs(save_dir, exist_ok=True)

mp_hands = mp.solutions.hands # type: ignore[attr-defined]
hands = mp_hands.Hands(static_image_mode=True, max_num_hands=1)

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = hands.process(rgb)

    if result.multi_hand_landmarks:
        h, w, _ = frame.shape
        xs = []
        ys = []
        for lm in result.multi_hand_landmarks[0].landmark:
            xs.append(int(lm.x * w))
            ys.append(int(lm.y * h))
        x1, x2 = (min(xs) - capture_offset), (max(xs) + capture_offset)
        y1, y2 = (min(ys) - capture_offset), (max(ys) + capture_offset)

        crop = frame[y1:y2, x1:x2]
        if crop.size > 0:
            count += 1
            filename = os.path.join(save_dir, f"{count}.jpg")
            cv2.imwrite(filename, crop)
            print("saved:", filename)

    cv2.imshow(f"Collecting data for : {gesture_name}", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
