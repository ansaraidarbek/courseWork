import { welcomeMenu_getReady} from './welcomeMenu.js';
import { projects_getReady } from './projects.js';
import { tasks_getReady } from './tasks.js';
import { schedule_getReady } from './schedule.js';
import { notes_getReady } from './notes.js';
import { note_getReady } from './note.js';
import { profile_getReady } from './profile.js';
import { settings_getReady } from './settings.js';
import { addProjects_getReady } from './addProject.js';
import { menu_getReady } from './menu.js';
import obj from './file.js';
import mainProject  from './mainProject.js';

const electron = require('electron');
const { ipcRenderer } = electron;
const remote = require("@electron/remote");
const fs = require('fs');

const path = require('path');

const dataPath = remote.app.getAppPath();
const filePath = path.join(dataPath, "frontEnd/music");
let songs = fs.readdirSync(filePath);

let musicStorage = JSON.parse(sessionStorage.getItem("music"));
if(!musicStorage){
    musicStorage = {
        time : 0,
        index : 0,
        audio: 0.01
    }
    sessionStorage.setItem("music", JSON.stringify(musicStorage));
}

const musicContainer = document.getElementById('music-container');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
let welcomed = false;

const audio = document.getElementById('audio');
const progress = document.getElementById('progress');
const progressContainer = document.getElementById('progress-container');
const title = document.getElementById('title');
const cover = document.getElementById('cover');




let pageState = JSON.parse(sessionStorage.getItem("info"));
if(!pageState){
    console.log("I was here " + pageState);
    const page = {
        path: obj.state,
        info: null
    };
    pageState = page;
    sessionStorage.setItem("info", JSON.stringify(page));
}
if(pageState.path == -1){
    welcomed=true;
}
if(!JSON.parse(sessionStorage.getItem("backPath"))){
    if(pageState.path == -1){
        sessionStorage.setItem("backPath", JSON.stringify([{path: 0,info: null}]));
    }else{
        sessionStorage.setItem("backPath", JSON.stringify([pageState]));
    }
}

function preparePalette(){
    if(pageState.path == -1 || obj.userSettings.style!=1){
        $("#sidebar").addClass(`color${mainProject.color}-through`)
    }else{
        $("#sidebar").addClass(`color${mainProject.color}-2`)
    }
    let some = document.querySelectorAll(".bottomLine");
    some.forEach(line =>{
        line.classList.add(`color${mainProject.color}-toolNameLine`)
    });
    $("#circle5").addClass(`color${mainProject.color}-mainCircle1`);
    $("#circle5").addClass(`color${mainProject.color}-mainCircle1`);
    $("#circle6").addClass(`color${mainProject.color}-mainCircle2`);
    $("body").addClass(`color${mainProject.color}-backGround`);
}

class Page{
    constructor(){
        this._strategy = null;
    }

    set currentPage(state){
        this._strategy = state;
        this._name = state._name;
    }

    showPage(){
        this._strategy.showContents();
    }

    addPageJs(){
        this._strategy.addPageJs();
    }

    createSettings(){
        settings_getReady(0);
    }

    createAddproject(){
        addProjects_getReady(0);
    }

    get currentPage(){
        return this._name;
    }
    
}

class targetPage{

    constructor(name, page){
        this._name = name;
        this.page = page;
    }

    showContents(){
        if(this.page != 6){
            for(let i = -1; i<6; i++){
                $("#"+i).css("display", "none");
            }
            if(this.page == -1){
                $("#-1img").css("display", "block");
            }else{
                $("#-1img").css("display", "none");
            }
            $("#"+this.page ).css("display", "flex");
        }
    }

    async addPageJs(){
        projects_getReady(pageState.path);
        switch(this.page){
            case -1:
                welcomeMenu_getReady();
                break;
            case 1:
                profile_getReady();
                break;
            case 2:
                tasks_getReady();
                break;
            case 3:
                schedule_getReady();
                break;
            case 4:
                notes_getReady();
                break;
            case 5:
                note_getReady();
                break;
            default:
                menu_getReady();
                break;
        }
    }
}

