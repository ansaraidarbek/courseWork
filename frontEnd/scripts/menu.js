import {request_updateUserTools, request_getAllInfo} from './requests.js';
import {newTaskHandler_getTasks, newTaskHandler_deleteTask, newTaskHandler_updateStage, newTaskHandler_addTask, newTaskHandler_getMaxId} from './newTaskHandler.js';
import obj from './file.js';
const electron = require('electron');
const { ipcRenderer } = electron;
const remote = require("@electron/remote");
import mainProject  from './mainProject.js';
import { setBackPath } from './sidebar.js';
const Chart = require('chart.js');

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

function preparePalette(){
    $("#menuLeft1").addClass(`color${mainProject.color}-2`);
    $("#menuLeft2").addClass(`color${mainProject.color}-2`);
    $("#menuLeft3").addClass(`color${mainProject.color}-2`);
    $("#menuRight1").addClass(`color${mainProject.color}-2`);
    $("#menuRight2").addClass(`color${mainProject.color}-2`);
    $("#menumidAddTask").addClass(`color${mainProject.color}Back2`);
    /*$("#menuMiddle1").addClass(`color${mainProject.color}-2`);
    $("#menuMiddle2").addClass(`color${mainProject.color}-2`);*/
    $("#menuMiddle3").addClass(`color${mainProject.color}-2`);
    $("#menuMiddle4").addClass(`color${mainProject.color}-3`);
    $("#menuAddNewTask").addClass(`color${mainProject.color}-3`);
    $("#menuScheduleColumn").addClass(`scroll${mainProject.color}`);
}

function lastNotes(){
    $("#menuMiddle1").off("click");
    $("#menuMiddle2").off("click");
    let privelegy = (mainProject.keyWord == "A")?`color${mainProject.color}-`:"";
    let firstTry = checkNote(obj.userProjects[mainProject.keyWord].lastOneFirst);
    let secondTry = checkNote(obj.userProjects[mainProject.keyWord].lastOneSecond);
    let mainStyle = 'style' + obj.userSettings.style;
    $("#menuMiddle1").removeClass();
    $("#menuMiddle2").removeClass();
    $("#menuMiddle1").addClass("menufirstNoteBlock");
    $("#menuMiddle2").addClass("menusecondNoteBlock");
    if(firstTry == null){
        $("#menuMiddle1").addClass(`color${mainProject.color}-2`);
        $("#menuFirstProject").html("");
        $("#menuFirstTitle").html("Add note");
    }else{
        let color1 = obj.userProjects[obj.userNotes["path"][firstTry.path][firstTry.id]["data"].project_keyWord][mainStyle];
        $("#menuMiddle1").addClass(`${privelegy}color${color1}-2`);
        $("#menuFirstProject").html(`${obj.userNotes["path"][firstTry.path][firstTry.id]["data"].project_keyWord}`);
        $("#menuFirstTitle").html(`${obj.userNotes["path"][firstTry.path][firstTry.id]["data"].title}`);
    }
    if(secondTry == null){
        $("#menuMiddle2").addClass(`color${mainProject.color}-2`);
        $("#menuSecondProject").html("");
        $("#menuSecondTitle").html("Add note");
    }else{
        let color2 = obj.userProjects[obj.userNotes["path"][secondTry.path][secondTry.id]["data"].project_keyWord][mainStyle];
        $("#menuMiddle2").addClass(`${privelegy}color${color2}-2`);
        $("#menuSecondProject").html(`${obj.userNotes["path"][secondTry.path][secondTry.id]["data"].project_keyWord}`);
        $("#menuSecondTitle").html(`${obj.userNotes["path"][secondTry.path][secondTry.id]["data"].title}`);
    }
    $("#menuMiddle1").click((e)=>{
        createNote(firstTry); 
    });
    $("#menuMiddle2").click((e)=>{
        createNote(secondTry);
    });
}

