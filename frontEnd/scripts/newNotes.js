import {request_updateSettingsLastNotes} from './requests.js';
import obj from "./file.js";
const electron = require('electron');
const { ipcRenderer } = electron;
const fs = require('fs');
const remote = require("@electron/remote");
const path = require('path');

export function newNotes_addNote(note){
    if(note.path in obj.userNotes["path"]){
        obj.userNotes["path"][note.path][note.id] = {"data" : note, "children":[]}
    }else{
        obj.userNotes["path"][note.path] = {}
        obj.userNotes["path"][note.path][note.id] = {"data" : note, "children":[]}
    }
    let pathLength = note.path.length;
    if(pathLength>2){
        let newPath = note.path.substring(0,pathLength-2);
        let parentId = parseInt(note.path.substring(pathLength-2,pathLength-1));
        obj.userNotes["path"][newPath][parentId]["children"].push({"path":note.path, "id" : note.id, "title":note.title});
    }
    obj.setInstance(obj.getInstance());
}

export function newNotes_updateNote(note){
    if(note.title != obj.userNotes["path"][note.path][note.id]["data"].title && note.path.length>2){
        let oldPath = note.path.substring(0, note.path.length-2);
        let parentId = note.path.substring(note.path.length-2, note.path.length-1)
        for(let i =0 ;i<obj.userNotes["path"][oldPath][parentId]["children"].length; i++){
            if(obj.userNotes["path"][oldPath][parentId]["children"][i].id == note.id){
                obj.userNotes["path"][oldPath][parentId]["children"][i].title = note.title;
            }
        }
    }
    obj.userNotes["path"][note.path][note.id]["data"].title = note.title;
    obj.userNotes["path"][note.path][note.id]["data"].text = note.text;
    obj.userNotes["path"][note.path][note.id]["data"].project_keyWord = note.project_keyWord;
    obj.userNotes["path"][note.path][note.id]["data"].pictures = note.pictures;
    obj.userNotes["path"][note.path][note.id]["data"].videos = note.videos;
    obj.userNotes["path"][note.path][note.id]["data"].audios = note.audios;

    obj.setInstance(obj.getInstance());
}

export function newNotes_deleteNote(note){
    console.log(note);
    let sizeOfPath = note.path.length
    if(sizeOfPath >2){
        let newPath = note.path.substring(0, sizeOfPath-2);
        let parentId = parseInt(note.path.substring(sizeOfPath-2, sizeOfPath-1));
        for(let i =0; i< obj.userNotes["path"][newPath][parentId]["children"].length; i++){
            if(obj.userNotes["path"][newPath][parentId]["children"][i].id == note.id){
                obj.userNotes["path"][newPath][parentId]["children"].splice(i, 1);
                i--;
            }else if(obj.userNotes["path"][newPath][parentId]["children"][i].id > note.id){
                console.log("hello");
                obj.userNotes["path"][newPath][parentId]["children"][i].id--;
            }
        }
    }
    newNotes_deleteAllNotes(note);
    newNotes_changeOtherIds(note);
    newNotes_changeOtherPaths(note);
    newNotes_deleteFiles(note.path, note.id);
    newNotes_checkPath(note);

    obj.setInstance(obj.getInstance());
}

function incrementHex(value){
    if(value < 'ffffff'){
        let num = parseInt(value, 16);
        num++;
        let newNum = num.toString(16);
        let zeroString = '';
        for(let i =0; i<6-newNum.length; i++){
            zeroString+='0';
        }
        console.log(zeroString+newNum);
        return zeroString+newNum
    }
}

export function newNotes_incrementPhoto(note){
    let newValue = incrementHex(note.pictures);
    obj.userNotes["path"][note.path][note.id]["data"].pictures = newValue;
    obj.setInstance(obj.getInstance());
}

export function newNotes_incrementVideo(number){

    obj.setInstance(obj.getInstance());
}

export function newNotes_incrementAudio(note){
    let newValue = incrementHex(note.audios);
    obj.userNotes["path"][note.path][note.id]["data"].audios = newValue;
    obj.setInstance(obj.getInstance());
}

function newNotes_deleteAllNotes(note){
    let children = obj.userNotes["path"][note.path][note.id]["children"];
    children.forEach(child => {
        newNotes_deleteAllNotes(child);
    });
    delete obj.userNotes["path"][note.path][note.id];
}