const page = new Page();
const welcomePage = new targetPage("welcomePage", -1);
const menu = new targetPage("menu", 0);
const profile = new targetPage("profile", 1);
const tasks = new targetPage("tasks", 2);
const schedule = new targetPage("schedule", 3);
const notes = new targetPage("notes", 4);
const note = new targetPage("notes", 5);

function selectPage(){
    if(pageState){
        switch(pageState.path){
            case -1:
                page.currentPage = welcomePage;
                break;
            case 1:
                page.currentPage = profile;
                break;
            case 2:
                page.currentPage = tasks;
                break;
            case 3:
                page.currentPage = schedule;
                break;
            case 4:
                page.currentPage = notes;
                break;
            case 5:
                page.currentPage = note;
                break;
            default:
                page.currentPage = menu;
                break;
        }
    }else{
        page.currentPage = menu;
    }
}


function currentPage(){
    page.showPage();
    page.addPageJs();
}

async function showUserNameAndSurname(){
    const user = obj.user;
    if(!user){
        console.log("No userProfile access!")
    }
    $("#profileInfo").html(user.name + " " + user.surname);
}

function updateList(items){
    $("#sidebar-tools").html("");
    $("#sidebar-profile").off("mouseover");
    $("#sidebar-profile").off("mouseout");
    $("#sidebar-profile").off("click");
    $("#sidebar-profile").removeClass(`color${mainProject.color}-3`);

    //menu visuals
    $("#sidebar-menu").mouseover(()=>{
        $("#sidebar-menu").addClass(`color${mainProject.color}-3`);
    });
    $("#sidebar-menu").mouseout(()=>{
        $("#sidebar-menu").removeClass(`color${mainProject.color}-3`);
    });
    $("#sidebar-menu").click(async (e)=>{
        if(page.currentPage != "menu"){
            setBackPath(pageState.path, 0, null);
        }
    });

    //profile button visuals 
    if(page.currentPage != "profile"){
        $("#sidebar-profile").mouseover(()=>{
            $("#sidebar-profile").addClass(`color${mainProject.color}-3`);
        });
        $("#sidebar-profile").mouseout(()=>{
            $("#sidebar-profile").removeClass(`color${mainProject.color}-3`);
        });
        $("#sidebar-profile").click(async (e)=>{
            setBackPath(pageState.path, 1, null);
        });
    }else{
        $("#sidebar-profile").addClass(`color${mainProject.color}-3`);
    }


    if(items.tasks){
        const sidebarTasks = document.createElement("li");
        sidebarTasks.setAttribute("id", "sidebar-tasks");
        sidebarTasks.setAttribute("class", "sidebar_list");
        sidebarTasks.innerHTML = `
        <a href="#">
            <img src = "./icons/task.svg" alt="tasks"/>
            <span>Tasks</span>
        </a>
        <span class="tooltip">Tasks</span>
        `

        sidebarTasks.addEventListener("click", ()=>{
            if(page.currentPage != "tasks"){
                const nextData ={
                    today : new Date(),
                    trueToday : new Date(),
                    elementAdded : false
                }
                setBackPath(pageState.path, 2, nextData);
            }
        });

        if(page.currentPage != "tasks"){
            sidebarTasks.addEventListener("mouseover", ()=>{
                sidebarTasks.classList.add(`color${mainProject.color}-3`);
            });
            sidebarTasks.addEventListener("mouseout", ()=>{
                sidebarTasks.classList.remove(`color${mainProject.color}-3`);
            });
        }else{
            sidebarTasks.classList.add(`color${mainProject.color}-3`);
        }

        $("#sidebar-tools").append(sidebarTasks);
    }
    if(items.schedule){
        const sidebarSchedule = document.createElement("li");
        sidebarSchedule.setAttribute("id", "sidebar-schedule");
        sidebarSchedule.setAttribute("class", "sidebar_list");
        sidebarSchedule.innerHTML = `
        <a href="#">
            <img src = "./icons/schedule.svg" alt="schedule"/>
            <span>Schedule</span>
        </a>
        <span class="tooltip">Schedule</span>
        `

        sidebarSchedule.addEventListener("click", ()=>{
            if(page.currentPage != "schedule"){
                const today = new Date();
                let weekStart = new Date();
                while(weekStart.getDay() != 1){
                    weekStart.setDate(weekStart.getDate() - 1);
                }
                let weekEnd = new Date(weekStart)
                weekEnd.setDate(weekEnd.getDate()+6)
                const nextData = {
                    trueToday : today,
                    activeMonth : today.getMonth(),
                    activeYear : today.getFullYear(),
                    weekStart : weekStart,
                    weekEnd : weekEnd
                }
                setBackPath(pageState.path, 3, nextData);
            }
        });
        if(page.currentPage != "schedule"){
            sidebarSchedule.addEventListener("mouseover", ()=>{
                sidebarSchedule.classList.add(`color${mainProject.color}-3`);
            });
            sidebarSchedule.addEventListener("mouseout", ()=>{
                sidebarSchedule.classList.remove(`color${mainProject.color}-3`);
            });
        }else{
            sidebarSchedule.classList.add(`color${mainProject.color}-3`);
        }
        $("#sidebar-tools").append(sidebarSchedule);
    }
    if(items.notes){
        const sidebarNotes = document.createElement("li");
        sidebarNotes.setAttribute("id", "sidebar-notes");
        sidebarNotes.setAttribute("class", "sidebar_list");
        sidebarNotes.innerHTML = `
        <a href="#">
            <img src = "./icons/note.svg" alt="note"/>
            <span>Notes</span>
        </a>
        <span class="tooltip">Notes</span>
        `
        sidebarNotes.addEventListener("click", ()=>{
            if(page.currentPage != "notes"){
                setBackPath(pageState.path, 4, null);
            }
        });
        if(page.currentPage != "notes"){
            sidebarNotes.addEventListener("mouseover", ()=>{
                sidebarNotes.classList.add(`color${mainProject.color}-3`);
            });
            sidebarNotes.addEventListener("mouseout", ()=>{
                sidebarNotes.classList.remove(`color${mainProject.color}-3`);
            });
        }else{
            sidebarNotes.classList.add(`color${mainProject.color}-3`);
        }
        $("#sidebar-tools").append(sidebarNotes);
    }
}


