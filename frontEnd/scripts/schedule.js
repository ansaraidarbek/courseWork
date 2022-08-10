import { request_updateTask, request_addTask, request_passPdf} from './requests.js';
import {newTaskHandler_getTasks, newTaskHandler_deleteTask,newTaskHandler_manageBlocks, newTaskHandler_updateStage,newTaskHandler_updateTask, newTaskHandler_addTask, newTaskHandler_getMaxId} from './newTaskHandler.js';
import obj from './file.js';
const PDF = require('pdf-parse');
import mainProject  from './mainProject.js';
import { sidebar_timeStamp } from './sidebar.js';
const electron = require('electron');
const { ipcRenderer } = electron;
const remote = require("@electron/remote");
const fs = require('fs');

let trueToday;
let activeMonth;
let activeYear;
let weekStart;
let weekEnd;

const monthnames = ['January', 'February', 'March', 'April', 'May', 'June',
'July', 'August', 'September', 'October', 'November', 'December'];
const daynames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const smallDaynames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];



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

function translate(data){
    let startHeight = obj.userSettings.scheduleStart * 60;
    let hours = data.substring(0, 2);
    let result = parseInt(hours)*60;
    let minutes = data.substring(3, 5);
    result = result + parseInt(minutes) - startHeight + 60;
    return result;
}

const observer = new ResizeObserver((entries) => {
    let num = $(document).height() / 7;
    const begin = new Date(weekStart);
    entries.forEach(entry =>{
        const isSmall = entry.contentRect.width< num;
        entry.target.innerHTML = isSmall ? `${smallDaynames[begin.getDay()]}, ${begin.getDate()}`:`${daynames[begin.getDay()]}, ${begin.getDate()}`;
        begin.setDate(begin.getDate()+1);
    });
});

const observer2 = new IntersectionObserver(entries =>{
    entries.forEach(entry =>{
        entry.target.classList.toggle("schedule-show", entry.isIntersecting);
    });
},
{
    threshold:1
}
);

function columnEffects(weekDate, i){
    $("#column"+i).removeClass(`color${mainProject.color}-2`)
    $("#column"+i).off('mouseover');
    $("#column"+i).off('mouseout');
    $("#column"+i).off('click');
    if(toIsoString(weekDate).slice(0, 10)>=toIsoString(trueToday).slice(0, 10)){
        $("#column"+i).css("cursor", "pointer");
        
        $("#column"+i).mouseover( (e)=>{
            if(obj.userSettings.style <=2){
                $("#column"+i).removeClass(`color${mainProject.color}-1`).addClass(`color${mainProject.color}-2`);
            }else{
                $("#column"+i).addClass(`color${mainProject.color}-2`);
            }
        });
        $("#column"+i).mouseout( (e)=>{
            if(obj.userSettings.style <=2){
                $("#column"+i).removeClass(`color${mainProject.color}-2`).addClass(`color${mainProject.color}-1`);
            }else{
                $("#column"+i).removeClass(`color${mainProject.color}-2`);
            }
        });
        $("#column"+i).click( async (e)=>{
            const taskId = newTaskHandler_getMaxId(weekDate, mainProject.keyWord);
            const data = {
                project_keyWord: mainProject.keyWord,
                date : toIsoString(weekDate).slice(0, 10),
                start: null,
                end: null,
                id: taskId,
                stage: 0,
                text: null,
                user_email: obj.user.email,
                exist: false,
                ended: false,
                color: mainProject.color,
                mainProject: mainProject,
                contains: false,
                mutations: null,
                innerBound: 0,
                outerBound: 0,
                music:false,
                tool:"schedule"
            }
            ipcRenderer.send('addTaskItself', data);
            e.stopPropagation();
        });
    }else{
        $("#column"+i).removeClass(`color${mainProject.color}-1`).addClass(`color${mainProject.color}-2`);
        $("#column"+i).css("cursor", "default");
    }
    
}

