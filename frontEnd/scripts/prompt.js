import obj from './file.js';
import { request_deleteSomeElement, request_updateallStudyBlocks, request_addTask, request_updateTask, request_addStudyBlockElems, request_removeStudyBlockElem } from './requests.js';
import { newTaskHandler_getClosedSlots, newTaskHandler_getMaxId } from './newTaskHandler.js';
const electron = require('electron');
const { ipcRenderer } = electron;
const remote = require("@electron/remote");
const text = document.getElementById("taskText");
const startTime = document.getElementById("startTime");
const endTime = document.getElementById("endTime");
const date = document.getElementById("date");
const closeBtn = document.getElementById("closeBtn");
const addButton = document.getElementById("addButton");
const addStudyBlock = document.getElementById("addStudyBlock");
const realToday = new Date();
let open = false;
let fulfilled = false;
let oldData = {};
const deletedArray = [];
const addedArray=[];
let index;
let indexAdded = 0;
const arr = ["tasks", "notes", "none", "schedule"];

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

function chooseButtons(){
    let leftNum = (index-1>-1)?index-1:3;
    let rightNum = (index+1<4)?index+1:0;
    $("#buttonFirst").html(`${arr[leftNum]}`);
    $("#buttonSecond").html(`${arr[(index%4)]}`);
    $("#buttonThird").html(`${arr[rightNum]}`);
}

function createStorage(elem, list){
    let span = document.createElement("span");
    span.innerHTML = elem.requestLink;
    let deleteButton = document.createElement("button");
    deleteButton.innerHTML = `<img src = "./icons/deleteTasks.svg" alt="deleteButton"/>`;
    let liElem = document.createElement("li");
    liElem.appendChild(span);
    liElem.appendChild(deleteButton);
    list.append(liElem);
    deleteButton.addEventListener("click", (e) =>{
        e.preventDefault();
        deletedArray.push(elem);
        liElem.remove()
    });
}

