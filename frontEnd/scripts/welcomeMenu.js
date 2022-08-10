import {request_updateUserTools, request_getAllInfo} from './requests.js';
import obj from './file.js';
const electron = require('electron');
const { ipcRenderer } = electron;
const remote = require("@electron/remote");
import mainProject  from './mainProject.js';
import { setBackPath } from './sidebar.js';


function preparePalette(){
    $("#apply-button").addClass("color1-2");
}

async function showUserNameAndSurname(){
    const user = obj.user;
    if(!user){
        console.log("No userProfile access!")
    }
    $("#user-info").html(user.name + " " + user.surname);
}

function updateList(items){
    $("#menu-options").html("");
    if (!items.tasks){
        const menuTasks = document.createElement('div');
        menuTasks.classList.add("menu-toolsTasks");
        menuTasks.innerHTML=`
        <label class="welcomeMenu-main">Tasks<input 
            type="checkbox"
            id="checkBox1"
            >
            <span class="welcomeMenu-geekmark1"></span>
        </label>
        `;
        $("#menu-options").append(menuTasks);
    }
    if (!items.notes){
        const menuNotes = document.createElement('div');
        menuNotes.classList.add("menu-toolsSchedule");
        menuNotes.innerHTML=`
        <label class="welcomeMenu-main">Notes<input 
            type="checkbox"
            id="checkBox2"
            >
            <span class="welcomeMenu-geekmark2"></span>
        </label>
        `;
        $("#menu-options").append(menuNotes);
    }
    if (!items.schedule){
        const menuSchedule = document.createElement('div');
        menuSchedule.classList.add("menu-toolsNotes");
        menuSchedule.innerHTML =`
        <label class="welcomeMenu-main">Schedule<input 
            type="checkbox"
            id="checkBox3"
            >
            <span class="welcomeMenu-geekmark3"></span>
        </label>
        `;
        $("#menu-options").append(menuSchedule);
    }
}

async function showList(){
    const userTools = obj.userSettings;
    if(!userTools){
        console.log("no userSettings access!");
    }
    updateList(userTools);
}

export async function welcomeMenu_getReady(){
    const userInfo = await request_getAllInfo(obj.user.email);
    console.log(userInfo)
    preparePalette();
    showUserNameAndSurname();
    showList();

}

$("#apply-button").mouseover(()=>{
    $("#apply-button").removeClass("color1-2").addClass("color1-3");
});
$("#apply-button").mouseout(()=>{
    $("#apply-button").removeClass("color1-3").addClass("color1-2");
});

$("#apply-button").click(async (e)=>{
    console.log(obj.userSettings);
    for (const element of $("#menu-options").find("label")){
        // window.getComputedStyle(element.lastElementChild, ':after')
        const some = window.getComputedStyle(element.lastElementChild, ':after')
        // console.log(some.getPropertyValue("display"));
        if (some.getPropertyValue("display") == "block"){
            console.log(element.innerText == "Tasks");
            if (element.innerText == "Tasks"){
                obj.userSettings.tasks = true;
            }else if(element.innerText == "Schedule"){
                obj.userSettings.schedule = true;
            }else{
                obj.userSettings.notes = true;
            }  
            element.closest("div").remove();
        }
    }
    request_updateUserTools(obj.user.email, obj.userSettings);
    const info = JSON.parse(sessionStorage.getItem("info")).path;
    setBackPath(info, 0, null); 
    ipcRenderer.send("changeUserInfo");  
    
});

// $(document).ready(async (e)=>{
//     welcomeMenu_getReady();
// });

// ipcRenderer.on("changeUserInfo", ()=>{
//     welcomeMenu_getReady();
// });
