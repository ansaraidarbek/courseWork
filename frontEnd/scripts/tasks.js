import {request_updateTask, request_addTask, request_updateallStudyBlocks, request_deleteSomeElement} from './requests.js';
import {newTaskHandler_getTasks, newTaskHandler_deleteTask,newTaskHandler_updateTask, newTaskHandler_manageBlocks, newTaskHandler_updateStage, newTaskHandler_addTask, newTaskHandler_getMaxId} from './newTaskHandler.js';
import obj from './file.js';
import mainProject  from './mainProject.js';
const electron = require('electron');
const { ipcRenderer } = electron;
const remote = require("@electron/remote");
let firstPlace;
let lastPlace;


// let today = new Date(info.date);
// if(!today){
//     today = new Date();
// }
let today;
let trueToday;
let elementAdded;


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
    if(obj.userSettings.style <=2){  
        $("#leftFront").addClass(`color${mainProject.color}-3`);
        $("#rightFront").addClass(`color${mainProject.color}-3`);
    }
    $("#middleBack").addClass(`color${mainProject.color}-2`);
    $("#middleFront").addClass(`color${mainProject.color}-3`);
    $("#addNewTask").addClass(`color${mainProject.color}-3`);
    $("#leftTaskList").addClass(`scroll${mainProject.color}`);
    $("#middleTaskList").addClass(`scroll${mainProject.color}`);
    $("#rightTaskList").addClass(`scroll${mainProject.color}`);
    $("#midAddTask").addClass(`color${mainProject.color}Back`);
}

function showHeader(){
    const monthnames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
    const daynames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    let prev = new Date(today);
    prev.setDate(prev.getDate()-1);
    let next = new Date(today);
    next.setDate(next.getDate()+1);
    $("#leftTaskHeaderTop").html(daynames[prev.getDay()]+", "+prev.getDate());
    $("#leftTaskHeaderBottom").html(monthnames[prev.getMonth()]);
    $("#middleTaskHeaderTop").html(daynames[today.getDay()]+", "+today.getDate());
    $("#middleTaskHeaderBottom").html(monthnames[today.getMonth()]);
    $("#rightTaskHeaderTop").html(daynames[next.getDay()]+", "+next.getDate());
    $("#rightTaskHeaderBottom").html(monthnames[next.getMonth()]);
}

function printTaskDays(taskInfo, list, bottomNum, middle){
    if(taskInfo != null){
        let done = 0;
        let total = 0;
        let mainStyle = 'style' + obj.userSettings.style;
        for(let j =0; j<3; j++){
            if(taskInfo.tasks[j].length !=0){
                taskInfo.tasks[j].forEach(task =>{
                    let color = obj.userProjects[task.project_keyWord][mainStyle];
                    if(obj.userProjects[task.project_keyWord].valid == true && (mainProject.keyWord == "A" || task.project_keyWord == mainProject.keyWord)){
                        total++;
                        if(j == 1){
                            done++;
                        }
                        if(middle && toIsoString(today).slice(0, 10)>=toIsoString(trueToday).slice(0, 10)){
                            createMiddleList( task, list, color)
                        }else{
                            createList(task, list, true, color);
                        }
                    }
                });
            }
        }
        bottomNum.html(done+"/"+total);
    }else{
        bottomNum.html("0/0");
    }
}

function showBody(){
    $("#leftTaskList").html("");
    $("#middleTaskList").html("");
    $("#rightTaskList").html("");
    let prev = new Date(today);
    prev.setDate(prev.getDate()-1);
    let next = new Date(today);
    next.setDate(next.getDate()+1);
    console.log(toIsoString(today).slice(0, 10)>=toIsoString(trueToday).slice(0, 10));
    if(toIsoString(today).slice(0, 10)>=toIsoString(trueToday).slice(0, 10)){
        $("#midAddTask").css("display", "block");
    }else{
        $("#midAddTask").css("display", "none");
    }
    let arr = newTaskHandler_getTasks(prev, 3);
    printTaskDays(arr[0], $("#leftTaskList"), $("#leftTaskEnd"), false);
    printTaskDays(arr[1], $("#middleTaskList"), $("#middleTaskEnd"), true);
    printTaskDays(arr[2], $("#rightTaskList"), $("#rightTaskEnd"), false);

}