async function addTaskToColumn(task, i, date, color){
    if(obj.userProjects[task.project_keyWord].valid == true){
        let privelegy = "";
        if(obj.userSettings.style <=2){
            privelegy =(mainProject.keyWord == "A")?`color${mainProject.color}-`:"";
        }
        let topValue = translate(task.start);
        let botValue =translate(task.end);
        let diff = botValue - topValue;
        let topForCs = topValue*0.1;
        let heightForCs = diff*0.1+0.1;
        const elem = document.createElement("div");
        const span = document.createElement("span");
        const deleteBtn = document.createElement("img");
        span.innerHTML = task.text;
        if(date.getTime()>=trueToday.getTime() && (mainProject.keyWord == "A" || task.project_keyWord == mainProject.keyWord)){
            deleteBtn.classList.add("schedule-closeButton");
            deleteBtn.setAttribute("src", "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/OOjs_UI_icon_close.svg/1024px-OOjs_UI_icon_close.svg.png");
    
            deleteBtn.addEventListener("mouseover", (e)=>{
                if(obj.userSettings.style <=2){
                    elem.classList.replace(`${privelegy}color${color}-4`, `${privelegy}color${color}-5`);
                }else{
                    if(task.stage==1){
                        elem.classList.replace(`${privelegy}color${color}-4`, `${privelegy}color${color}-3`);
                    }
                }
                //elem.classList.replace(`${privelegy}color${color}-2`, `${privelegy}color${color}-3`);
                deleteBtn.style.opacity = "1"
                e.stopPropagation();
            });

            deleteBtn.addEventListener("click", (e)=>{
                let mutatedTasks = null;
                let url = `deleteTask/${obj.user.email}/${task.date}/${task.project_keyWord}/${task.id}`;
                if(task.mutations != null){
                    mutatedTasks = obj.taskMutations[task.mutations];
                    url = `deleteTask/${obj.user.email}`;
                }
                const data = {
                    page: "schedule",
                    url: url,
                    delete: false,
                    text: task.text,
                    style: color,
                    parentId: null,
                    storage: [],
                    listOfTasks: mutatedTasks
                }
                ipcRenderer.send('beforeDelete', data);
                e.stopPropagation();
            });
            elem.appendChild(deleteBtn);
        }
    
        // let nowValue = translate(realToday.toLocaleTimeString('it-IT'));
        if (task.stage == 1){
            if(obj.userSettings.style <=2){
                elem.classList.add(`${privelegy}color${color}-4`);
            }else{
                elem.classList.add(`${privelegy}color${color}-2`);
            }
        }else{
            if(obj.userSettings.style <=2){
                elem.classList.add(`${privelegy}color${color}-2`);
            }else{
                elem.classList.add(`${privelegy}color${color}-4`);
            }
        }
        elem.classList.add(`color${color}-borders`);
        elem.classList.add("schedule-task");
        elem.style.position = "absolute";
        elem.style.cursor = "pointer";
        if(i==7){
            elem.style.width = "calc(100% + 0.5px)";
        }else{
            elem.style.width = "calc(100% + 0.5px)";
        }
        let lowerLimit = obj.userSettings.scheduleEnd;
        let startPoint = obj.userSettings.scheduleStart;
        let endLine = (lowerLimit-startPoint)*6+6.1;
        if(topForCs+heightForCs>endLine){
            heightForCs = endLine-topForCs;
        }
        elem.style.top = `${topForCs}vh`;
        elem.style.height = `${heightForCs}vh`;
        elem.style.zIndex = 2;
        elem.appendChild(span);
    
        if((mainProject.keyWord == "A" || task.project_keyWord == mainProject.keyWord)){
            elem.style.borderWidth = "2px";
            elem.addEventListener("mouseover", ()=>{
                if(obj.userSettings.style <=2){
                    elem.classList.replace(`${privelegy}color${color}-4`, `${privelegy}color${color}-5`);
                    elem.classList.replace(`${privelegy}color${color}-2`, `${privelegy}color${color}-3`);
                }else{
                    if(task.stage==1){
                        elem.classList.replace(`${privelegy}color${color}-2`, `${privelegy}color${color}-3`);
                    }
                    elem.classList.replace(`${privelegy}color${color}-4`, `${privelegy}color${color}-3`);
                }
                deleteBtn.style.opacity = "0.5"
            });
            elem.addEventListener("mouseout", ()=>{
                if(obj.userSettings.style <=2){
                    elem.classList.replace(`${privelegy}color${color}-5`, `${privelegy}color${color}-4`);
                    elem.classList.replace(`${privelegy}color${color}-3`, `${privelegy}color${color}-2`);
                }else{
                    if(task.stage==1){
                        elem.classList.replace(`${privelegy}color${color}-3`, `${privelegy}color${color}-2`);
                    }
                    elem.classList.replace(`${privelegy}color${color}-3`, `${privelegy}color${color}-4`);
                }
                deleteBtn.style.opacity = "0"
            });
        
        
            elem.addEventListener("click", (e)=>{
                let finished = false;
                if(toIsoString(date).slice(0, 10)<toIsoString(trueToday).slice(0, 10)){
                    finished = true;
                }
                //find color
                const data = {
                    project_keyWord: task.project_keyWord,
                    date : toIsoString(date).slice(0, 10),
                    start: task.start,
                    end: task.end,
                    id: task.id,
                    stage: task.stage,
                    text: task.text,
                    user_email: obj.user.email,
                    exist: true,
                    ended: finished,
                    color: obj.userNewTasks[task.date][task.project_keyWord].color,
                    mainProject: mainProject,
                    contains: task.contains,
                    mutations: task.mutations,
                    innerBound: task.innerBound,
                    outerBound: task.outerBound,
                    music:task.music,
                    tool:"schedule"
                }
                ipcRenderer.send('addTaskItself', data);
                e.stopPropagation();
            });
            elem.addEventListener("contextmenu", async (e)=>{
                e.preventDefault();
                if(date.getTime()>=trueToday.getTime()){
                    console.log("hello");
                    const newStage = (task.stage < 1) ? 1 : 0;
                    newTaskHandler_updateStage(task, newStage);
                    task.stage = newStage
                    request_updateTask(obj.user.email, task);
                    schedule_getReady();
                }
                e.stopPropagation();
            })
        }else{
            elem.style.opacity = 0.7;
        }
        $("#column"+i).append(elem);
    }
}