async function showList(){
    const userTools = obj.userSettings;
    if(!userTools){
        console.log("no userSettings access!");
    }
    updateList(userTools);
}

function getReady(){
    console.log(obj);
    preparePalette();
    selectPage();
    currentPage();
    showUserNameAndSurname();
    showList();
}

// function updateSource(){ 
//     var audio = document.querySelector('audio');
//     audio.src = "../music1.mp3";
//     audio.load();
//     audio.play();
// }

$(document).ready(()=>{
    getReady();
    audio.volume = musicStorage.audio;
    if(pageState.path!=-1){
        loadSong(songs[musicStorage.index]);
    }
    // const player = new Audio("../music1.mp3");
    // player.play();
    // updateSource();
});

//menu button visuals  
$("#btn").mouseover(()=>{
    $("#btn").addClass(`color${mainProject.color}-3`);
});
$("#btn").mouseout(()=>{
    $("#btn").removeClass(`color${mainProject.color}-3`);
});
$("#btn").click(async (e)=>{
    $("#sidebar").toggleClass("close");
    $("#sidebar").toggleClass("open");
    if(!$("#sidebar").hasClass("close")){
        $("#sidebar").removeClass("bx-sidebar").addClass("bx-sidebar-alt-right");
    }else {
        $("#sidebar").removeClass("bx-sidebar-alt-right").addClass("bx-sidebar");
    }
});



