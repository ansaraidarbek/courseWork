import obj from "./file.js";
const electron = require('electron');
const { ipcRenderer } = electron;


/*  
    {
        date :  
                {
                    projectKeyword : {color : int , maxId : int},
                    tasks: [ 0:[tasks], 1:[tasks], 2:[tasks] ]
                    closedSlots: [] 
                }
    }
*/

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

export function newTaskHandler_getOneDayTasks(date){
    let data = null;
    const key = toIsoString(date).slice(0, 10);
    if( key in obj.userNewTasks){
        data = obj.userNewTasks[key];
    }
    return data;
}

export function newTaskHandler_getTasks( start, days){
    const data = [];
    for(let i=0; i< days; i++){
        const first =  newTaskHandler_getOneDayTasks(start);
        data.push(first);
        start = new Date(start);
        start.setDate(start.getDate()+1);
    }
    console.log(data);
    return data;
}

export function newTaskHandler_getMaxId( date, pKeyWord){
    let id = 1;
    const key = toIsoString(date).slice(0, 10);
    if( key in obj.userNewTasks){
        const data = obj.userNewTasks[key];
        if(pKeyWord in data){
            id = data[pKeyWord];
        }
    }
    return id;
}


export function newTaskHandler_getClosedSlots(date){
    const key = toIsoString(date).slice(0, 10);
    if(key in obj.userNewTasks && "closedSlots" in obj.userNewTasks[key])
        return obj.userNewTasks[key]["closedSlots"]
    return null;
}


export function newTaskHandler_manageBlocks( changed, sB){
    let arr = sB.ms.split("/");
    let mutations = null;
    if(arr[0] in obj.userNewTasks){
        for(let i=0; i<3; i++){
            obj.userNewTasks[arr[0]].tasks[i].forEach(task =>{
                if(task.date == arr[0] && task.project_keyWord == arr[1] && task.id == arr[2]){
                    mutations = task.mutations;
                }
            });
            if(mutations!=null){
                break;
            }
        }
    }else{
        console.log("not possible to create for non-existent task")
    }
    let tasks=[];
    if(mutations != null){
        tasks = Object.values(obj.taskMutations[mutations]);
    }else{
        tasks.push(arr);
    }
    tasks.forEach(task =>{
        sB.nB.forEach(block =>{
            block.task_date = task[0];
            block.task_id = task[2];
            let anotherString = block.task_date+"/"+block.project_keyWord+"/"+block.task_id;
            if(!(anotherString in obj.studyBlocks)){
                obj.studyBlocks[anotherString] = {
                    "tool" : [],
                    "file" : [],
                    "link" : [],
                    "maxId" : 1
                };
            }
            if(block.requestType == "tool"){
                if(obj.studyBlocks[anotherString][block.requestType].length>0){
                    obj.studyBlocks[anotherString][block.requestType].splice(0, 1);
                }
            }
            obj.studyBlocks[anotherString][block.requestType].push(block);
            obj.studyBlocks[anotherString].maxId = Math.max(obj.studyBlocks[anotherString].maxId, block.id)+1
        });
        sB.oB.forEach(block =>{
            block.task_date = task[0];
            block.task_id = task[2];
            let anotherString = block.task_date+"/"+block.project_keyWord+"/"+block.task_id;
            for (let i=0; i<obj.studyBlocks[anotherString][block.requestType].length; i++){
                if(block.id == obj.studyBlocks[anotherString][block.requestType][i].id){
                    obj.studyBlocks[anotherString][block.requestType].splice(i, 1);
                    break;
                }
            }
        })
    });
    if (changed != null){
        let anotherString = changed.prevDate+"/"+changed.project_keyWord+"/"+changed.prevId;
        let newString = changed.nextDate+"/"+changed.project_keyWord+"/"+changed.nextId;
        obj.studyBlocks[anotherString]["tool"].forEach(t =>{
            t.task_date = changed.nextDate;
            t.task_id = changed.nextId;
        });
        obj.studyBlocks[anotherString]["file"].forEach(t =>{
            t.task_date = changed.nextDate;
            t.task_id = changed.nextId;
        });
        obj.studyBlocks[anotherString]["link"].forEach(t =>{
            t.task_date = changed.nextDate;
            t.task_id = changed.nextId;
        });
        obj.studyBlocks[newString] = obj.studyBlocks[anotherString];
        delete obj.studyBlocks[anotherString];
    }
    obj.setInstance(obj.getInstance());

}