function checkNote(notePath){
    if(notePath == null){
        return null;
    }
    let noteRealPath = notePath.substring(0, notePath.length-2);
    let noteId = notePath.substring(notePath.length-2, notePath.length-1);
    if(!(noteRealPath in obj.userNotes["path"]) || !(noteId in obj.userNotes["path"][noteRealPath] )){
        return null;
    }else if(!(obj.userProjects[obj.userNotes["path"][noteRealPath][noteId]["data"].project_keyWord].valid == true)){
        return null;
    }
    else{
        return {path: noteRealPath, id: noteId};
    }
}

function createNote(noteObj){
    let data;
    if(noteObj == null){
        const userNotes = obj.userNotes;
        if(!userNotes){
            console.log("no userNotes access!");
        }
        let id;
        if('0-' in userNotes["path"]){
            id = Object.values(userNotes["path"]['0-']).length + 1;
        }else{
            id = 1;
        }
        data = {
            styling:{
                fontStyle : "Times New Roman",
                fontSize : 15,
                bold : false,
                italic : false,
                underline : false,
                focused: false,
            },
            note:{
                method : "POST",
                id : id,
                path : '0-',
                project_keyWord: mainProject.keyWord,
                literalPath: "Notes/"
            }
        }
    }else{
        let pathName = recursivePath("Notes/", noteObj.path, 2);
        data = {
            styling:{
                fontStyle : "Times New Roman",
                fontSize : 15,
                bold : false,
                italic : false,
                underline : false,
                focused: false,
            },
            note:{
                method : "PUT",
                id : noteObj.id,
                path: noteObj.path,
                project_keyWord: obj.userNotes["path"][noteObj.path][noteObj.id]["data"].project_keyWord,
                literalPath: pathName,
            }
        }
    }
    const info = JSON.parse(sessionStorage.getItem("info")).path;
    setBackPath(info, 5, data);
}

function recursivePath(string, path, level){
    if(level>=path.length){
        return string
    }
    let parentPath = path.substring(0, level);
    let parentId = path.substring(level, level+1);
    string += obj.userNotes["path"][parentPath][parentId]["data"].title + "/";
    return recursivePath(string, path, level+2);
}

function createTasks(){
    $("#menuMiddle3").off("click");
    $("#menuAddNewTask").off("click");
    showHeader();
    showTasks();
    $("#menuMiddle3").click((e)=>{
        const nextData ={
            today : new Date(),
            trueToday : new Date(),
            elementAdded : false
        }
        const info = JSON.parse(sessionStorage.getItem("info")).path;
        setBackPath(info, 2, nextData);
    });

    $("#menuAddNewTask").click((e)=>{
        e.stopPropagation();
        const nextData ={
            today : new Date(),
            trueToday : new Date(),
            elementAdded : true
        }
        const info = JSON.parse(sessionStorage.getItem("info")).path;
        setBackPath(info, 2, nextData);
    });
}

function showHeader(){
    let today = new Date();
    const monthnames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
    const daynames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    $("#menuMonth").html(monthnames[today.getMonth()]);
    $("#menuDate").html(daynames[today.getDay()]+", "+today.getDate());
}

function showTasks(){
    $("#menumiddleTaskList").html("");
    let today = new Date();
    let todayTasks = newTaskHandler_getTasks(today, 1);
    if(todayTasks[0] != null){
        for(let i =0; i<3; i++){
            todayTasks[0].tasks[i].forEach(task=>{
                if(obj.userProjects[task.project_keyWord].valid == true){
                    if(mainProject.keyWord == "A" || task.project_keyWord == mainProject.keyWord){
                        printTaskForTask(task);
                    }
                    printTaskForSchedule(task);
                }
            });
        }
    }else{
        console.log("no tasks today");
    }
}


