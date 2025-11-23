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
let result = 0;


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

function getLineColor(handednessIndex) {
    return handednessIndex === 0 ? "#FF0000" : "#00FF00"
}


async function predictWebcam() {
    // Start detecting the stream.
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


    // if (results.gestures.length > 0) {
    //   gestureOutput.style.display = "block";
    //   gestureOutput.style.width = videoWidth;
    //   const categoryName = results.gestures[0][0].categoryName;
    //   const categoryName2 = null;
    //   const categoryScore = parseFloat(
    //     results.gestures[0][0].score * 100
    //   ).toFixed(2);
    //   const handedness = results.handednesses[0][0].displayName;
    //   gestureOutput.innerText = `results.gestures[1] = ${results.gestures[0][0]}\n\nGestureRecognizer1: ${categoryName}\n GestureRecognizer2: ${categoryName2}\n  Confidence: ${categoryScore} %\n Handedness: ${handedness}`;

    //   if (results.gestures.length > 1) {
    //     console.log(`1 : ${results?.gestures[0][0].categoryName}\nright : ${results?.gestures[1][0].categoryName}`)
    //   }
    //   } else {
    //   gestureOutput.style.display = "none";
    // }
    // Call this function again to keep predicting when the browser is ready.
    window.requestAnimationFrame(predictWebcam);
}