function preparePalette(){
    $("#horizontalLines").html("");
    $("#column0").addClass(`color${mainProject.color}-2`);
    const userSettings = obj.userSettings
    if(!userSettings){
        console.log("no userSettings access!");
    }
    for(let i=0; i<8; i++){
        $("#column"+i).html(`<div class="schedule-blockSpace schedule-height" id="dayBlock${i}"></div>`);
        if(i>=1){
            $("#column"+i).html(`
            <div class="schedule-blockColumnTop schedule-height" id="dayBlock${i}">
                <span id="Day1">Monday, 24</span>
            </div>
            `);
            if(obj.userSettings.style <=2){
                $("#column"+i).addClass(`color${mainProject.color}-1`);
            }
            $("#dayBlock"+i).html(`<span id="Day${i}"></span>`);
            $("#dayBlock"+i).click((e)=>e.stopPropagation());
            $("#dayBlock"+i).mouseover((e)=>e.stopPropagation());
            $("#dayBlock"+i).css("cursor", "default");
        }
        if(obj.userSettings.style <=2){
            $("#dayBlock"+i).addClass(`color${mainProject.color}-3`);
        }
    }
    let j=0;
    let height = ((userSettings.scheduleEnd - userSettings.scheduleStart)*6)+6;
    $("#column0").css("height", `calc(${height}vh + 1px)`);
    for(let i=userSettings.scheduleStart+1; i<userSettings.scheduleEnd; i++){
        const time=document.createElement("div");
        observer2.observe(time);
        time.classList.add("schedule-time");
        time.style.position = "absolute";
        let index = 9+(6*j);
        time.style.top = `${index}vh`;
        if(i<10){
            time.innerHTML = `<span>0${i}:00</span>`
        }else{
            time.innerHTML = `<span>${i}:00</span>`
        }
        $("#column0").append(time);
        j++;
    }
    j=1;
    for(let i=userSettings.scheduleStart+1; i<userSettings.scheduleEnd; i++){
        const line=document.createElement("div");
        line.classList.add("schedule-line");
        if(obj.userSettings.style <=2){
            line.classList.add(`color${mainProject.color}-3`);
        }else{
            line.classList.add(`color${mainProject.color}-lines`);
        }
        let index = 6+(6*j);
        line.style.top=`${index}vh`
        $("#horizontalLines").append(line);
        j++;

    }
    for(let i=0; i<9; i++){
        if(obj.userSettings.style <=2){
            $("#line"+i).addClass(`color${mainProject.color}-3`);
        }else{
            $("#line"+i).addClass(`color${mainProject.color}-lines`);
        }
        $("#line"+i).css("height", `calc(${height}vh + 1px)`);
    }
    for(let i=1; i<8; i++){
        $("#column"+i).css("height", `calc(${height}vh + 1px)`);
    }
    $("#finishLine").addClass(`color${mainProject.color}-2`);
    $("#finishLine").css("top", `${height}vh`);
    $("#weekCalendar").addClass(`scroll${mainProject.color}`);
    $("#todayTaskList").addClass(`scroll${mainProject.color}`);
    $("#addTask").addClass(`color${mainProject.color}-2`);
    if(obj.userSettings.style <=2){
        $("#leftButton").addClass(`color${mainProject.color}-1`);
        $("#rightButton").addClass(`color${mainProject.color}-1`);
        $("#calendar").addClass(`color${mainProject.color}-1`);
    }
}

