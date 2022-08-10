import { request_getAllInfo} from './requests.js';
import obj from "./file.js";
import { checkOutPrevWeek, fillPrevStyles } from './styleChange.js';
const electron = require('electron');
const { ipcRenderer } = electron;
const fs = require('fs');

let videoWidth = 640;
let videoHeight = 480;
let video;
// let count=0;

function toIsoString(date) {
    var tzo = -date.getTimezoneOffset(),
        dif = tzo >= 0 ? '+' : '-',
        pad = function(num) {
            var norm = Math.floor(Math.abs(num));
            return (norm < 10 ? '0' : '') + norm;
        };
  
    return date.getFullYear() +
        '-' + pad(date.getMonth() + 1) +
        '-' + pad(date.getDate()) +
        'T' + pad(date.getHours()) +
        ':' + pad(date.getMinutes()) +
        ':' + pad(date.getSeconds()) +
        dif + pad(tzo / 60) +
        ':' + pad(tzo % 60);
}

Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('./models') //heavier/accurate version of tiny face detector
]).then(recognizeFaces)

faceapi.env.monkeyPatch({
    createCanvasElement: () => document.createElement('canvas'),
    createImageElement: () => document.createElement('img')
});


async function recognizeFaces() {
    //create set of loaded faces and give the pass percentage
    const labeledDescriptors = await loadLabeledImages();

    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.5);

    console.log('Ready');
    ipcRenderer.send("readyFaceReco");

    // empty body html and add video plus button
    // connect video to stream
    // change default settings of video width and height
    $(document.body).html(`
    <video id="video" autoplay></video>
    <button class="rightButton" id="logIn">Log In</button>
    `);
    video = document.getElementById("video");
    navigator.getUserMedia(
        {video: true, audio: false},
        stream => (video.srcObject = stream),
        err => console.log(err)
    )
    if(video.videoWidth !=0 && video.videoHeight !=0){
        videoHeight = video.videoHeight;
        videoWidth = video.videoWidth;
    }

    // go to login page in case if face reco missreading
    $("#logIn").click(()=>{
        window.location.href = "login.html"; 
    });

    if(labeledDescriptors.length == 0){
        const text = document.createElement("h3");
        text.innerText = "Poor quality of image please change it";
        document.body.append(text);
        console.log("what");
    }else{
         // create canvas and append it to body
        const canvas = faceapi.createCanvas(video);
        document.body.append(canvas);

        // give the dimensions to canvas 
        const displaySize = { width: videoWidth, height: videoHeight };
        faceapi.matchDimensions(canvas, displaySize);

        //create setInterval function that will update every second
        var myTimer = setInterval(async () => {

            // detect faces in the video stream
            // append dimensions to of video stream
            const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()
            const resizedDetections = faceapi.resizeResults(detections, displaySize)

            //clear canvas every interval
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

            //now map every face from video to the loaded faces
            const results = resizedDetections.map((d) => {
                return faceMatcher.findBestMatch(d.descriptor)
            })

            //after result found, create boxes and give names
            results.forEach( (result, i) => {
                const box = resizedDetections[i].detection.box
                const drawBox = new faceapi.draw.DrawBox(box)
                const string = result.toString();
                console.log(result.toString());
                var first = string.split(" ")[0];
                if(first == "profile") { // && count == 0){
                    console.log("pass");
                    let span = document.querySelector("span");
                    if(!span){
                        span = document.createElement("span");
                    }
                    span.innerHTML = first;
                    span.style.color = "green";
                    document.body.append(span);
                    startApp();

                }
                // else if(first == "profile" && count != 0){
                //     count--;
                // }
                else{
                    let span = document.querySelector("span");
                    if(!span){
                        span = document.createElement("span");
                    }
                    span.innerHTML = first;
                    span.style.color = "red";
                    document.body.append(span);
                    // count++;
                }
                canvas.getContext('2d').translate(canvas.width, 0 );
                canvas.getContext('2d').scale(-1, 1);
                drawBox.draw(canvas)
            })
        }, 1000)
    }

}

async function loadLabeledImages() {
    // find path to images
    // detect faces on images
    // add detections to a set 
    // return set of detections
    const descriptions = [];
    const img = await faceapi.fetchImage(`../labeled_faces/profile.jpg`)
    console.log("what");
    const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
    if(detections){
        descriptions.push(detections.descriptor);
    }
    return new faceapi.LabeledFaceDescriptors("profile", descriptions)
}


async function startApp(){
    const userInfo = await request_getAllInfo(obj.user.email);
    obj.setInstance(userInfo);
    //-------------------------------
    let weekStart = new Date();
    while(weekStart.getDay() !=1){
        weekStart.setDate(weekStart.getDate()-1);
    }
    let weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate()+6);
    let week = {
        start:toIsoString(weekStart).slice(0, 10),
        end:toIsoString(weekEnd).slice(0, 10),
    }
    let prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate()-7);
    let prevWeekEnd = new Date(weekStart);
    prevWeekEnd.setDate(prevWeekEnd.getDate()-1);
    let prevWeek = {
        start:toIsoString(prevWeekStart).slice(0, 10),
        end:toIsoString(prevWeekEnd).slice(0, 10),
    }
    let key = prevWeek.start+"/"+prevWeek.end;
    let result;
    if(key in userInfo.userHistory){
        result = await checkOutPrevWeek(prevWeek);
    }else{
        result = await fillPrevStyles(week)
    }
    console.log(result);
    obj.userScore = result;
    obj.setInstance(obj.getInstance());

    // -------------------------------
    ipcRenderer.send('appStart');
}

// function loadLabeledImages() {
//     //const labels = ['Black Widow', 'Captain America', 'Hawkeye' , 'Jim Rhodes', 'Tony Stark', 'Thor', 'Captain Marvel']
//     const labels = ['profile'] // for WebCam
//     return Promise.all(
//         labels.map(async (label)=>{
//             const descriptions = []
//             for(let i=1; i<=2; i++) {
//                 const img = await faceapi.fetchImage(`../labeled_faces/${label}/${i}.jpg`)
//                 const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
//                 if(detections){
//                     descriptions.push(detections.descriptor);
//                 }else{
//                     const span = document.createElement("span");
//                     span.innerHTML = "Too bad quality, please make new image";
//                     document.body.append(span);
//                 }
//                 // console.log(label + i + JSON.stringify(detections))
//             }
//             document.body.append(label+' Faces Loaded | ')
//             return new faceapi.LabeledFaceDescriptors(label, descriptions)
//         })
//     )
// }