export function newTaskHandler_addTask( tasks){
    tasks.forEach(task =>{
        console.log(task);
        let closedSlot;
        if(task.start != null){
            task.start = task.start.substring(0, 5);
            task.end = task.end.substring(0, 5);
            closedSlot = task.start+"-"+task.end;
        }
        if( task.date in obj.userNewTasks){
            if(task.project_keyWord in obj.userNewTasks[task.date]){
                const newMaxId = obj.userNewTasks[task.date][task.project_keyWord] + 1;
                obj.userNewTasks[task.date][task.project_keyWord] =  newMaxId ;
            }else{
                obj.userNewTasks[task.date][task.project_keyWord] =  2;
            }
            obj.userNewTasks[task.date]["tasks"][0].push(task);
            if(closedSlot){
                obj.userNewTasks[task.date]["closedSlots"].push(closedSlot);
            }
        }else{
            let taskBlock = {};
            taskBlock[task.project_keyWord] =  2;
            taskBlock["tasks"] = [[task], [], []];
            taskBlock["closedSlots"] = [];
            if(closedSlot){
                taskBlock["closedSlots"].push(closedSlot);
            }
            obj.userNewTasks[task.date] = taskBlock;
        }
        if(task.mutations != null){
            if(!(task.mutations in obj.taskMutations)){
                obj.taskMutations[task.mutations] = {};
            }
            let anotherString = task.date+"/"+task.project_keyWord+"/"+task.id
            obj.taskMutations[task.mutations][anotherString] = {"date":task.date, "project_keyWord":task.project_keyWord, "id":task.id};
        }
    });
    obj.setInstance(obj.getInstance()); 
}

export function newTaskHandler_updateTask(newTask, oldTask){
    let prev; 
    if(Number.isInteger(oldTask.stage)){
        prev = oldTask.stage; 
    }else{
        prev = 2;
    }
    let newOne; 
    if(Number.isInteger(newTask.stage)){
        newOne = newTask.stage; 
    }else{
        newOne = 2;
    }
    for(let i =0; i< obj.userNewTasks[oldTask.date]["tasks"][prev].length; i++){
        if(obj.userNewTasks[oldTask.date]["tasks"][prev][i].id == oldTask.id && obj.userNewTasks[oldTask.date]["tasks"][prev][i].project_keyWord == oldTask.project_keyWord){
            if(newOne!=prev){
                obj.userNewTasks[oldTask.date]["tasks"][prev][i].splice(0, 1);
            }else{
                obj.userNewTasks[oldTask.date]["tasks"][prev][i] = newTask;
            }
            break;
        }
    }
    if(newOne!=prev){
        obj.userNewTasks[oldTask.date]["tasks"][newOne].push(newTask);
    }  
    obj.setInstance(obj.getInstance());

}


export function newTaskHandler_updateStage(task, choice){
    let current; 
    if(Number.isInteger(task.stage)){
        current = task.stage; 
    }else{
        current = 2;
    }
    const index = obj.userNewTasks[task.date]["tasks"][current].indexOf(task);
    if(index > -1){
        obj.userNewTasks[task.date]["tasks"][current].splice(index, 1);
    }
    task.stage = choice;
    if(Number.isInteger(task.stage)){
        obj.userNewTasks[task.date]["tasks"][choice].push(task);
    }else{
        obj.userNewTasks[task.date]["tasks"][2].push(task);
    }
    obj.setInstance(obj.getInstance());
}

export function newTaskHandler_deleteTask(tasks){
    console.log(tasks);
    tasks.forEach(task =>{
        let taskName = task.date+"/"+task.project_keyWord+"/"+task.id;
        if(taskName in obj.studyBlocks){
            delete obj.studyBlocks[taskName];
        }
        obj.userNewTasks[task.date][task.project_keyWord]--;
        let position;
        if(Number.isInteger(task.stage)){
            position = task.stage;
        }else{
            position = 2;
        }
        for(let j=0;j<obj.userNewTasks[task.date]["tasks"][position].length; j++){
            if(obj.userNewTasks[task.date]["tasks"][position][j].project_keyWord == task.project_keyWord && obj.userNewTasks[task.date]["tasks"][position][j].id == task.id){
                obj.userNewTasks[task.date]["tasks"][position].splice(j, 1);
            }
        }
        for(let j=0;j<obj.userNewTasks[task.date]["tasks"][position].length; j++){
            if(obj.userNewTasks[task.date]["tasks"][position][j].project_keyWord == task.project_keyWord && obj.userNewTasks[task.date]["tasks"][position][j].id > task.id){
                obj.userNewTasks[task.date]["tasks"][position][j].id--;
            }
        }
        if(task.start != null){
            task.start = task.start.substring(0, 5);
            task.end = task.end.substring(0, 5);
            const closedSlot = task.start+"-"+task.end;
            const index2 = obj.userNewTasks[task.date]["closedSlots"].indexOf(closedSlot);
            if(index2>-1){
                obj.userNewTasks[task.date]["closedSlots"].splice(index2, 1);
            }
        }
        if(task.mutations != null){
            let newString = task.date+"/"+task.project_keyWord+"/"+task.id
            delete obj.taskMutations[task.mutations][newString];
        }
    });
    obj.setInstance(obj.getInstance());
}