function setEffectsAndDates(){
    for(let i=1; i<8; i++){
        const forColumnCount = new Date(weekStart);
        forColumnCount.setDate(forColumnCount.getDate()+i-1);
        columnEffects(forColumnCount, i);
        const day = document.getElementById(`Day${i}`);
        observer.observe(day);
    }
    $("#calendarTopLeft").html(`${daynames[trueToday.getDay()]} ${trueToday.getDate()}`);
    $("#monthYear").html(`${monthnames[activeMonth]} ${activeYear}`);
    $("#calendarTopRight").html(`${monthnames[activeMonth]} ${activeYear}`);
}

function showCalendar(){
    for (let i=1; i<7; i++){
        for (let j=1; j<8; j++){
            $("#r"+i+"c"+j).removeClass("schedule-prev");
            $("#r"+i+"c"+j).removeClass("schedule-active_week");
            $("#r"+i+"c"+j).removeClass("schedule-active");
            $("#r"+i+"c"+j).removeClass(`color${mainProject.color}-2`);
        }
    }
    let calendarBegining = new Date(weekStart);
    if(calendarBegining.getMonth() == activeMonth){
        while(calendarBegining.getDate()!=1){
            calendarBegining.setDate(calendarBegining.getDate()-1);
        }
    }
    while(calendarBegining.getDay() != 1){
        calendarBegining.setDate(calendarBegining.getDate()-1);
    }
    for (let i=1; i<7; i++){
        for (let j=1; j<8; j++){
            if(calendarBegining.getMonth()!=activeMonth){
                $("#r"+i+"c"+j).addClass("schedule-prev");
            }
            $("#r"+i+"c"+j).html(calendarBegining.getDate());
            $("#r"+i+"c"+j).val(calendarBegining.getMonth());
            $("#r"+i+"c"+j).data("year", calendarBegining.getFullYear())
            calendarBegining.setDate(calendarBegining.getDate()+1);
        }
    }
    for (let i=1; i<7; i++){
        if($("#r"+i+"c1").html()==weekStart.getDate() && $("#r"+i+"c7").html()==weekEnd.getDate() && ($("#r"+i+"c7").val()==activeMonth || $("#r"+i+"c1").val()==activeMonth)){
            for (let j=1; j<8; j++){
                if($("#r"+i+"c"+j).html()==trueToday.getDate() && $("#r"+i+"c"+j).val() == trueToday.getMonth() && $("#r"+i+"c"+j).data().year == trueToday.getFullYear()){
                    $("#r"+i+"c"+j).addClass("schedule-active");
                }else{
                    $("#r"+i+"c"+j).addClass("schedule-active_week");
                }
                $("#r"+i+"c"+j).addClass(`color${mainProject.color}-2`);
            }
        }
    }
}

