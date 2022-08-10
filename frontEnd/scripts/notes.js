import obj from './file.js';
import mainProject  from './mainProject.js';
import { newNotes_deleteNote } from './newNotes.js';
import { setBackPath } from './sidebar.js';
const electron = require('electron');
const { ipcRenderer } = electron;
const remote = require("@electron/remote");



function preparePalette(){
    $("#mainWindow").addClass(`color${mainProject.color}-2`);
    $("#addButton").addClass(`color${mainProject.color}-2`);
    $("#notes-list").addClass(`scroll${mainProject.color}`);
    $("#noteButton").addClass(`color${mainProject.color}Back1`);
}

function showList(elements){
    $("#notes-list").html("");
    if('0-' in elements["path"]){
        let mainStyle = 'style' + obj.userSettings.style;
        const noteElements = Object.values(elements["path"]['0-']);
        noteElements.forEach(noteElement =>{
            if(obj.userProjects[noteElement["data"].project_keyWord].valid == true && (mainProject.keyWord == "A" || noteElement["data"].project_keyWord == mainProject.keyWord)){
                    let color = obj.userProjects[noteElement["data"].project_keyWord][mainStyle];
                    let privelegy = "";
                    if(obj.userSettings.style <=2){
                        privelegy =(mainProject.keyWord == "A")?`color${mainProject.color}-`:"";
                    }
                    const note = document.createElement("li");
                    note.classList.add("notes-element");
                    note.innerHTML = `
                    <div class="notes-line"></div>
                    <span class="notes-text">${noteElement["data"].title}</span>
                    `
                    const noteButton = document.createElement("button");
                    noteButton.innerHTML=`
                        <img src = "./icons/deleteTasks.svg" alt="deleteButton"/>
                    `
                    note.classList.add(`${privelegy}color${color}-2`)
                    noteButton.classList.add(`${privelegy}color${color}-2`)
                    noteButton.addEventListener("mouseover", (e)=>{
                        noteButton.classList.replace(`${privelegy}color${color}-2`, `${privelegy}color${color}-3`);
                        e.stopPropagation();
                    })
                    noteButton.addEventListener("mouseout", (e)=>{
                        noteButton.classList.replace(`${privelegy}color${color}-3`, `${privelegy}color${color}-2`);
                        e.stopPropagation();
                    })
                    noteButton.addEventListener("click", (e)=>{
                        const data = {
                            page: "notes",
                            url : `/deleteNote/${obj.user.email}/${noteElement["data"].path}/${noteElement["data"].id}`,
                            delete: false,
                            style: color,
                            text : noteElement["data"].title,
                            id : noteElement["data"].id,
                            parentId: 0,
                            projectKeyWord: noteElement["data"].project_keyWord,
                            storage: []
                        }
                        ipcRenderer.send('beforeDelete', data);
                        e.stopPropagation();
                    })
                    note.addEventListener("mouseover", ()=>{
                        if(obj.userSettings.style <=2){
                            noteButton.classList.replace(`${privelegy}color${color}-2`, `${privelegy}color${color}-3`);
                        }
                        note.classList.replace(`${privelegy}color${color}-2`, `${privelegy}color${color}-3`);
                    });
                    note.addEventListener("mouseout", ()=>{
                        if(obj.userSettings.style <=2){
                            noteButton.classList.replace(`${privelegy}color${color}-3`, `${privelegy}color${color}-2`);
                        }
                        note.classList.replace(`${privelegy}color${color}-3`, `${privelegy}color${color}-2`);
                    });
                    note.addEventListener("click", async (e)=>{
                        console.log("hello");
                        e.preventDefault();
                        const data = {
                            styling:{
                                fontStyle : "Times New Roman",
                                fontSize : 15,
                                bold : false,
                                italic : false,
                                underline : false,
                                focused: false,
                            },
                            note : {
                                method : "PUT",
                                id : noteElement["data"].id,
                                path : '0-',
                                project_keyWord: noteElement["data"].project_keyWord,
                                literalPath: "Notes/"
                            }
                        }
                        const info = JSON.parse(sessionStorage.getItem("info")).path;
                        setBackPath(info, 5, data);
                    });
                    note.appendChild(noteButton);
                    $("#notes-list").append(note);
            }
        });
    }

    // if(mainProject.keyWord == "A" || element.project_keyWord == mainProject.keyWord){
    //     if(element.parent_id == 0){
    //         let privelegy = (mainProject.keyWord == "A")?`color${mainProject.color}-`:"";
    //         const note = document.createElement("li");
    //         note.classList.add("notes-element");
    //         note.innerHTML = `
    //         <div class="notes-line"></div>
    //         <span class="notes-text">${element.title}</span>
    //         `
    //         const noteButton = document.createElement("button");
    //         noteButton.innerHTML=`
    //             <img src = "./icons/deleteTasks.svg" alt="deleteButton"/>
    //         `
    //         const userProjects = obj.userProjects;
    //         if(!userProjects){
    //             console.log("no userProjects access!");
    //         }
    //         let i=0
    //         for(; i<userProjects.length; i++){
    //             if(userProjects[i].keyWord == element.project_keyWord){
    //                 break;
    //             }
    //         }
    //         note.classList.add(`${privelegy}color${color}-2`)
    //         noteButton.classList.add(`${privelegy}color${color}-2`)
    //         noteButton.addEventListener("mouseover", (e)=>{
    //             noteButton.classList.replace(`${privelegy}color${color}-2`, `${privelegy}color${color}-3`);
    //             e.stopPropagation();
    //         })
    //         noteButton.addEventListener("mouseout", (e)=>{
    //             noteButton.classList.replace(`${privelegy}color${color}-3`, `${privelegy}color${color}-2`);
    //             e.stopPropagation();
    //         })
    //         noteButton.addEventListener("click", (e)=>{
    //             const data = {
    //                 page: "notes",
    //                 url : `/deleteNote/${obj.user.email}/${element.id}/${element.id}`,
    //                 delete: false,
    //                 style: color,
    //                 text : element.title,
    //                 id : element.id,
    //                 parentId: 0,
    //                 projectKeyWord: element.project_keyWord,
    //                 storage: null
    //             }
    //             ipcRenderer.send('beforeDelete', data);
    //             e.stopPropagation();
    //         })
    //         note.addEventListener("mouseover", ()=>{
    //             noteButton.classList.replace(`${privelegy}color${color}-2`, `${privelegy}color${color}-3`);
    //             note.classList.replace(`${privelegy}color${color}-2`, `${privelegy}color${color}-3`);
    //         });
    //         note.addEventListener("mouseout", ()=>{
    //             noteButton.classList.replace(`${privelegy}color${color}-3`, `${privelegy}color${color}-2`);
    //             note.classList.replace(`${privelegy}color${color}-3`, `${privelegy}color${color}-2`);
    //         });
    //         note.addEventListener("click", async (e)=>{
    //             console.log("hello");
    //             e.preventDefault();
    //             const data = {
    //                 styling:{
    //                     fontStyle : "Times New Roman",
    //                     fontSize : 15,
    //                     bold : false,
    //                     italic : false,
    //                     underline : false,
    //                     focused: false,
    //                 },
    //                 note : {
    //                     method : "PUT",
    //                     id : element.id,
    //                     parent_id : 0,
    //                     family: element.family,
    //                     project_keyWord: element.project_keyWord,
    //                     path: "Notes/"
    //                 }
    //             }
    //             const info = JSON.parse(sessionStorage.getItem("info")).path;
    //             setBackPath(info, 5, data);
    //         });
    //         note.appendChild(noteButton);
    //         $("#notes-list").append(note);
    //     }
    // }
}

