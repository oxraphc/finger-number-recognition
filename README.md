# Finger Number Recognition using MediaPipe Tasks

Repositori ini dibuat untuk menyimpan file-file development untuk tugas kelompok Bina Talenta Indonesia membuat aplikasi berbasis AI.

## Membuat Dataset
Lihat guide yang saya ikuti [disini](https://ai.google.dev/edge/mediapipe/solutions/customization/gesture_recognizer)
1. Install Python 3.10 karena beberapa dependencies tidak kompatibel dengan versi Python terbaru
2. Buat Virtual Environment. (opsional, tapi praktik developer yang baik dan bahagia.)  
    ```bash
    # Linux
    python3.10 -m venv myenv
    source myenv/bin/activate
    ```
3. Clone repositori ini.
   ```bash
   git clone https://github.com/oxraphc/finger-number-recognition.git
   cd finger-number-recognition
   ```
4. Install dependencies.
   ```bash
   pip install -r requirements.txt
   ```
5. Buka `lmao.py` di `py-script` dan ganti label data (`gesture_name`) di line 7.
6. Run `lmao.py` untuk memulai, tekan `q` untuk keluar.
   ```bash
   python3.10 py-script/lmao.py
   ```

## Melatih Model

Melatih model dapat dilakukan dengan sangat gampang dan berkah menggunakan Google Colab di [sini](https://github.com/oxraphc/finger-number-recognition/blob/main/MediaPipe_Model_Maker.ipynb).

## Static Web App

Sebuah web app static telah dibuat oleh saya, dan dapat di lihat di GitHub Pages ini.
https://oxraphc.github.io/finger-number-recognition