function createList(task, list, mid, color){
    let privelegy = "";
    if(obj.userSettings.style <=2){
        privelegy =(mainProject.keyWord == "A")?`color${mainProject.color}-`:"";
    }
    let num=(mid==true)?3:2;
    const elem = document.createElement("li");
    elem.classList.add("tasks-element");
    elem.classList.add("tasks-mid");
    elem.setAttribute("draggable", true);
    elem.addEventListener("dragstart", ()=>{
        elem.classList.add("dragging");
        firstPlace = list;
    });

    elem.addEventListener("dragend", ()=>{
        elem.classList.remove("dragging");
        newChanges(task);
    });

    const doneStage = document.createElement("button");
    const text = document.createElement("span");
    doneStage.classList.add("tasks-done");
    if(obj.userSettings.style <=2){
        doneStage.classList.add(`${privelegy}color${color}-${num}`);
    }else{
        doneStage.classList.add(`color${color}-color${color}-6`);
    }
    text.innerHTML = task.text;
    if (task.stage == 1){
        elem.classList.add(`${privelegy}color${color}-${num}`);
        doneStage.innerHTML = '<img src="./icons/checkTasks.svg" alt="checkTasks">';
    }
    elem.appendChild(doneStage);
    elem.appendChild(text);
    list.append(elem);
}