async function showTasks(){
    $("#todayTaskList").html("");
    let arr = newTaskHandler_getTasks(weekStart, 7);
    let mainStyle = 'style' + obj.userSettings.style;
    for(let i =0; i<7; i++){
        if(arr[i]!=null){
            const forColumnCount = new Date(weekStart);
            forColumnCount.setDate(forColumnCount.getDate()+i);
            for(let j=0; j<3; j++){
                arr[i].tasks[j].forEach(task=>{
                    let color = obj.userProjects[task.project_keyWord][mainStyle];
                    if(task.start != null){
                        addTaskToColumn(task, i+1, forColumnCount, color);
                    }
                });
            }
        }
    }
    let tasks = newTaskHandler_getTasks(trueToday, 1);
    for(let j=0; j<3; j++){
        if(tasks[0]!=null){
            tasks[0].tasks[j].forEach(task=>{
                if(task.start == null && obj.userProjects[task.project_keyWord].valid == true && (mainProject.keyWord == "A" || task.project_keyWord == mainProject.keyWord)){
                    let color = obj.userProjects[task.project_keyWord][mainStyle];
                    let privelegy = "";
                    const div = document.createElement("div");
                    div.classList.add("schedule-todayTaskListElem");
                    if(obj.userSettings.style <=2){
                        privelegy =(mainProject.keyWord == "A")?`color${mainProject.color}-`:"";
                        div.classList.add(`${privelegy}color${color}-2`);
                    }else{
                        div.classList.add(`${privelegy}color${color}-2`);
                        div.style.boxShadow = "2px 2px 4px rgba(0, 0, 0, 0.25)";
                    }
                    const span = document.createElement("span");
                    const deleteBtn = document.createElement("button");
                    deleteBtn.classList.add(`${privelegy}color${color}-2`);
                    deleteBtn.innerHTML = `
                        <img src = "./icons/deleteTasks.svg" alt="deleteButton"/>
                    `;
                    deleteBtn.addEventListener("mouseover", (e)=>{
                        deleteBtn.classList.replace(`${privelegy}color${color}-2`, `${privelegy}color${color}-3`);
                        e.stopPropagation();
                    })
                    deleteBtn.addEventListener("mouseout", (e)=>{
                        deleteBtn.classList.replace(`${privelegy}color${color}-3`, `${privelegy}color${color}-2`);
                        e.stopPropagation();
                    })
                    deleteBtn.addEventListener("click", (e)=>{
                        let mutatedTasks = null;
                        let url = `deleteTask/${obj.user.email}/${task.date}/${task.project_keyWord}/${task.id}`;
                        if(task.mutations != null){
                            mutatedTasks = obj.taskMutations[task.mutations];
                            url = `deleteTask/${obj.user.email}`;
                        }
                        const data = {
                            page: "schedule",
                            url: url,
                            delete: false,
                            text: task.text,
                            style: color,
                            parentId: null,
                            storage: [],
                            listOfTasks: mutatedTasks
                        }
                        console.log(data);
                        ipcRenderer.send('beforeDelete', data);
                        e.stopPropagation();
                    })
                    span.innerHTML = task.text;
                    if(obj.userSettings.style <=2){
                        div.addEventListener("mouseover", ()=>{
                            div.classList.replace(`${privelegy}color${color}-2`, `${privelegy}color${color}-3`);
                            deleteBtn.classList.replace(`${privelegy}color${color}-2`, `${privelegy}color${color}-3`);
                        })
                        div.addEventListener("mouseout", ()=>{
                            div.classList.replace(`${privelegy}color${color}-3`, `${privelegy}color${color}-2`);
                            deleteBtn.classList.replace(`${privelegy}color${color}-3`, `${privelegy}color${color}-2`);
                        })
                    }
                    div.addEventListener("click", (e)=>{
                        const data = {
                            project_keyWord: task.project_keyWord,
                            date : toIsoString(trueToday).slice(0, 10),
                            start: null,
                            end: null,
                            id: task.id,
                            stage: task.stage,
                            text: task.text,
                            user_email: obj.user.email,
                            exist: true,
                            ended: false,
                            color: color,
                            mainProject: mainProject,
                            contains: task.contains,
                            mutations: task.mutations,
                            innerBound: task.innerBound,
                            outerBound: task.outerBound,
                            music:task.music,
                            tool:"schedule"
                        }
                        console.log(data);
                        ipcRenderer.send('addTaskItself', data);
                        e.stopPropagation();
                    });
                    div.appendChild(span);
                    div.appendChild(deleteBtn);
                    $("#todayTaskList").append(div);
                }
            });
        }
    }

}