//settings visuals
$("#sidebar-settings").mouseover(()=>{
    $("#sidebar-settings").addClass(`color${mainProject.color}-3`);
});
$("#sidebar-settings").mouseout(()=>{
    $("#sidebar-settings").removeClass(`color${mainProject.color}-3`);
});
$("#sidebar-settings").click(async (e)=>{
    $("#modal-container").addClass('show');
    console.log("okaySettings");
    page.createSettings();
    e.stopPropagation();
});

$("#modal-container").click( e =>{
    e.preventDefault();
    let targetElement = e.target;    
    do {
        if (window.getSelection().toString()) {
            return;
        }
        targetElement = targetElement.parentNode;
    } while (targetElement);
    $("#modal-container").removeClass('show');
    e.stopPropagation();
});

$("#set-close").mouseover(()=>{
    $("#set-close").addClass('color1-3');
});
$("#set-close").mouseout(()=>{
    $("#set-close").removeClass('color1-3');
});

$("#set-close").click( e =>{
    $("#modal-container").removeClass('show');
    e.stopPropagation();
});


$("#set-profile-icon").mouseover(()=>{
    $("#set-profile-icon").addClass('color1-3');
});
$("#set-profile-icon").mouseout(()=>{
    $("#set-profile-icon").removeClass('color1-3');
});

$("#set-profile-icon").click(async (e)=>{
    settings_getReady( 0);
});

$("#addProjectButton").mouseover(()=>{
    $("#addProjectButton").addClass('color1-3');
});
$("#addProjectButton").mouseout(()=>{
    $("#addProjectButton").removeClass('color1-3');
});

$("#addProjectButton").click(async (e)=>{
    addProjects_getReady(0);
});

$("#selectProjectButton").mouseover(()=>{
    $("#selectProjectButton").addClass('color1-3');
});
$("#selectProjectButton").mouseout(()=>{
    $("#selectProjectButton").removeClass('color1-3');
});

$("#selectProjectButton").click(async (e)=>{
    addProjects_getReady(1);
});

$("#set-add-remove-icon").mouseover(()=>{
    $("#set-add-remove-icon").addClass('color1-3');
});
$("#set-add-remove-icon").mouseout(()=>{
    $("#set-add-remove-icon").removeClass('color1-3');
});

$("#set-add-remove-icon").click(async (e)=>{
    settings_getReady( 1);
});

$("#set-schedule-time-icon").mouseover(()=>{
    $("#set-schedule-time-icon").addClass('color1-3');
});
$("#set-schedule-time-icon").mouseout(()=>{
    $("#set-schedule-time-icon").removeClass('color1-3');
});

$("#set-schedule-time-icon").click(async (e)=>{
    settings_getReady( 2);
});

//newProject visuals
$("#sidebar-addProject").mouseover(()=>{
    $("#sidebar-addProject").addClass(`color${mainProject.color}-3`);
});
$("#sidebar-addProject").mouseout(()=>{
    $("#sidebar-addProject").removeClass(`color${mainProject.color}-3`);
});

$("#sidebar-addProject").click(async (e)=>{
    $("#project-container").addClass('show');
    console.log("okaySettings");
    page.createAddproject();
    e.stopPropagation();
});

$("#project-container").click( e =>{
    e.preventDefault();
    let targetElement = e.target;
    do {
        if (window.getSelection().toString()) {
            return;
        }
        targetElement = targetElement.parentNode;
    } while (targetElement);
    $("#project-container").removeClass('show');
    e.stopPropagation();
});

document.addEventListener('keydown', async (e)=> {
    if (e.key==="Escape") {
        $("#project-container").removeClass('show');
        $("#modal-container").removeClass('show');
        e.stopPropagation();
    }
});

//logout visuals
$("#sidebar-bottom").mouseover(()=>{
    $("#sidebar-bottom").addClass(`color${mainProject.color}-3`);
});
$("#sidebar-bottom").mouseout(()=>{
    $("#sidebar-bottom").removeClass(`color${mainProject.color}-3`);
});
$("#sidebar-bottom").click(async (e)=>{
    ipcRenderer.send('appFinish');
});