ipcRenderer.once("addTaskItself", async (event, data)=>{
    $("#fileButton").off("click");
    $("#linkButton").off("click");
    if(data.contains == true){
        open = true;
        $("#leftTaskList").html("");
        $("#rightTaskList").html("");
        $("#firstWindow").css("display", "flex");
        $("#secondWindow").css("display", "flex");
        $("#thirdWindow").css("display", "flex");
        let mutatedStr = data.date+"/"+data.project_keyWord+"/"+data.id;
        console.log(mutatedStr);
        console.log(obj.studyBlocks[mutatedStr]);
        for(let i=0; i<arr.length; i++){
            if(arr[i] == obj.studyBlocks[mutatedStr]["tool"][0].requestLink){
                index = i;
            }
        }
        obj.studyBlocks[mutatedStr]["file"].forEach(file =>{
            createStorage(file, $("#leftTaskList"));
        });
        obj.studyBlocks[mutatedStr]["link"].forEach(file =>{
            createStorage(file, $("#rightTaskList"));
        });
    }else{
        index = 2;
    }
    chooseButtons();
    $("#myProject").html(`${obj.userProjects[data.project_keyWord].name}`);
    let privelegy = (data.mainProject.keyWord == "A")?`color${data.mainProject.color}-`:"";
    $("#login-form").addClass((`${privelegy}color${data.color}-3`));
    oldData = {
        project_keyWord: data.project_keyWord,
        date : data.date,
        start: data.start,
        end: data.end,
        id: data.id,
        stage:data.stage,
        text: data.text,
        user_email: data.user_email,
        exist: data.exist,
        ended: data.ended,
        color: data.color,
        mainProject: data.mainProject,
        contains: data.contains,
        mutations: data.mutations,
        music: data.music
    }
    let arr1 = Object.keys(data);
    let arr2 = Object.values(data);
    for(let i =0; i< arr1; i++){
        oldData[arr1[i]] = arr2[i];
    }

    text.focus();
    //first check date validity
    if(!data.date){
        date.value = toIsoString(realToday).slice(0, 10);
        setButtons(date.value);
    }else{
        if(data.ended == true){
            text.setAttribute("readonly", true);
            startTime.disabled = true;
            endTime.disabled = true;
            date.disabled = true;
            startTime.value = data.start;
            endTime.value = data.end;
            date.value = data.date;
        }else{
            date.value = data.date;
            setButtons(date.value);
        }
    }
    date.setAttribute("min", toIsoString(realToday).slice(0, 10));

    //show text
    if(data.text){
        text.value=data.text;
    }

    //set time
    if (data.exist == true){
        startTime.value = data.start;
        endTime.value = data.end;
    }

    date.addEventListener("input", (e)=>{
        setButtons(date.value);
    });

    $("#fileButton").click((e)=>{
        $("#hiddenFile").html(`<input name="upload" type="file" id="forFiles" accept=".pdf"> `);
        e.preventDefault();
        $("#forFiles").click();
        $("#forFiles").change((event) => {
            event.preventDefault();
            const fileList = event.target.files;
            let mutatedStr = oldData.date+"/"+oldData.project_keyWord+"/"+oldData.id;
            let privId=1;
            if( mutatedStr in obj.studyBlocks){
                privId = obj.studyBlocks[mutatedStr]["maxId"];
            }
            for(let i=0; i<fileList.length; i++){
                let elem = {
                    id: privId+indexAdded,
                    task_id : oldData.id,
                    task_date : oldData.date,
                    project_keyWord : oldData.project_keyWord,
                    requestType : "file",
                    requestLink : fileList[i].path
                }
                console.log(fileList[i]);
                addedArray.push(elem);
                createStorage(elem, $("#leftTaskList"));
                indexAdded++;
            }
        });
    })

    $("#linkButton").click((e)=>{
        e.preventDefault();
        if(fulfilled == false){
            let newElement = document.createElement("li");
            newElement.innerHTML = `
            <form id="addForm">
                <input type="text" class = "prompt-addTask" id="newInputTask" placeholder="Enter text" >
            </form>
            `
            $("#rightTaskList").append(newElement);
            $("#newInputTask").focus();
            fulfilled = true;
            $("#addForm").submit(async (e)=>{
                e.preventDefault();
                let mutatedStr = oldData.date+"/"+oldData.project_keyWord+"/"+oldData.id;
                let privId=1;
                if( mutatedStr in obj.studyBlocks){
                    privId = obj.studyBlocks[mutatedStr]["maxId"];
                }
                let elem = {
                    id: privId+indexAdded,
                    task_id : oldData.id,
                    task_date : oldData.date,
                    project_keyWord : oldData.project_keyWord,
                    requestType : "link",
                    requestLink : $("#newInputTask").val()
                }
                addedArray.push(elem);
                createStorage(elem, $("#rightTaskList"));
                fulfilled = false;
                newElement.remove();
                indexAdded++;
            });
            document.addEventListener("click", (e) => {
                if ($("#addForm")){
                    $(document).mouseup((e) =>{
                        var container = $("#addForm");
    
                        // if the target of the click isn't the container nor a descendant of the container
                        if (!container.is(e.target) && container.has(e.target).length === 0) 
                        {
                            newElement.remove();
                            fulfilled = false; 
                        }
                    });
                }
            });
        }else{
            $("#newInputTask").focus();
        }
    });

    $("#musicInterfere").click((e)=>{
        e.preventDefault();
        if($("#musicInterfere").html()!="NO"){
            $("#musicInterfere").html("NO");
        }else{
            $("#musicInterfere").html("YES");
        }
    });

    addStudyBlock.addEventListener("click", (e)=>{
        if(open == false){
            console.log("here");
            $("#firstWindow").css("display", "flex");
            $("#secondWindow").css("display", "flex");
            $("#thirdWindow").css("display", "flex");
            open = true;
        }else{
            $("#firstWindow").css("display", "none");
            $("#secondWindow").css("display", "none");
            $("#thirdWindow").css("display", "none");
            open = false;
        }
    });

    $("#buttonFirst").click((e)=>{
        e.preventDefault();
        index--;
        if(index<0){
            index=3;
        }
        chooseButtons();
    });

    $("#buttonSecond").click((e)=>{
        e.preventDefault();
    });

    $("#buttonThird").click((e)=>{
        e.preventDefault();
        index++;
        if(index>3){
            index=0;
        }
        chooseButtons();
    });

    addButton.addEventListener("click", async (e)=>{
        console.log("pressed");
        e.preventDefault();
        if (text.value){
            data.date = date.value;
            data.text = text.value;
            if (!startTime.value && !endTime.value){
                if (data.exist == true){
                    data.start = data.start;
                    data.end = data.end;
                }else{
                    data.start = null;
                    data.end = null;
                }
            }else{
                data.start = startTime.value;
                data.end = endTime.value;
            }
            
            if(startTime.value && !endTime.value){
                endTime.focus();
            }else if(endTime.value && !startTime.value){
                startTime.focus();
            }else{
                let time = new Date(data.date);
                let day = (time.getDay()==0)?7:time.getDay();
                let result = true;
                let dateArr = [];
                if(data.exist == false){
                    for(let i=0; i<7; i++){
                        if($("#day"+i).hasClass("active")){
                            let s=(i==0)?7:i;
                            let diff = day-s;
                            let dayTime = new Date(time);
                            dayTime.setDate(dayTime.getDate()-diff);
                            let arr = newTaskHandler_getClosedSlots(dayTime);
                            if(arr != null){
                                result = checkValidity(arr, startTime.value, endTime.value, oldData.start, oldData.end);
                            }
                            dateArr.push(toIsoString(dayTime).slice(0, 10));
                            if(result == false){
                                break;
                            }
                        }
                    }
                }else{
                    let arr = newTaskHandler_getClosedSlots(time);
                    if(arr != null){
                        result = checkValidity(arr, startTime.value, endTime.value, oldData.start, oldData.end);
                    }
                    dateArr.push(toIsoString(time).slice(0, 10));
                }
                if(result){
                    await addFinally(data, dateArr);
                }
            }
        }else{
            // no text, then focus that we need text!!!!
            text.focus();
            startTime.value = "";
            endTime.value = "";
        }
    });
});

