import obj from './file.js';
import {request_getUser} from './requests.js';
const electron = require('electron');
const { ipcRenderer } = electron;
const remote = require("@electron/remote");


export function profile_getReady(){
    const user = obj.user;
    if(!user){
        console.log("No userProfile access!")
    }
    $("#fullName").html(user.name + " " + user.surname);
}

// $(document).ready(async (e)=>{
//     let userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
//     if(!userInfo){
//         userInfo = await request_getUser(userEmail);
//         sessionStorage.setItem("userInfo", JSON.stringify(userInfo));
//     }
//     $("#fullName").html(userInfo.name + " " + userInfo.surname);
// });
// ipcRenderer.on('goback', ()=>{
//     const backPath = JSON.parse(sessionStorage.getItem("backPath"));
//     const currentData = backPath.pop();
//     sessionStorage.setItem("info", JSON.stringify(currentData));
//     sessionStorage.setItem("backPath", JSON.stringify(backPath));
//     window.location.href = currentData.path;
// });