function createProjects(arr, dict){
    let count =0;
    for(let j=0; j<arr.length; j++){
        let newArr = arr[j].split(" ");
        let anotherArr ="";
        for(let i=0; i<newArr.length; i++){
            if(i>1){
                anotherArr+=newArr[i];
            }
        }
        anotherArr = anotherArr.substring(0, 20);
        try {
            arr[j] = dict[anotherArr].keyWord
            count++;
        } catch (e) {
            console.log("some projects could not be found");
        }
    }
    console.log(count);
}

function addDownload(){
    $("#scheduleUploadButton").click(async (e)=>{
        $("#hiddenFile").html(`<input name="upload" type="file" id="forFiles" accept=".pdf"> `);
        $("#hiddenFile").html(`<input name="upload" type="file" id="forFiles" accept=".pdf"> `);
        e.preventDefault();
        $("#forFiles").click();
        $("#forFiles").change(async (event) => {
            event.preventDefault();
            const fileList = event.target.files;
            let path = fileList[0].path;
            let name = fileList[0].name;

            const existingFile = fs.readFileSync(path); 
            var u8 = new Uint8Array(existingFile);
            var b64 = Buffer.from(u8).toString('base64');
            const formData = new FormData();
            formData.append("file", b64);
            formData.append("fileName", name);
            let result = await request_passPdf(obj.user.email, formData);
            if(!result.valid){
                console.log("delete some projects!");
            }
            for(let i=0; i<2; i++){
                for(let j=0; j<result.data[i].length; j++){
                    var hours = Number(result.data[i][j].match(/^(\d+)/)[1]);
                    var minutes = Number(result.data[i][j].match(/:(\d+)/)[1]);
                    var AMPM = result.data[i][j].match(/\s(.*)$/)[1];
                    if(AMPM == "PM" && hours<12) hours = hours+12;
                    if(AMPM == "AM" && hours==12) hours = hours-12;
                    var sHours = hours.toString();
                    var sMinutes = minutes.toString();
                    if(hours<10) sHours = "0" + sHours;
                    if(minutes<10) sMinutes = "0" + sMinutes;
                    result.data[i][j] = sHours + ":" + sMinutes;
                }
            }
            result.data.splice(2, 1);
            result.data.splice(3, 3);
            for(let i=0; i<result.data[4].length; i++){
                result.data[4][i] = result.data[4][i].substring(6, 10) + "-"+result.data[4][i].substring(3, 5)+"-"+result.data[4][i].substring(0, 2);
            }
            let mine = Object.values(result.projects)
            let length = mine.length
            if(result.valid){
                for(let i=0; i<mine.length; i++){
                    obj.userProjects[mine[i].keyWord] = mine[i];
                }
                obj.setInstance(obj.getInstance());
            }
            createProjects(result.data[2], result.projects);
            console.log(result.data);
            let mutatedArr = {}
            for(let i=0; i<length; i++){
                mutatedArr[mine[i].keyWord] = null;
            }
            let index = 0;
            let multiplyer = 0;
            let today = new Date();
            console.log(toIsoString(today).slice(0, 10));
            while(1){
                let today = new Date();
                while(today.getDay() != 1){
                    today.setDate(today.getDate()-1);
                }
                today.setDate(today.getDate()+result.data[5][index]+multiplyer);
                if(toIsoString(today).slice(0, 10)>result.data[4 ][index]){
                    break;
                }
                const taskId = newTaskHandler_getMaxId(today, result.data[2][index]);
                if(mutatedArr[result.data[2][index]]== null){
                    mutatedArr[result.data[2][index]] = toIsoString(today).slice(0, 10)+"/"+result.data[2][index]+"/"+taskId;
                }
                let data = {
                    project_keyWord: result.data[2][index],
                    date : toIsoString(today).slice(0, 10),
                    start: result.data[0][index],
                    end: result.data[1][index],
                    id: taskId,
                    stage: 0,
                    text: `attend ${result.data[2][index]} lecture`,
                    mutations: mutatedArr[result.data[2][index]],
                    contains: false,
                    innerBound: 0,
                    outerBound: 0,
                    music:false
                }
                request_addTask(obj.user.email, data);
                newTaskHandler_addTask([data]);
                if(index == result.data[5].length-1){
                    index = -1;
                    multiplyer +=7;
                }
                index++;
            }
            console.log(mutatedArr);
            ipcRenderer.send("changeUserInfo");
        });
    });
}