function createMiddleList(task, list, color){
    let privelegy = "";
    if(obj.userSettings.style <=2){
        privelegy =(mainProject.keyWord == "A")?`color${mainProject.color}-`:"";
    }
    const elem = document.createElement("li");
    elem.classList.add("tasks-element");
    elem.classList.add("tasks-midElement");
    elem.classList.add("tasks-mid");
    elem.setAttribute("draggable", true);
    elem.addEventListener("dragstart", ()=>{
        elem.classList.add("dragging");
        firstPlace = list;
    });

    elem.addEventListener("click", (e)=>{
        if(task.contains){
            let message = task.date+"/"+task.project_keyWord+"/"+task.id;
            console.log(obj.studyBlocks[message]);
            ipcRenderer.send("startStudy", obj.studyBlocks[message]);
        }else{
            const data = {
                project_keyWord: task.project_keyWord,
                date : task.date,
                start: task.start,
                end: task.end,
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
                tool:"tasks"
            }
            ipcRenderer.send('addTaskItself', data);
            e.stopPropagation();
        }
    });

    elem.addEventListener("mouseover", (e)=>{
        elem.classList.add(`${privelegy}color${color}-3`);
    });

    elem.addEventListener("mouseout", (e)=>{
        elem.classList.remove(`${privelegy}color${color}-3`);
    });

    elem.addEventListener("dragend", ()=>{
        elem.classList.remove("dragging");
        newChanges(task);
    });
    const doneStage = document.createElement("button");
    const div = document.createElement("div");
    div.classList.add("tasks-text");
    const p = document.createElement("p");
    const text = document.createElement("span");
    const deleteButton = document.createElement("button");

    doneStage.classList.add("tasks-done");
    deleteButton.classList.add("tasks-delete");

    if(obj.userSettings.style <=2){
         doneStage.classList.add(`${privelegy}color${color}-3`);
        deleteButton.classList.add(`${privelegy}color${mainProject.color}-2`);
    }else{
        doneStage.classList.add(`color${color}-color${color}-6`);
        deleteButton.classList.add(`color${color}-color${color}-6`);
    }

    deleteButton.innerHTML = '<img src="./icons/deleteTasks.svg" alt="deleteTasks">';
    doneStage.addEventListener("mouseover", ()=>{
        if(obj.userSettings.style <=2){
            deleteButton.classList.add(`${privelegy}color${color}-3`);
        }
        doneStage.classList.add("tasks-hover");
        elem.classList.add(`${privelegy}color${color}-3`);
    });
    doneStage.addEventListener("mouseout", ()=>{
        if (task.stage != 1 ){
            deleteButton.classList.remove(`${privelegy}color${color}-3`);
            elem.classList.remove(`${privelegy}color${color}-3`);
        }
        doneStage.classList.remove("tasks-hover");
    });
    doneStage.addEventListener("click", async (e)=>{
        const newStage = (task.stage < 1) ? 1 : 0;
        newTaskHandler_updateStage(task, newStage);
        task.stage = newStage
        console.log(task);
        request_updateTask(obj.user.email, task);
        tasks_getReady();
    });

    text.innerHTML = task.text;

    deleteButton.addEventListener("mouseover", ()=>{
        deleteButton.classList.add("tasks-hover");
        deleteButton.classList.add(`${privelegy}color${color}-3`);
        elem.classList.add(`${privelegy}color${color}-3`);

    });
    deleteButton.addEventListener("mouseout", ()=>{
        deleteButton.classList.remove("tasks-hover");
        if (task.stage != 1 ){
            deleteButton.classList.remove(`${privelegy}color${color}-3`);
            elem.classList.remove(`${privelegy}color${color}-3`);
        }
    });
    deleteButton.addEventListener("click", (e)=>{
        let mutatedTasks = null;
        let url = `deleteTask/${obj.user.email}/${task.date}/${task.project_keyWord}/${task.id}`;
        if(task.mutations != null){
            mutatedTasks = obj.taskMutations[task.mutations];
            url = `deleteTask/${obj.user.email}`;
        }
        const data = {
            page: "tasks",
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
    });
    if (task.stage > 0){
        if(task.stage == 1){
            elem.classList.add(`${privelegy}color${color}-3`);
            deleteButton.classList.replace(`${privelegy}color${mainProject.color}-2`,`${privelegy}color${color}-3`);
            p.innerHTML = "completed";
            doneStage.innerHTML = '<img src="./icons/checkTasks.svg" alt="checkTasks">';
        }else{
            p.innerHTML = "in progress";
        }
    }
    
    elem.appendChild(doneStage);
    div.appendChild(text);
    div.appendChild(p);
    elem.appendChild(div);
    elem.appendChild(deleteButton);
    list.append(elem);      
}

export function tasks_getReady(){   
    ipcRenderer.send("notify");
    const info = (JSON.parse(sessionStorage.getItem("info"))).info;
    today = new Date(info.today);
    trueToday = new Date(info.trueToday);
    elementAdded = info.elementAdded;
    preparePalette();
    showHeader();
    showBody();
    const containers = document.querySelectorAll(".tasks-same")
    for(let i=0; i<3; i++){
        containers[i].addEventListener("dragover", (e)=>{
            e.preventDefault();
            switch(i){
                case 0:
                    lastPlace = $("#leftTaskList");
                    break;
                case 1: 
                    lastPlace = $("#middleTaskList");
                    break;
                case 2:
                    lastPlace = $("#rightTaskList");
                    break;
                default:
                    console.log("Something wrong happened");
            }
        });
    }
    if(elementAdded == true){
        console.log("here");
        elementAdded = false;
        info.elementAdded = false;
        let some = JSON.parse(sessionStorage.getItem("info"));
        some.info = info;
        sessionStorage.setItem("info", JSON.stringify(some));
        $("#addNewTask").trigger( "click" );
    }
}

function newChanges(task){
    // console.log(task);
    // console.log(firstPlace.attr("id"));
    // console.log(lastPlace.attr("id"));
    let endDay = new Date(today);
    switch(lastPlace.attr("id")){
        case "leftTaskList":
            endDay.setDate(endDay.getDate()-1);
            break;
        case "rightTaskList":
            endDay.setDate(endDay.getDate()+1);
            break;
        default:
            console.log("Something wrong happened");
    }
    let startDay = new Date(today);
    switch(firstPlace.attr("id")){
        case "leftTaskList":
            startDay.setDate(startDay.getDate()-1);
            break;
        case "rightTaskList":
            startDay.setDate(startDay.getDate()+1);
            break;
        default:
            console.log("Something wrong happened");
    }
    if(firstPlace.attr("id")!=lastPlace.attr("id")){
        if(toIsoString(endDay).slice(0, 10)>=toIsoString(trueToday).slice(0, 10)){
            const taskId = newTaskHandler_getMaxId(endDay, task.project_keyWord);
            if(toIsoString(startDay).slice(0, 10)>=toIsoString(trueToday).slice(0, 10) && task.stage == 0){
                let changable ={
                    prevDate: task.date,
                    prevId: task.id,
                    project_keyWord: task.project_keyWord,
                    nextDate: toIsoString(endDay).slice(0, 10),
                    nextId: taskId
                }
                request_updateallStudyBlocks(obj.user.email, changable);
                request_deleteSomeElement(`deleteTask/${obj.user.email}/${task.date}/${task.project_keyWord}/${task.id}`);
                newTaskHandler_deleteTask([task]);
            }
            const newTask = {
                stage : 0,
                date : toIsoString(endDay).slice(0, 10),
                end : null,
                start : null,
                id : taskId,
                project_keyWord : task.project_keyWord,
                text: task.text,
                mutations: task.mutations,
                contains: false,
                innerBound: task.innerBound,
                outerBound: task.outerBound,
                music: task.music
            }
            request_addTask(obj.user.email, newTask);
            newTaskHandler_addTask([newTask]);
            tasks_getReady();
        }else{
            console.log("cannot drag into past");
        }
    }else{
        console.log("dragged into itself");
    }
}


// $(document).ready(async (e)=>{
//     tasks_getReady();// });

$("#addNewTask").mouseover( ()=>{
    $("#addNewTask").removeClass(`color${mainProject.color}-3`).addClass(`color${mainProject.color}-4`);
});
$("#addNewTask").mouseout( ()=>{
    $("#addNewTask").removeClass(`color${mainProject.color}-4`).addClass(`color${mainProject.color}-3`);
});

$("#addNewTask").click( async (e)=>{
    e.preventDefault();
    if (elementAdded == false){
        const newElement = document.createElement("li");
        newElement.classList.add("tasks-element");
        newElement.classList.add("tasks-mid");
        newElement.classList.add("color-1");
        newElement.innerHTML = `
        <form id="addForm">
            <input type="text" class = "tasks-addTask" id="newInputTask" placeholder="Enter text" >
        </form>
        `
        $("#middleTaskList").append(newElement);
        $("#newInputTask").focus();
        $("#addForm").submit(async (e)=>{
            e.preventDefault();
            // // let result = await this.addTask(text.value);
            // // newElement.remove();  
            // // let some=[];
            // // some.push(result);
            // // makeList( true, some,"midTask", "midTaskList", "middleTaskRight", false);
            // // elementAdded = false; 

            const taskId = newTaskHandler_getMaxId(today, mainProject.keyWord);
            let data = {
                project_keyWord: mainProject.keyWord,
                date : toIsoString(today).slice(0, 10),
                start: null,
                end: null,
                id: taskId,
                stage: 0,
                text: $("#newInputTask").val(),
                mutations: null,
                contains: false,
                innerBound: 0,
                outerBound: 0,
                music:false
            }
            request_addTask(obj.user.email, data);
            newTaskHandler_addTask([data]);
            tasks_getReady();
        });
        elementAdded = true;
        document.addEventListener("click", (e) => {
            if ($("#addForm")){
                $(document).mouseup((e) =>{
                    var container = $("#addForm");

                    // if the target of the click isn't the container nor a descendant of the container
                    if (!container.is(e.target) && container.has(e.target).length === 0) 
                    {
                        newElement.remove();
                        elementAdded = false; 
                    }
                });
            }
        });
    }else{
        $("#newInputTask").focus();
    }
});

$("#dayLeft").click(()=>{
    const info = JSON.parse(sessionStorage.getItem("info"));
    today.setDate(today.getDate() - 1);
    info.info.today = today;
    console.log(today);
    sessionStorage.setItem("info", JSON.stringify(info));
    tasks_getReady();
});

$("#dayRight").click(()=>{
    const info = JSON.parse(sessionStorage.getItem("info"));
    today.setDate(today.getDate() + 1);
    info.info.today = today;
    sessionStorage.setItem("info", JSON.stringify(info));
    console.log(today);
    tasks_getReady();
});

// ipcRenderer.on("changeUserInfo", ()=>{
//     tasks_getReady();// });

// ipcRenderer.on('goback', ()=>{
//     const backPath = JSON.parse(sessionStorage.getItem("backPath"));
//     const currentData = backPath.pop();
//     sessionStorage.setItem("info", JSON.stringify(currentData));
//     sessionStorage.setItem("backPath", JSON.stringify(backPath));
//     window.location.href = currentData.path;
// });

ipcRenderer.on('afterDelete', async (event, data)=>{
    if(data.delete == true && data.page == "tasks"){
        newTaskHandler_deleteTask(data.storage);
        tasks_getReady();
    }
});

ipcRenderer.on('taskItselfAdded', (event, data)=>{
    if(data.updated && data.tool == "tasks"){
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
                if(data.result.sB != null){
                    console.log(data.result.sB);
                    newTaskHandler_manageBlocks( null, data.result.sB);
                }
                newTaskHandler_updateTask(data.result.newTask, data.result.oldTask, );
            }
        }
        tasks_getReady();
    }

});
