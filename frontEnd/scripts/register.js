import {request_addUser, request_getAllInfo, request_isEmailExist} from './requests.js';
import obj from './file.js';
const electron = require('electron');
const { ipcRenderer } = electron;
const path = './user.json'
const fs = require('fs');

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

$("#userInfoName").focus();

$("#register-form").submit(async (e)=>{
    console.log("hello");
    e.preventDefault();
    if(!$("#userInfoName").val()){
        $("#userInfoName").focus();
    }else if(!$("#userInfoSurname").val()){
        $("#userInfoSurname").focus();
    }else if(!$("#userInfoEmail").val()){
        $("#userInfoEmail").focus();
    }else if(!$("#userInfoPassword").val()){
        $("#userInfoPassword").focus();
    }else if(!$("#userInfoRePassword").val()){
        $("#userInfoRePassword").focus();
    }else if($("#userInfoPassword").val()!=$("#userInfoRePassword").val()){
        $("#userInfoRePassword").val("")
    }else{
        addPreloader();
        let result = await request_isEmailExist($("#userInfoEmail").val());
        if (result){
            $("#userInfoEmail").val("");
            $("#userInfoEmail").focus();
            $("#preloader").remove();
        }else{
            let weekStart = new Date();
            while(weekStart.getDay() !=1){
                weekStart.setDate(weekStart.getDate()-1);
            }
            let weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate()+6);
            const data1 = {  
                email: $("#userInfoEmail").val(),
                password:$("#userInfoPassword").val(),
                name: $("#userInfoName").val(),
                surname: $("#userInfoSurname").val(),
                weekStart: toIsoString(weekStart).slice(0, 10),
                weekEnd:toIsoString(weekEnd).slice(0, 10)                   
            }
            await request_addUser(data1);
            const userInfo  = await request_getAllInfo($("#userInfoEmail").val());
            userInfo.state = -1
            obj.setInstance(userInfo);
            ipcRenderer.send('appStart');
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