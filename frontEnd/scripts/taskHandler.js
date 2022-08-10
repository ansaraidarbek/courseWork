import obj from "./file.js";
const electron = require('electron');
const { ipcRenderer } = electron;


/*
    {
        currentIndex : index from which valid months strats
        arrayLength : the length of data array
        data:
            [
                {
                    date: "year/month"
                    dayArray:
                        [
                            {
                                number : "day"
                                closedSlots : 
                                    [
                                        "hh:mm-hh:mm"
                                        ...
                                    ]
                                dayTasks: 
                                    {
                                        info : 
                                            [
                                                {
                                                    maxId: int
                                                    color: int
                                                    project: "project_keyWord"
                                                }
                                                ...
                                            ],
                                        tasks: 
                                            [
                                                [
                                                    {
                                                        date : "yyyy-mm-dd"
                                                        end : "hh-mm" or null
                                                        id : int
                                                        project_keyWord: "project_keyWord"
                                                        stage : float
                                                        start : "hh-mm" or null
                                                        text : "textString"

                                                    }
                                                    ...
                                                ],
                                                [
                                                    {
                                                        date : "yyyy-mm-dd"
                                                        end : "hh-mm" or null
                                                        id : int
                                                        project_keyWord: "project_keyWord"
                                                        stage : float
                                                        start : "hh-mm" or null
                                                        text : "textString"

                                                    }
                                                    ...
                                                ],
                                                [
                                                    {
                                                        date : "yyyy-mm-dd"
                                                        end : "hh-mm" or null
                                                        id : int
                                                        project_keyWord: "project_keyWord"
                                                        stage : float
                                                        start : "hh-mm" or null
                                                        text : "textString"

                                                    }
                                                    ...
                                                ],
                                            ]
                                        taskCounter: int
                                    }
                            }
                            ...
                        ]
                }
                ...
            ]
    }
*/

function binarySearch(arr, l, r, x){
    let data = {
        exist : false,
        index : null
    }
    if(arr.length == 0){
        data.index = 0;
        return data;
    }
    if (r >= l) {
        let mid = l + Math.floor((r - l) / 2);
        if (arr[mid].date == x){
            data.exist = true;
            data.index = mid;
            return data;
        }
 
        if (arr[mid].date > x)
            return binarySearch(arr, l, mid - 1, x);
 
        return binarySearch(arr, mid + 1, r, x);
    }
    data.index = l;
    return data;
}

function toMinute(str){
    let string = str[0] + str[1] + str[2] + str[3] + str[4];
    return string;
}

function convertToValidYearMonth(date){
    let year = date.getFullYear();
    let month = date.getMonth();
    let trueMonth = month + 1;
    let stringTrueMonth = trueMonth.toString();
    if(trueMonth < 10){
        stringTrueMonth = 0 + stringTrueMonth;
    }
    let string = year+"/"+stringTrueMonth;
    return string;
}

function convertStringToValidYearMonth(date){
    let string = date[0]+date[1]+date[2]+date[3]+"/"+date[5]+date[6];
    return string;
}

function convertStringToDay(date){
    let string = date[8]+date[9];
    return parseInt(string);
}

export function taskHandler_getOneDayTasks(today, info, yearMonth){
    let data = null;
    if (info.exist){
        if(obj.userTasks.data[info.index] && obj.userTasks.data[info.index].date == yearMonth){
            obj.userTasks.data[info.index].dayArray.forEach(day => {
                if(day.number == today.getDate()){
                    data = day.dayTasks
                }
            });
        }
    }
    return data;

}

export function taskHandler_getTasks( start, days){
    const data = [];
    const yesterdayYearMonth = convertToValidYearMonth(start);
    const existInYearMonth = binarySearch(obj.userTasks.data, 0, obj.userTasks.arrayLength-1, yesterdayYearMonth);
    const first =  taskHandler_getOneDayTasks(start, existInYearMonth, yesterdayYearMonth);
    data.push(first);
    let month = start.getMonth();
    for(let i=0; i< days; i++){
        start = new Date(start);
        start.setDate(start.getDate()+1);
        const newYearMonth = convertToValidYearMonth(start);
        if( month== start.getMonth()){
            let next = taskHandler_getOneDayTasks(start, existInYearMonth, newYearMonth);
            data.push(next);
        }else{
            if(existInYearMonth.exist){
                existInYearMonth.index++;
            }
            let next = taskHandler_getOneDayTasks(start, existInYearMonth, newYearMonth);
            data.push(next);
            month = start.getMonth();
        }
    }
    console.log(data);
    return data;
}

