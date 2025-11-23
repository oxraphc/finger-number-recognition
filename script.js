const camera = document.getElementById('camera')

async function openCamera() {
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
        console.log('Camera opened.')
        console.log(`Camera dimensions : ${camera.videoWidth} x ${camera.videoHeight}`)
    } catch (e) {
        console.error('Error accessing camera: ', e);
    }
}
openCamera();