export function setBackPath(prevPage, nextPage, nextData){
    let backPath = JSON.parse(sessionStorage.getItem("info"));
    let backPathInfo = undefined
    if(!backPath){
        backPathInfo = null;
    }else{
        backPathInfo = backPath.info
    }
    const arr = JSON.parse(sessionStorage.getItem("backPath"))|| [];
    if(prevPage == -1){
        prevPage = 0;
    }
    const obj1 = {
        path: prevPage,
        info: backPathInfo
    };
    arr.push(obj1);
    sessionStorage.setItem("backPath", JSON.stringify(arr));
    const obj2 = {
        path: nextPage,
        info: nextData
    };
    pageState = obj2;
    sessionStorage.setItem("info", JSON.stringify(obj2));
    getReady();
}

ipcRenderer.on('goback', ()=>{
    const backPath = JSON.parse(sessionStorage.getItem("backPath"));
    const currentData = backPath.pop();
    if(backPath.length == 0){
        backPath.push(currentData);
    }
    pageState = currentData;
    sessionStorage.setItem("info", JSON.stringify(currentData));
    sessionStorage.setItem("backPath", JSON.stringify(backPath));
    getReady();
});

ipcRenderer.on("changeUserInfo", ()=>{
    if(welcomed == true){
        loadSong(songs[musicStorage.index]);
        welcomed = false;
    }
    getReady();
});

export function sidebar_timeStamp(time){
    let info = JSON.parse(sessionStorage.getItem("info"));
    if(info.info != null && info.info.weekStart){
        let weekStart = info.info.weekStart;
        let begin = new Date(weekStart);
        let trueToday = new Date();
        const pastTime = document.querySelector(".schedule-timestamp");
        if(pastTime){
            pastTime.remove();
        }
        $("#hoursMinutes").html(time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }));
        for(let i=1; i<8; i++){
            if(begin && toIsoString(begin).slice(0, 10) == toIsoString(trueToday).slice(0, 10)){
                let startHeight = obj.userSettings.scheduleStart * 6;
                let hoursHeight = time.getHours();
                let minuteHeight = time.getMinutes();
                let hours = (hoursHeight*6) + (minuteHeight*0.1)-startHeight+6;
                if(hoursHeight < 10){
                    hoursHeight = "0" + hoursHeight;
                }
                if(minuteHeight < 10){
                    minuteHeight = "0" + minuteHeight;
                }
                if(hours>=0 && time.getHours()<obj.userSettings.scheduleEnd){
                    const timeArray = document.createElement("div");
                    timeArray.classList.add("schedule-timestamp");
                    timeArray.classList.add(`color${mainProject.color}-5`)
                    timeArray.style.top = `${hours}vh`
                    timeArray.innerHTML = `
                        <div class="schedule-arrow color${mainProject.color}-arrow"></div>
                        <p>${hoursHeight}:${minuteHeight}</p>
                    `
                    $("#column"+i).append(timeArray);
                }
                break;
            }
            begin.setDate(begin.getDate()+1);
        }
    }
}

ipcRenderer.on('takeNow', (event, data)=>{
    const time = new Date(data);
    sidebar_timeStamp(time);
});

ipcRenderer.on('studyStarted', (event, data)=>{
    if(data == "tasks"){
        const nextData ={
            today : new Date(),
            trueToday : new Date(),
            elementAdded : false
        }
        setBackPath(pageState.path, 2, nextData);
    }else if(data == "schedule"){
        const today = new Date();
        let weekStart = new Date();
        while(weekStart.getDay() != 1){
            weekStart.setDate(weekStart.getDate() - 1);
        }
        let weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate()+6)
        const nextData = {
            trueToday : today,
            activeMonth : today.getMonth(),
            activeYear : today.getFullYear(),
            weekStart : weekStart,
            weekEnd : weekEnd
        }
        setBackPath(pageState.path, 3, nextData);
    }else{
        setBackPath(pageState.path, 4, null);
    }
});


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