export function taskHandler_findNewTasksMaxIdAndIndex(date, project){
    const dateYearMonth = convertToValidYearMonth(date);
    console.log(obj.userTasks.data.length-1);
    const existInYearMonth = binarySearch(obj.userTasks.data, obj.userTasks.currentIndex, obj.userTasks.arrayLength-1, dateYearMonth);
    if(existInYearMonth.exist){
        console.log("TH_FindTask/found in year month array");
        for(let i = 0; i<obj.userTasks.data[existInYearMonth.index].dayArray.length; i++){
            if(obj.userTasks.data[existInYearMonth.index].dayArray[i].number == date.getDate()){
                console.log("TH_FindTask/found in day array");
                for(let j = 0; j< obj.userTasks.data[existInYearMonth.index].dayArray[i].dayTasks.info.length; j++){
                    if(obj.userTasks.data[existInYearMonth.index].dayArray[i].dayTasks.info[j].project == project){
                        const maxId = obj.userTasks.data[existInYearMonth.index].dayArray[i].dayTasks.info[j].maxId;
                        return {id:maxId, index:existInYearMonth.index, found : true};
                    }
                }
            }
        }
        console.log("TH_FindTask/have not found in day array");
        return {id:1, index:existInYearMonth.index, found : true};

    }else{
        console.log("TH_FindTask/have not found in year month array");
        if(obj.userTasks.data.length != 0){
            if(obj.userTasks.data[existInYearMonth.index] && obj.userTasks.data[existInYearMonth.index].date < taskYearMonth){
                console.log("TH_FindTask/to the right of day");
                return {id : 1, index : existInYearMonth.index+1, found : false};
            }else if(obj.userTasks.data[existInYearMonth.index] && obj.userTasks.data[existInYearMonth.index].date > taskYearMonth){
                console.log("TH_FindTask/to the left of day");
                return {id : 1, index : existInYearMonth.index, found : false};
            }else if(!obj.userTasks.data[existInYearMonth.index] && obj.userTasks.data[existInYearMonth.index-1].date < taskYearMonth){
                console.log("TH_FindTask/to the right of last day");
                return {id : 1, index : existInYearMonth.index, found : false};
            }else{
                console.log("TH_FindTask/to the left of last day");
                return {id : 1, index : existInYearMonth.index-1, found : false};
            }
        }else{
            console.log("TH_FindTask/no tasks created ever");
            return {id : 1, index : 0, found : false};
        }
    }
}

export function taskHandler_addTask(task, index, found, color){
    const day = convertStringToDay(task.date);
    if(task.start != null){
        task.start = task.start.substring(0, 5);
        task.end = task.end.substring(0, 5);
    }
    let closedSlot = task.start+"-"+task.end;
    if (found){
        console.log("TH_AddTask/found in year month array");
        let added = false;
        for(let i = 0; i<obj.userTasks.data[index].dayArray.length; i++){
            if(obj.userTasks.data[index].dayArray[i].number == day){
                console.log("TH_AddTask/found in day array");
                added = true;
                if(task.start != null){
                    obj.userTasks.data[index].dayArray[i].closedSlots.push(closedSlot);
                }
                let added2 = false;
                for(let j = 0; j< obj.userTasks.data[index].dayArray[i].dayTasks.info.length; j++){
                    if(obj.userTasks.data[index].dayArray[i].dayTasks.info[j].project == task.project_keyWord){
                        added2= true;
                        obj.userTasks.data[index].dayArray[i].dayTasks.info[j].maxId++;
                    }
                }
                if(added2 == false){
                    const newTaskData = {
                        maxId : 2,
                        project : task.project_keyWord,
                        projectColor : color
                    }
                    obj.userTasks.data[index].dayArray[i].dayTasks.info.push(newTaskData);
                }
                obj.userTasks.data[index].dayArray[i].dayTasks.taskCounter++;
                obj.userTasks.data[index].dayArray[i].dayTasks.tasks[2].push(task);
            }
        }
        if(added == false){
            console.log("TH_AddTask/have not found in day array");
            const closedSlots = []
            if(task.start != null){
                closedSlots.push(closedSlot);
            }
            const newDay = {
                number : day,
                closedSlots : closedSlots,
                dayTasks : {
                    info : [{maxId : 2, project : task.project_keyWord, projectColor: color}],
                    taskCounter : 1,
                    tasks : [[],[],[task]]
                }
            }
            obj.userTasks.data[index].dayArray.push(newDay);  
        }

    }else{
        console.log("TH_AddTask/have not found in year month array");
        obj.userTasks.arrayLength++;
        const closedSlots = []
        if(task.start != null){
            closedSlots.push(closedSlot);
        }
        const newData = {
            date: taskYearMonth,
            dayArray : [{
                number : day,
                closedSlots: closedSlots,
                dayTasks : {
                    info : [{maxId : 2, project : task.project_keyWord, projectColor: color}],
                    taskCounter : 1,
                    tasks : [[],[],[task]]
                }
            }]
        }
        obj.userTasks.data.splice(index, 0, newData);
    }
    obj.setInstance(obj.getInstance()); 
}