function newNotes_changeOtherIds(note){
    let children = Object.keys(obj.userNotes["path"][note.path])
    children.forEach(child =>{
        if ( child > note.id){
            let newId = parseInt(child)-1;
            obj.userNotes["path"][note.path][newId] = obj.userNotes["path"][note.path][child] 
            obj.userNotes["path"][note.path][newId]["data"].id = newId;
            let level = note.path.length + 2 ;
            for(let i =0; i< obj.userNotes["path"][note.path][newId]["children"].length; i++){
                let oldPath = obj.userNotes["path"][note.path][newId]["children"][i].path;
                let num = parseInt(oldPath[level-2])-1;
                console.log(num);
                let newPath = oldPath.substring(0, level-2) + num + oldPath.substring( level-1, oldPath.length);
                console.log(oldPath);
                console.log(oldPath.substring(0, level-2));
                console.log(oldPath.substring( level-1, oldPath.length));
                console.log(newPath);
                obj.userNotes["path"][note.path][newId]["children"][i].path = newPath;
            }
            delete obj.userNotes["path"][note.path][child] 
        }
    });
}

function newNotes_changeOtherPaths(note){
    let fullPath = note.path + note.id + '-';
    let level = fullPath.length;
    let children = Object.keys(obj.userNotes["path"])
    children.forEach(child =>{
        if (child.length >= level && child[level-2]>note.id.toString()){
            let num = parseInt(child[level-2])-1;
            let newPath = child.substring(0, level-2) + num + child.substring( level-1, child.length)
            obj.userNotes["path"][newPath] = obj.userNotes["path"][child]
            delete obj.userNotes["path"][child]
        }
    });
}

function newNotes_deleteFiles(shortPath, id){
    const dataPath = remote.app.getPath("userData");
    let filePath = path.join(dataPath, "local");
    let length = shortPath.length;
    let string;
    for(let i =1; i<length; i+=2){
        string = shortPath.substring(i-1, i+1);
        filePath = path.join(filePath, string);
    }
    let realFinalPath = path.join(filePath, `${id}-`);
    fs.rmSync(realFinalPath, { recursive: true, force: true });
    let inners = fs.readdirSync(filePath);
    const filteredInners = inners.filter(word => word.length < 3);
    for(let i=0; i<filteredInners.length ; i++){
        let name = parseInt(filteredInners[i].substring(0, 1));
        if (name> id){
            let anotherName = name-1;
            let oldPath = path.join(filePath, `${name}-`);
            let newPath = path.join(filePath, `${anotherName}-`);
            fs.renameSync(oldPath, newPath)
        }
    }
}

export function newNotes_updateLast(note){
    let finalPath = note.path+note.id+"-";
    if(obj.userProjects[note.project_keyWord].lastOneSecond != finalPath){
        if(note.project_keyWord != "A"){
            obj.userProjects[note.project_keyWord].lastOneFirst = obj.userProjects[note.project_keyWord].lastOneSecond;
            obj.userProjects[note.project_keyWord].lastOneSecond = finalPath;
        }
        obj.userProjects["A"].lastOneFirst = obj.userProjects["A"].lastOneSecond;
        obj.userProjects["A"].lastOneSecond = finalPath;
        obj.setInstance(obj.getInstance());
    }
}

function newNotes_checkPath(note){
    if(note.project_keyWord!="A"){
        checkWell(note, note.project_keyWord, "lastOneFirst");
        checkWell(note, note.project_keyWord, "lastOneSecond");
    }
    checkWell(note, "A", "lastOneFirst");
    checkWell(note, "A", "lastOneSecond");
    
}

function checkWell(note, keyWord, key){
    let tryOne = checkNote(obj.userProjects[keyWord][key]);
    if(tryOne!=null){
        if(note.path == tryOne.path && note.id == tryOne.id){
            obj.userProjects[keyWord][key] = null;
            obj.setInstance(obj.getInstance());
            request_updateSettingsLastNotes(obj.user.email, obj.userProjects[keyWord]);
        }
    }
}


function checkNote(notePath){
    if(notePath == null){
        return null;
    }
    let noteRealPath = notePath.substring(0, notePath.length-2);
    let noteId = notePath.substring(notePath.length-2, notePath.length-1);
    return {path: noteRealPath, id: noteId};

}