function loadSong(song) {
    console.log(song);
    let songParts = song.split("-");
    let songExt = song.split(".");
    title.innerText = songParts[1];
    audio.src = `music/${song}`;
    audio.currentTime = musicStorage.time;
    if (fs.existsSync(`images/${songExt[0]}.jpg`)) {
        cover.src = `images/${songExt[0]}.jpg`;
    }else{
        cover.src = `images/unknown.jpg`
    }
    playSong()
}

// Play song
function playSong() {
    musicContainer.classList.add('play');
    playBtn.querySelector('img').setAttribute("src", "./icons/menuPause.svg");
    audio.play();
}
  
  // Pause song
function pauseSong() {
    musicContainer.classList.remove('play');
    playBtn.querySelector('img').setAttribute("src", "./icons/menuPlay.svg");
    audio.pause();
}
  
  // Previous song
  function prevSong() {
    musicStorage.index--;
    musicStorage.time = 0;
    if (musicStorage.index < 0) {
        musicStorage.index = songs.length - 1;
    }
    loadSong(songs[musicStorage.index]);
  }
  
  // Next song
  function nextSong() {
    musicStorage.index++;
    musicStorage.time = 0;
    if (musicStorage.index > songs.length - 1) {
        musicStorage.index = 0;
    }
    loadSong(songs[musicStorage.index]);
  }
  
  // Update progress bar
  function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = `${progressPercent}%`;
    sessionStorage.setItem("music", JSON.stringify({index: musicStorage.index, time:currentTime, audio:musicStorage.audio}));
  }
  
  // Set progress bar
  function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
  
    audio.currentTime = (clickX / width) * duration;
  }
  
  /*
  //function DurTime (e) {
      //needs to be re-implemented 
  }
  */
  
playBtn.addEventListener('click', () => {
    const isPlaying = musicContainer.classList.contains('play');

    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
});
  
  
  
// Change song
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);

// Time/song update
audio.addEventListener('timeupdate', updateProgress);

// Click on progress bar
progressContainer.addEventListener('click', setProgress);

// Song ends
audio.addEventListener('ended', nextSong);

// ipcRenderer.on("music", ()=> {
//         const isPlaying = musicContainer.classList.contains('play');

//         if (isPlaying) {
//             pauseSong();
//         } else {
//             playSong();
//         }
// });

document.addEventListener('keydown', async (event)=> {
    if (event.ctrlKey && event.key === ' ') {
        const isPlaying = musicContainer.classList.contains('play');

        if (isPlaying) {
            pauseSong();
        } else {
            playSong();
        }
    }
});

// ipcRenderer.on("prevMusic", ()=> {
//     prevSong();
// });

// ipcRenderer.on("nextMusic", ()=> {
//     nextSong();
// });


// ipcRenderer.on("musicDown", ()=>{
//     audio.volume= audio.volume -0.05;
// });

// ipcRenderer.on("musicUp", ()=>{
//     audio.volume= audio.volume +0.05;
// });



document.addEventListener('keydown', async (event)=> {
    if (event.ctrlKey && event.key === 'ArrowLeft') {
        prevSong();
    }
});

document.addEventListener('keydown', async (event)=> {
    if (event.ctrlKey && event.key === 'ArrowRight') {
        nextSong();
    }
});

document.addEventListener('keydown', async (event)=> {
    if (event.ctrlKey && event.key === 'ArrowUp') {
        let num = audio.volume + 0.005;
        if(num>1){
            audio.volume = 1;
        }else{
            audio.volume = num;
        }
        musicStorage.audio = audio.volume;
    }
});

document.addEventListener('keydown', async (event)=> {
    if (event.ctrlKey && event.key === 'ArrowDown') {
        let num = audio.volume - 0.005;
        if(num<0){
            audio.volume = 0;
        }else{
            audio.volume = num;
        }
        musicStorage.audio = audio.volume;
    }
});

// document.addEventListener('keydown', async (event)=> {
//     if (event.key === ' ') {
//         console.log("yeap")
//     }
// });