async function showUserNotes(){
    const userNotes = obj.userNotes;
    if(!userNotes){
        console.log("no userNotes access!");
    }
    showList(userNotes);
}

export function notes_getReady(){
    preparePalette();
    showUserNotes();
}

// $(document).ready(()=>{
//     notes_getReady();
// });

$("#addButton").mouseover(()=>{
    $("#addButton").removeClass(`color${mainProject.color}-3`).addClass(`color${mainProject.color}-4`);
});

$("#addButton").mouseout(()=>{
    $("#addButton").removeClass(`color${mainProject.color}-4`).addClass(`color${mainProject.color}-3`);
});

$("#addButton").click(async (e)=>{
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
    const data = {
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
    const info = JSON.parse(sessionStorage.getItem("info")).path;
    setBackPath(info, 5, data);
});

// function nextPage(data){
//     const arr = JSON.parse(sessionStorage.getItem("backPath"));
//     const obj1 = {
//         path: window.location.href,
//         info: null
//     };
//     const obj2 = {
//         path: "note.html",
//         info: data
//     };
//     arr.push(obj1);
//     sessionStorage.setItem("backPath", JSON.stringify(arr));
//     sessionStorage.setItem("info", JSON.stringify(obj2));
//     window.location.href = "note.html";
// }

// ipcRenderer.on('goback', ()=>{
//     const backPath = JSON.parse(sessionStorage.getItem("backPath"));
//     const currentData = backPath.pop();
//     sessionStorage.setItem("info", JSON.stringify(currentData));
//     sessionStorage.setItem("backPath", JSON.stringify(backPath));
//     window.location.href = currentData.path;
// });

ipcRenderer.on('afterDelete', async (event, data)=>{
    if(data.delete == true && data.page == "notes"){
        newNotes_deleteNote(data.storage[0]);
        notes_getReady();
    }
});

// ipcRenderer.on("changeUserInfo", ()=>{
//     notes_getReady();
// });