export function schedule_getReady(){
    const info = (JSON.parse(sessionStorage.getItem("info"))).info;
    trueToday = new Date(info.trueToday);
    activeMonth = info.activeMonth;
    activeYear = info.activeYear;
    weekStart = new Date(info.weekStart);
    weekEnd = new Date(info.weekEnd);
    preparePalette();
    setEffectsAndDates();
    const time = new Date();
    sidebar_timeStamp(time);
    showCalendar();
    showTasks();
    addDownload();
}

// $(document).ready(async (e)=>{
//     schedule_getReady();
// });

$("#addTask").mouseover( ()=>{
    $("#addTask").removeClass(`color${mainProject.color}-2`).addClass(`color${mainProject.color}-3`);
});
$("#addTask").mouseout( ()=>{
    $("#addTask").removeClass(`color${mainProject.color}-3`).addClass(`color${mainProject.color}-2`);
});

$("#addTask").click( async (e)=>{
    const taskId = newTaskHandler_getMaxId(trueToday, mainProject.keyWord);
    const data = {
        project_keyWord: mainProject.keyWord,
        date : null,
        start: null,
        end: null,
        id: taskId,
        stage: 0,
        text: null,
        user_email: obj.user.email,
        exist: false,
        ended: false,
        color: mainProject.color,
        mainProject: mainProject,
        contains: false,
        mutations: null,
        innerBound: 0,
        outerBound: 0,
        music:false,
        tool:"schedule"
    }
    ipcRenderer.send('addTaskItself', data);
    e.stopPropagation();
});

