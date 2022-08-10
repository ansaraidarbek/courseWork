import {request_findUser, request_getAllInfo} from './requests.js';
import obj from './file.js';
import { checkOutPrevWeek, fillPrevStyles } from './styleChange.js';
const electron = require('electron');
const { ipcRenderer } = electron;
const ImageDataURI = require('image-data-uri');
let video;

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

$("#emailPlaceholder").focus();

async function checkVideo(){
    $(document.body).empty();
    $(document.body).html(`
    <video id="video" autoplay></video>
    <button class="rightButton" id="click-photo">Click Photo</button>
    `);
    let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    video = document.querySelector("#video");
    video.srcObject = stream;
    $("#click-photo").click(()=>{
        checkPhoto();
    });
}

function checkPhoto(){
    $(document.body).empty();
    $(document.body).html(`
    <canvas id="canvas" width="${video.videoWidth}" height="${video.videoHeight}"></canvas>
    <button class="leftButton" id="try-again">Try Again</button>
    <button class="rightButton" id="check-button">
        <img src="./icons/checkTasks.svg" alt="checkTasks">
    </button>
    `);
    let canvas = document.querySelector("#canvas");
    console.log(video);
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
   	let image_data_url = canvas.toDataURL('image/jpeg');
    // console.log(image_data_url);
    $("#try-again").click(()=>{
        checkVideo();
    });
    $("#check-button").click(()=>{
        ImageDataURI.outputFile(image_data_url, "./labeled_faces/profile.jpg");
        ipcRenderer.send('appStart');
    });
}

$("#login-form").submit(async (e)=>{
    e.preventDefault();
    if (!$("#emailPlaceholder").val()){
        $("#emailPlaceholder").focus();
    }
    else if (!$("#pswPlaceholder").val()){
        $("#pswPlaceholder").focus();
    }else{
        console.log($("#emailPlaceholder").val());
        console.log($("#pswPlaceholder").val());
        console.log($("#checkBox_RememberMe").is(":checked"));
        addPreloader();
        const userInfo = await request_findUser($("#emailPlaceholder").val());
        if (userInfo.password == $("#pswPlaceholder").val()){
            const userInfo = await request_getAllInfo($("#emailPlaceholder").val());
            obj.setInstance(userInfo);
            console.log(userInfo);
            console.log(obj);
            
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
            if ($("#checkBox_RememberMe").is(":checked") == true){
                $("#preloader").remove();
                $("#option").css("display", "block");
                $("#yesButton").click(()=>{
                    ipcRenderer.send('save');
                    checkVideo();
                });
                $("#noButton").click(()=>{
                    ipcRenderer.send('appStart');
                });
            }else{
                ipcRenderer.send('appStart');
            }
        }else{
            $("#emailPlaceholder").val("");
            $("#pswPlaceholder").val("");
            $("#checkBox_RememberMe").prop("checked", false);
            $("#preloader").remove();
        }
    }
});

function addPreloader(){
    const preload = document.createElement("div");
    preload.classList.add("preloader");
    preload.setAttribute("id", "preloader");
    preload.innerHTML = `
        <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="lds-ripple" style="background:0 0">
            <circle cx="50" cy="50" r="4.719" fill="none" stroke="#C3C3C3" stroke-width="3">
                <animate attributeName="r" calcMode="spline" values="0;40" keyTimes="0;1" dur="1.5" keySplines="0 0.2 0.8 1" begin="-0.75s" repeatCount="indefinite" animation-duration="0.5s" />
                <animate attributeName="opacity" calcMode="spline" values="1;0" keyTimes="0;1" dur="1.5" keySplines="0.2 0 0.8 1" begin="-0.75s" repeatCount="indefinite" animation-duration="0.5s"/>
            </circle>
            <circle cx="50" cy="50" r="27.591" fill="none" stroke="#FFFFFF" stroke-width="4">
                <animate attributeName="r" calcMode="spline" values="0;40" keyTimes="0;1" dur="1.5" keySplines="0 0.2 0.8 1" begin="0s" repeatCount="indefinite"/>
                <animate attributeName="opacity" calcMode="spline" values="1;0" keyTimes="0;1" dur="1.5" keySplines="0.2 0 0.8 1" begin="0s" repeatCount="indefinite"/>
            </circle>
        </svg>
    `
    $(document.body).append(preload);
}