function printTaskForTask(task){
    if(task.start == null){
        let privelegy = (mainProject.keyWord == "A")?`color${mainProject.color}-`:"";
        let mainStyle = 'style' + obj.userSettings.style;
        let color = obj.userProjects[task.project_keyWord][mainStyle];
        const liElem = document.createElement("li");
        liElem.classList.add("menutasks-element");
        liElem.classList.add("tasks-mid");
        let string = '';
        let check = '';
        if(task.stage == 1){
            liElem.classList.add(`${privelegy}color${color}-3`);
            string = 'completed';
            check = '<img src="./icons/checkTasks.svg" alt="menucheckTasks"></img>'
        }
        liElem.innerHTML = `
        <button class="menutasks-done ${privelegy}color${color}-3">${check}</button>
        <div class="menutasks-text">
            <span>${task.text}</span>
            <p>${string}</p>
        </div>
        `
        $("#menumiddleTaskList").append(liElem);
    }
}

function convertTask(data){
    let startHeight = obj.userSettings.scheduleStart * 60;
    let hours = data.substring(0, 2);
    let result = parseInt(hours)*60;
    let minutes = data.substring(3, 5);
    result = result + parseInt(minutes) - startHeight;
    return result;
}

function printTaskForSchedule(task){
    if(task.start != null){
        let opacity=0.5;
        if((mainProject.keyWord == "A" || task.project_keyWord == mainProject.keyWord)){
            opacity=1;
        }
        let privelegy = (mainProject.keyWord == "A")?`color${mainProject.color}-`:"";
        let mainStyle = 'style' + obj.userSettings.style;
        let color = obj.userProjects[task.project_keyWord][mainStyle];
        let end = obj.userSettings.scheduleEnd*12- obj.userSettings.scheduleStart*12;
        let taskStart = convertTask(task.start)*0.2;
        let taskEnd = convertTask(task.end)*0.2;
        let num = (task.stage == 1)?4:2;
        if(taskStart> 0 && taskEnd>end){
            $("#menuhorizontalLines").append(`<div class="menuTask ${privelegy}color${color}-${num} color${color}-borders" style="opacity:${opacity};top: ${taskStart+4}vh; height:${end-taskStart}vh; border-width: 2px;"><span>${task.text}</span></div>`);
        }else if(taskStart< 0 && taskEnd>end){
            $("#menuhorizontalLines").append(`<div class="menuTask ${privelegy}color${color}-${num} color${color}-borders" style="opacity:${opacity};top: 4vh; height:${end}vh; border-width: 2px;"><span>${task.text}</span></div>`);
        }else if(taskStart> 0 && taskEnd<end){
            $("#menuhorizontalLines").append(`<div class="menuTask ${privelegy}color${color}-${num} color${color}-borders" style="opacity:${opacity};top: ${taskStart+4}vh; height:${taskEnd-taskStart}vh; border-width: 2px;"><span>${task.text}</span></div>`);
        }else if(taskStart< 0 && taskEnd<end){
            console.log(taskStart);
            $("#menuhorizontalLines").append(`<div class="menuTask ${privelegy}color${color}-${num} color${color}-borders" style="opacity:${opacity};top: 4vh; height:${taskEnd}vh; border-width: 2px;"><span>${task.text}</span></div>`);
        }
        //<div class="menuTask" style="top: 4vh; height:10vh;"></div>
    }
}

function createHeaders(){
    const daynames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let today = new Date();
    let minus=0;
    if(today.getDay() == 2){
        minus=1;
    }else if(today.getDay() == 3 || today.getDay() == 4 || today.getDay() == 5){
        minus=2;
    }else if(today.getDay() == 6){
        minus=3;
    }else if(today.getDay() == 0){
        minus=4;
    }
    for(let i=0; i<5;i++){
        let start = new Date(today);
        start.setDate(start.getDate()-minus+i);
        $("#menuSchedule"+i).html(start.getDate());
        $("#menuScheduleDay"+i).html(daynames[start.getDay()]);
        if(toIsoString(today).slice(0, 10) == toIsoString(start).slice(0, 10)){
            $("#menuScheduleFine"+i).addClass("active");
            $("#menuScheduleFine"+i).addClass(`color${mainProject.color}-4`);
        }
    }
}