function setButtons( date){
    if(oldData.exist == true){
        $("#dayButtons").css("display", "none");
    }else{
        let currentDate = new Date(date);
        for(let i=0; i<7; i++){
            $("#day"+i).removeClass("active");
            $("#day"+i).off("click");
            $("#day"+i).attr("disabled", false);
        }
        for(let i=0; i<7; i++){
            let s=(i==0)?7:i;
            let day = (currentDate.getDay()==0)?7:currentDate.getDay();
            let diff = day-s;
            let dayTime = new Date(currentDate);
            dayTime.setDate(dayTime.getDate()-diff);
            if(i == currentDate.getDay()){
                $("#day"+i).addClass("active");
                $("#day"+i).click((e)=>{
                    e.preventDefault();
                });
            }else if(toIsoString(dayTime).slice(0, 10)< toIsoString(realToday).slice(0, 10)){
                $("#day"+i).attr("disabled", true);
            }else{
                $("#day"+i).click((e)=>{
                    e.preventDefault();
                    if($("#day"+i).hasClass("active")){
                        $("#day"+i).removeClass("active");
                    }else{
                        $("#day"+i).addClass("active");
                    }
                });
            }
        }
    }
}

function returnTime(time){
    let string = time[0]+time[1];
    let string2 = time[3]+time[4]
    let result = (parseInt(string)*60)+parseInt(string2);
    return result;
}


function checkIfClosed(string, start, end, oldBegin, oldEnd){
    let time1 = string.substring(0, 5);
    let time2 = string.substring(6, 11);
    let closedSlotStart = returnTime(time1);
    let closedSlotEnd = returnTime(time2);
    if(oldBegin!= null){
        let unclosedStart = returnTime(oldBegin);
        let unclosedEnd = returnTime(oldEnd);
        if(closedSlotStart == unclosedStart && closedSlotEnd == unclosedEnd){
            return false;
        }
    }
    if(start>=closedSlotStart && start<closedSlotEnd){
        return true;
    }
    if(end>closedSlotStart && end<=closedSlotEnd){
        console.log("yes");
        return true;
    }
    if(start<closedSlotStart && end>closedSlotEnd){
        console.log("here");
        return true;
    }
    return false;
}

function checkValidity(arr, begin, end, oldBegin, oldEnd){
    let start = obj.userSettings.scheduleStart*60;
    let finish = obj.userSettings.scheduleEnd*60;
    let beginM = returnTime(begin);
    let endM = returnTime(end);
    if(beginM<start || beginM>(finish-20)){
        return false;
    }
    if(endM<start+20 || endM>finish){
        return false;
    }
    if(endM-beginM<20){
        return false;
    }
    for(let i=0; i<arr.length; i++){
        console.log(arr[i]);
        let result = checkIfClosed(arr[i], beginM, endM, oldBegin, oldEnd);
        if(result){
            return false;
        }
    }
    return true;
}