if(obj.userSettings.style <=2){
    $("#rightButton").mouseover( ()=>{
        $("#rightButton").removeClass(`color${mainProject.color}-1`).addClass(`color${mainProject.color}-2`);
    });
    $("#rightButton").mouseout( ()=>{
        $("#rightButton").removeClass(`color${mainProject.color}-2`).addClass(`color${mainProject.color}-1`);
    });
}
$("#rightButton").click( async (e)=>{
    weekStart.setDate(weekStart.getDate()+7);
    weekEnd.setDate(weekEnd.getDate()+7);
    const info = JSON.parse(sessionStorage.getItem("info"));
    info.info.weekStart = weekStart;
    info.info.weekEnd = weekEnd;
    if(weekStart.getMonth()!= activeMonth && weekEnd.getMonth()!= activeMonth){
        activeMonth = weekStart.getMonth();
        activeYear = weekStart.getFullYear();
        info.info.activeMonth = activeMonth;
        info.info.activeYear = activeYear;
    }
    console.log(info.info);
    sessionStorage.setItem("info", JSON.stringify(info));
    schedule_getReady();
});

if(obj.userSettings.style <=2){
    $("#leftButton").mouseover( ()=>{
        $("#leftButton").removeClass(`color${mainProject.color}-1`).addClass(`color${mainProject.color}-2`);
    });
    $("#leftButton").mouseout( ()=>{
        $("#leftButton").removeClass(`color${mainProject.color}-2`).addClass(`color${mainProject.color}-1`);
    });
}
$("#leftButton").click( async (e)=>{
    weekStart.setDate(weekStart.getDate()-7);
    weekEnd.setDate(weekEnd.getDate()-7);
    const info = JSON.parse(sessionStorage.getItem("info"));
    info.info.weekStart = weekStart;
    info.info.weekEnd = weekEnd;
    if(weekStart.getMonth()!= activeMonth && weekEnd.getMonth()!= activeMonth){
        activeMonth = weekStart.getMonth();
        activeYear = weekStart.getFullYear();
        info.info.activeMonth = activeMonth;
        info.info.activeYear = activeYear;
    }
    console.log(info.info);
    sessionStorage.setItem("info", JSON.stringify(info));
    schedule_getReady();
});

ipcRenderer.on('afterDelete', async (event, data)=>{
    if(data.delete == true && data.page == "schedule"){
        newTaskHandler_deleteTask(data.storage, false);
        schedule_getReady();
    }
});

ipcRenderer.on('taskItselfAdded', (event, data)=>{
    if(data.updated && data.tool == "schedule"){
        if(data.result.newOne){
            console.log(data.result.task);
            if(data.result.sB != null){
                newTaskHandler_manageBlocks( null, data.result.sB);
            }
            newTaskHandler_addTask(data.result.task);
        }else{
            if(data.result.deleted == true){
                let changable ={
                    prevDate: data.result.oldTask.date,
                    prevId: data.result.oldTask.id,
                    project_keyWord: data.result.oldTask.project_keyWord,
                    nextDate: data.result.newTask.date,
                    nextId: data.result.newTask.id
                }
                if(data.result.sB != null){
                    newTaskHandler_manageBlocks( changable, data.result.sB);
                }
                newTaskHandler_deleteTask([data.result.oldTask]);
                console.log(data.result.oldTask, data.result.newTask);
                newTaskHandler_addTask([data.result.newTask]);
            }else{
                console.log("here");
                if(data.result.sB != null){
                    newTaskHandler_manageBlocks( null, data.result.sB);
                }
                newTaskHandler_updateTask(data.result.newTask, data.result.oldTask, );
            }
        }
        schedule_getReady();
    }

});

// ipcRenderer.on("changeUserInfo", ()=>{
//     schedule_getReady();
// });

// ipcRenderer.on('goback', ()=>{
//     const backPath = JSON.parse(sessionStorage.getItem("backPath"));
//     const currentData = backPath.pop();
//     sessionStorage.setItem("info", JSON.stringify(currentData));
//     sessionStorage.setItem("backPath", JSON.stringify(backPath));
//     window.location.href = currentData.path;
// });