function createPresiceTime(num){
    if(num < 10){
        return `0${num}:00`;
    }else{
        return `${num}:00`;
    }
}

function createTime(){
    $("#menuColumn").html("");
    $("#menuhorizontalLines").html("");
    let start = obj.userSettings.scheduleStart;
    let end = obj.userSettings.scheduleEnd;
    for(let i = start; i<=end; i++){
        let time = createPresiceTime(i);
        const divSpan = document.createElement("div");
        divSpan.classList.add('menuschedule-time');
        divSpan.classList.add('schedule-show');
        divSpan.setAttribute("style", `position: absolute; top: ${1+12*(i-start)}vh;`);
        divSpan.innerHTML = `<span>${time}</span>`;
        $("#menuColumn").append(divSpan);
        $("#menuhorizontalLines").append(`<div class="menuschedule-line color${mainProject.color}-3" style="top: ${4+12*(i-start)}vh;"></div>`);
    }
}


function createSchedule(){
    $("#menuScheduleColumn").off("click");
    createHeaders();
    createTime();
    $("#menuScheduleColumn").click((e)=>{
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
        const info = JSON.parse(sessionStorage.getItem("info")).path;
        setBackPath(info, 3, nextData);
    });
}

function createChart(){
    $("#menuLeft3").html('<canvas id="menuCanvas"></canvas>');
    const ctx = document.getElementById("menuCanvas").getContext("2d");
    let delayed;
    
    let labels = [];
    let count =0;
    let history = Object.values(obj.userHistory);
    let styles = [1, ];
    let i=0;
    for(let j=0; j<history.length; j++){
        for(let i=0; i<history[j].weeks; i++){
            labels.push("week"+count);
            count++;
            if(j!=history.length-1){
                let newStyle;
                if(history[j].percentage>0.75){
                    newStyle = styles[i]+1;
                }else if(history[j].percentage<0.5 && styles[i]>1){
                    newStyle = styles[i]-1;
                }else{
                    newStyle = styles[i];
                }
                styles.push(newStyle);
                i++;
            }
        }
    }
    labels = labels.slice(Math.max(labels.length - 5, 0));
    styles = styles.slice(Math.max(labels.length - 5, 0));
    labels.push("week1");
    labels.push("week2");
    labels.push("week3");
    labels.push("week4");
    labels.push("week5");
    styles.push(2);
    styles.push(3);
    styles.push(2);
    styles.push(3);
    styles.push(4);

    const data ={
        labels, 
        datasets:[{
            data:styles,
            label: "History of styles",
            fill:true,
            pointBackgroundColor: "000",
            tension:0.2
        }]
    }

    const config ={
        type: 'line',
        data: data,
        options: {
            radius:3,
            hitRadius:20,
            hoverRadius:8,
            responsive: true,
            animation: {
                onComplete: ()=>{
                    delayed = true;
                },
                delay: (context) =>{
                    let delay =0;
                    if(context.type == "data" && context.mode === "default" && !delayed){
                        delay = context.dataIndex*300+context.datasetIndex*100;
                    }
                    return delay;
                }
            },
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: {
                        color: "black",
                        fontSize: 12
                    }
                },
                y: {
                    ticks: {
                        // Include a dollar sign in the ticks
                        callback: function(value) {
                            if(Number.isInteger(value)){
                                return value;
                            }else{
                                return '';
                            }
                        },
                        color: "black",
                        fontSize: 12
                    }
                }
            },
            y: {
                beginAtZero: true,
                min: 0,
                max: 5,
                stepSize: 1
            }
        }
    }

    const myChart = new Chart(ctx, config);
}

export async function menu_getReady(){
    preparePalette();
    lastNotes();
    createSchedule();
    createTasks();
    createChart();
}