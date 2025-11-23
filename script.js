import {
    GestureRecognizer,
    FilesetResolver,
    DrawingUtils
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";


const camera = document.getElementById('camera');
const drawOverlay = document.getElementById('draw-overlay');
const drawOverlayContext = drawOverlay.getContext('2d');
const leftHandCVResultOutput = document.getElementById('left-hand-result');
const rightHandCVResultOutput = document.getElementById('right-hand-result');

let cameraStream = null;
let gestureRecognizer;
let lastVideoTime = -1;
let results = undefined;

let left_value = 0;
let right_value = 0;
let operation = '+';
let operationResult = 0;


// Load Model
console.log("Begin loading model.")
const createGestureRecognizer = async () => {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );
    gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath:
                "model/finger_number_recognizer_v4.task",
            delegate: "GPU"
        },
        runningMode: 'VIDEO',
        numHands: 2
    });
};
await createGestureRecognizer();
console.log("Finished loading.")


async function openCamera() {
    return new Promise(async (resolve) => {
        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    aspectRatio: 16 / 9,
                },
                audio: false
            });
            camera.srcObject = cameraStream;
            await new Promise(resolve => camera.onloadedmetadata = resolve);
            camera.play();
            console.log('Camera opened.');
            console.log(`Camera dimensions : ${camera.videoWidth} x ${camera.videoHeight}`);
            resolve(true);
        } catch (e) {
            console.error('Error accessing camera: ', e);
            resolve(false);
        }
    })
}
if (await openCamera()) {
    predictWebcam();
}


function getLandmarkColor(handednessIndex) {
    return handednessIndex === 0 ? "#00FF00" : "#FF0000"
}
// "RIGHT" IS 0
// "LEFT" IS 1
function getLineColor(handednessIndex) {
    return handednessIndex === 0 ? "#FF0000": "#00FF00"
}


// Start detecting the stream.
async function predictWebcam() {
    let nowInMs = Date.now();
    if (camera.currentTime !== lastVideoTime) {
        lastVideoTime = camera.currentTime;
        results = gestureRecognizer.recognizeForVideo(camera, nowInMs);
    }

    drawOverlayContext.save();
    drawOverlayContext.clearRect(0, 0, drawOverlay.width, drawOverlay.height);
    const drawingUtils = new DrawingUtils(drawOverlayContext);

    if (results.landmarks) {
        for (let i = 0; i < results.landmarks.length; i++) {
            drawingUtils.drawConnectors(
                results.landmarks[i],
                GestureRecognizer.HAND_CONNECTIONS,
                {
                    color: getLineColor(results.handednesses[i][0].index),
                    lineWidth: 1
                }
            );
            drawingUtils.drawLandmarks(
                results.landmarks[i],
                {
                    color: getLandmarkColor(results.handednesses[i][0].index),
                    lineWidth: 0,
                    radius: 1
                }
            );
        }
    }
    drawOverlayContext.restore();

    if (results.gestures.length > 0) {
        for (let i = 0; i < results.gestures.length; i++) {
            const gestureCategory = results.gestures[i][0].categoryName;
            const confidence_score = results.gestures[i][0].score;
            const confidence = Math.trunc(confidence_score * 100) / 100
            if (results.handednesses[i][0].index == 0) {
                rightHandCVResultOutput.innerText = `RIGHT\nGestureCategory: ${gestureCategory}\nConfidence: ${confidence}`
            } else {
                leftHandCVResultOutput.innerText = `LEFT\nGestureCategory: ${gestureCategory}\nConfidence: ${confidence}`
            }
        }
    }

    // Call this function again to keep predicting when the browser is ready.
    window.requestAnimationFrame(predictWebcam);
}