async function addFinally(data, dateArr){
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

    if($("#musicInterfere").html()!="NO"){
        data.music = true;
    }else{
        data.music = false;
    }
    if(data.contains == false){
        let mutatedStr = oldData.date+"/"+oldData.project_keyWord+"/"+oldData.id;
        let privId=1;
        if( mutatedStr in obj.studyBlocks){
            privId = obj.studyBlocks[mutatedStr]["maxId"];
        }
        let elem = {
            id: privId+indexAdded,
            task_id : oldData.id,
            task_date : oldData.date,
            project_keyWord : oldData.project_keyWord,
            requestType : "tool",
            requestLink : arr[index]
        }
        if(addedArray.length > deletedArray.length){
            data.contains = true;
        }
        addedArray.push(elem);
    }
    console.log(data.contains);
    let task ={
        id : data.id,
        date :  data.date,
        project_keyWord : data.project_keyWord,
        text: data.text,
        start: data.start,
        end: data.end,
        stage: data.stage,
        contains: data.contains,
        mutations: data.mutations,
        music: data.music,
        innerBound: 0,
        outerBound: 0,
    }
    let info;
    let studyBlocks = null;
    if(task.contains == true){
        studyBlocks ={
            ms: oldData.date+"/"+oldData.project_keyWord+"/"+oldData.id,
            nB : addedArray,
            oB : deletedArray
        }
    }
    console.log(task.contains);

    if (data.exist == false){
        let tasksArray = [];
        let mutatedStr = null;
        let mutated = false;
        if(dateArr.length>1){
            mutated = true;
        }
        for(let i=0; i<dateArr.length; i++){
            task.date = dateArr[i];
            let dateOfTask = new Date(dateArr[i]);
            task.id = newTaskHandler_getMaxId(dateOfTask, task.project_keyWord);
            if(mutated == true){
                if(mutatedStr==null){
                    mutatedStr = task.date+"/"+task.project_keyWord+"/"+task.id
                }
                task.mutations = mutatedStr;
            }
            console.log(task);
            let createdTask = await request_addTask(data.user_email, task);
            tasksArray.push(createdTask);
        }
        info = {
            updated: true,
            tool:data.tool,
            //result: {newOne : true, index: data.index, found : data.found, task: task, color : data.color}
            result: {newOne : true,  task: tasksArray, sB: studyBlocks}
        }
    }else if (data.exist == true && data.ended == false){
        if(data.date != oldData.date){
            let dateOfTask = new Date(data.date);
            task.id = newTaskHandler_getMaxId(dateOfTask, task.project_keyWord);
            let changable ={
                prevDate: oldData.date,
                prevId: oldData.id,
                project_keyWord: oldData.project_keyWord,
                nextDate: data.date,
                nextId: task.id
            }
            await request_updateallStudyBlocks(data.user_email, changable);
            let oldTask = await request_deleteSomeElement(`deleteTask/${data.user_email}/${oldData.date}/${oldData.project_keyWord}/${oldData.id}`);
            let newTask = await request_addTask(obj.user.email, task);
            info = {
                updated: true,
                tool:data.tool,
                result: {newOne : false, newTask: newTask, oldTask: oldTask, deleted : true, sB: studyBlocks}
            }
        }else{
            await request_updateTask(data.user_email, task);
            info = {
                updated: true,
                tool:data.tool,
                result: {newOne : false, newTask: task, oldTask: oldData, deleted : false, sB:studyBlocks}
            }
        }
    }else{
        info = {
            updated: false,
            tool:data.tool,
            result: null
        }
    }

    if(task.contains){

        let mutatedStr = oldData.date+"/"+oldData.project_keyWord+"/"+oldData.id;
        let mutated = null;
        if(task.mutations != null){
            let mineArr = task.mutations.split("/");
            mutated = mineArr[0]+"--"+mineArr[1]+"--"+mineArr[2];
        }
        if((mutatedStr in obj.studyBlocks) && (obj.studyBlocks[mutatedStr]["tool"].length>0)){
            let url = `${data.user_email}/${task.date}/${task.project_keyWord}/${task.id}/${obj.studyBlocks[mutatedStr]["tool"][0].id}/${mutated}`;
            await request_removeStudyBlockElem( url);
            let mutatedStrN = oldData.date+"/"+oldData.project_keyWord+"/"+oldData.id;
            console.log(oldData.id);
            let elem = {
                id: obj.studyBlocks[mutatedStrN]["maxId"]+indexAdded,
                task_id : task.id,
                task_date : task.date,
                project_keyWord : oldData.project_keyWord,
                requestType : "tool",
                requestLink : arr[index]
            }
            addedArray.push(elem);
        }
        console.log("I was here");
        for(let i=0; i<addedArray.length; i++){
            console.log("Ans was here");
            addedArray[i]["mutation"] =task.mutations;
            addedArray[i]["task_date"] =task.date;
            addedArray[i]["task_id"] =task.id;
            await request_addStudyBlockElems( data.user_email, addedArray[i]);
        }
        for(let i=0; i<deletedArray.length; i++){
            let url = `${data.user_email}/${deletedArray[i].task_date}/${deletedArray[i].project_keyWord}/${deletedArray[i].task_id}/${deletedArray[i].id}/${mutated}`;
            await request_removeStudyBlockElem( url);
        }
    }

    
    ipcRenderer.send("taskItselfAdded", info);
}

closeBtn.addEventListener("click", ()=>{
    const obj = {
        updated: false,
        result: null
    }
    ipcRenderer.send("taskItselfAdded", obj);
})