export function taskHandler_updateStage(task){
    const taskYearMonth = convertStringToValidYearMonth(task.date);
    const day = convertStringToDay(task.date);
    const existInYearMonth = binarySearch(obj.userTasks.data, obj.userTasks.currentIndex, obj.userTasks.arrayLength-1, taskYearMonth);
    if(existInYearMonth.exist){
        let deleted = false;
        for(let i = 0; i<obj.userTasks.data[existInYearMonth.index].dayArray.length; i++){
            if(obj.userTasks.data[existInYearMonth.index].dayArray[i].number == day){
                deleted = true;
                let position = (task.stage+2)%3;
                let num = (position == 0)?2:0;
                let updated = position/2;
                if(position == 1){
                    console.log("unsoported yet");
                }
                let index = obj.userTasks.data[existInYearMonth.index].dayArray[i].dayTasks.tasks[position].indexOf(task);
                if(index > -1){
                    obj.userTasks.data[existInYearMonth.index].dayArray[i].dayTasks.tasks[position].splice(index, 1);
                }
                task.stage = updated;
                obj.userTasks.data[existInYearMonth.index].dayArray[i].dayTasks.tasks[num].push(task);
            }
        }
        if(deleted == false){
            console.log("TH_UpdateStage/have not found in day array");
        }
        obj.setInstance(obj.getInstance());
    }else{
        console.log("how it is possible?");
    }
}

export function taskHandler_deleteTask(task){
    const taskYearMonth = convertStringToValidYearMonth(task.date);
    const day = convertStringToDay(task.date);
    const existInYearMonth = binarySearch(obj.userTasks.data, obj.userTasks.currentIndex, obj.userTasks.arrayLength-1, taskYearMonth);
    if(existInYearMonth.exist){
        console.log("TH_DeleteTask/found in year month array");
        let deleted = false;
        for(let i = 0; i<obj.userTasks.data[existInYearMonth.index].dayArray.length; i++){
            if(obj.userTasks.data[existInYearMonth.index].dayArray[i].number == day){
                deleted = true;
                console.log("TH_DeleteTask/found in day array");
                if(task.start != null){
                    let startMinute = toMinute(task.start)
                    let endMinute = toMinute(task.end)
                    let closedSlot = startMinute+"-"+endMinute;
                    let index = obj.userTasks.data[existInYearMonth.index].dayArray[i].closedSlots.indexOf(closedSlot);
                    console.log(closedSlot);
                    console.log(index);
                    if(index>-1){
                        obj.userTasks.data[existInYearMonth.index].dayArray[i].closedSlots.splice(index, 1);
                    }
                }
                for(let j=0; j<obj.userTasks.data[existInYearMonth.index].dayArray[i].dayTasks.info.length; j++){
                    if(obj.userTasks.data[existInYearMonth.index].dayArray[i].dayTasks.info[j].project == task.project_keyWord){
                        obj.userTasks.data[existInYearMonth.index].dayArray[i].dayTasks.info[j].maxId--;
                        break;
                    }
                }
                let position = (task.stage+2)%3;
                if(position == 1){
                    console.log("unsoported yet");
                }
                let index;
                for (let j=0; j< obj.userTasks.data[existInYearMonth.index].dayArray[i].dayTasks.tasks[position].length; j++){
                    if(obj.userTasks.data[existInYearMonth.index].dayArray[i].dayTasks.tasks[position][j].project_keyWord == task.project_keyWord && obj.userTasks.data[existInYearMonth.index].dayArray[i].dayTasks.tasks[position][j].id == task.id){
                        index = j;
                    }
                }
                obj.userTasks.data[existInYearMonth.index].dayArray[i].dayTasks.tasks[position].splice(index, 1);
                for(let j=0;j<obj.userTasks.data[existInYearMonth.index].dayArray[i].dayTasks.tasks[position].length; j++){
                    if(obj.userTasks.data[existInYearMonth.index].dayArray[i].dayTasks.tasks[position][j].project_keyWord == task.project_keyWord && obj.userTasks.data[existInYearMonth.index].dayArray[i].dayTasks.tasks[position][j].id > task.id){
                        obj.userTasks.data[existInYearMonth.index].dayArray[i].dayTasks.tasks[position][j].id--;
                    }
                }
                obj.userTasks.data[existInYearMonth.index].dayArray[i].dayTasks.taskCounter--;
            }
        }
        if(deleted == false){
            console.log("TH_DeleteTask/have not found in day array");
        }
        obj.setInstance(obj.getInstance());
    }else{
        console.log("how it is possible?");
    }
}

export function taskHandler_getClosedSlots(day){
    const yesterdayYearMonth = convertToValidYearMonth(day);
    const existInYearMonth = binarySearch(obj.userTasks.data, obj.userTasks.currentIndex, obj.userTasks.arrayLength-1, yesterdayYearMonth);
    let data = null;
    if(existInYearMonth.exist){
        for (let i =0; i<obj.userTasks.data[existInYearMonth.index].dayArray.length; i++){
            if(obj.userTasks.data[existInYearMonth.index].dayArray[i].number == day.getDate()){
                data = obj.userTasks.data[existInYearMonth.index].dayArray[i].closedSlots;
            }
        }
    }
    return data;
}
