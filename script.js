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
const inferenceTime = document.getElementById('time-delay-counter');
const leftValueElem = document.getElementById('left');
const rightValueElem = document.getElementById('right');
const operationResult = document.getElementById('result');

let cameraStream = null;
let gestureRecognizer;
let lastVideoTime = -1;
let results = undefined;
let timeStart;
let timeEnd;

let leftValue = 0;
let rightValue = 0;
let operation = '+';


// Load model
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
    return handednessIndex === 0 ? "#FF0000" : "#00FF00"
}


// Start detecting the camera stream
async function predictWebcam() {
    let nowInMs = Date.now();
    rightHandCVResultOutput.innerText = `RIGHT\nGestureCategory:\nConfidence:`
    leftHandCVResultOutput.innerText = `LEFT\nGestureCategory:\nConfidence:`
    if (camera.currentTime !== lastVideoTime) {
        lastVideoTime = camera.currentTime;
        
        timeStart = performance.now()

        results = gestureRecognizer.recognizeForVideo(camera, nowInMs);
        
        timeEnd = performance.now()
        inferenceTime.innerText = `Inference time (ms):\n ${Math.round(timeEnd - timeStart)}ms`
    }

    drawOverlayContext.save();
    drawOverlayContext.clearRect(0, 0, drawOverlay.width, drawOverlay.height);
    const drawingUtils = new DrawingUtils(drawOverlayContext);

    // Draw landmarks
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

    // Show gesture result
    if (results.gestures.length > 0) {
        for (let i = 0; i < results.gestures.length; i++) {
            const gestureCategory = results.gestures[i][0].categoryName;
            const gestureCategoryInt = categoryNameToInt(gestureCategory);
            const confidence_score = results.gestures[i][0].score;
            const confidence = Math.trunc(confidence_score * 100) / 100

            if (results.handednesses[i][0].index == 0) {
                rightHandCVResultOutput.innerText = `RIGHT\nGestureCategory: ${gestureCategory}\nConfidence: ${confidence}`
                rightValueElem.innerText = gestureCategoryInt;
                rightValue = gestureCategoryInt;
            } else {
                leftHandCVResultOutput.innerText = `LEFT\nGestureCategory: ${gestureCategory}\nConfidence: ${confidence}`
                leftValueElem.innerText = gestureCategoryInt;
                leftValue = gestureCategoryInt;
            }
        }

        operationResult.innerText = evalFingers();
    }
    
    // Call this function again to keep predicting when the browser is ready.
    window.requestAnimationFrame(predictWebcam);
}

function categoryNameToInt(categoryName) {
    switch (categoryName) {
        case 'one':
            return 1;
        case 'two':
            return 2;
        case 'three':
            return 3;
        case 'four':
            return 4;
        case 'five':
            return 5;
        case 'six':
            return 6;
        case 'seven':
            return 7;
        case 'eight':
            return 8;
        case 'nine':
            return 9;
        default:
            return 0;
    }
}

function evalFingers() {
    switch (operation) {
        case '+':
            return leftValue + rightValue;
        case '-':
            return leftValue - rightValue;
        case '*':
            return leftValue * rightValue;
        case '/':
            return leftValue / rightValue;
        case '^':
            return leftValue ** rightValue;
        case '%':
            return leftValue % rightValue
        default:
            return 0;
    }
}