import {request_addNote, request_updateNote, request_updateSettingsLastNotes, request_passAudio } from './requests.js';
import obj from './file.js';
import mainProject  from './mainProject.js';
import {newNotes_addNote, newNotes_updateNote, newNotes_updateLast, newNotes_incrementPhoto, newNotes_incrementAudio} from './newNotes.js';
import { setBackPath } from './sidebar.js';
const ImageDataURI = require('image-data-uri');
const fs = require('fs');
const electron = require('electron');
const { ipcRenderer } = electron;
const remote = require("@electron/remote");
const fse = require('fs-extra');
const path = require('path');

let data;
let style;
let blocked = false;


URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var rec; 							//Recorder.js object
var input; 							//MediaStreamAudioSourceNode we'll be recording

var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext //audio context to help us record

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

//----------------------------
function setRange(target, boolVal){
    let range = document.createRange();
    let sel = window.getSelection();
    let spanLength;
    if(boolVal){
        spanLength=0;
    }else{
        spanLength=target.length;
    }
    range.setStart(target, spanLength);
    sel.removeAllRanges();
    sel.addRange(range);
}

function styleSpan(span){
    let textProperty = `font-family: "${style.fontStyle}"; font-size: ${style.fontSize}px;`
    if(style.bold){
        textProperty += `font-weight: bold;`
    }
    if(style.italic){
        textProperty += `font-style: italic;`
    }
    if(style.underline){
        textProperty += `text-decoration: underline;`
    }
    span.setAttribute("style", `${textProperty}`);
}

//----------------------------


//------------------------
function setInputs(){
    document.getElementById("note-title").addEventListener("input", (e)=>{
        if(!($("#note-title").val().trim().length === 0)){
            saveInfo();
        }
    });
    
    document.getElementById("note-text").addEventListener("input", (e)=>{
        saveInfo();
    });
    
    document.getElementById("note-text").addEventListener("beforeinput", (e)=>{
        let length = window.getSelection().baseNode.parentNode.innerHTML.length;
        if(window.getSelection().baseNode.parentNode.innerHTML[length-1] == '​'){
            e.preventDefault();
            let textEditor = document.getElementById("note-text");
            let index = Array.prototype.indexOf.call(textEditor.children, window.getSelection().baseNode.parentNode);
            let text = window.getSelection().baseNode.parentNode.innerText;
            window.getSelection().baseNode.parentNode.innerText = text.substring(0, text.length-1) + e.data;
            setRange(textEditor.childNodes[index].childNodes[0], false);
        }
    });
}
//------------------------


//-----------------------
function checkSelected(){
    if(window.getSelection().baseNode.parentNode.tagName == "SPAN"){
        style.fontStyle = window.getSelection().baseNode.parentNode.style.fontFamily.replace(/[^a-zA-Z0-9 ]/g, '');
        style.fontSize = window.getSelection().baseNode.parentNode.style.fontSize.replace(/[^0-9 ]/g, '');
        style.bold = (window.getSelection().baseNode.parentNode.style.fontWeight == "bold")?true:false;
        style.italic = (window.getSelection().baseNode.parentNode.style.fontStyle =="italic")?true:false;
        let fifth = window.getSelection().baseNode.parentNode.style.textDecorationLine;
        let sixth = window.getSelection().baseNode.parentNode.style.textDecoration;
        style.underline = (fifth=="underline" || sixth=="underline")?true:false;
        $("#fontStyleButton").val(style.fontStyle);
        $("#fontSizeButton").val(style.fontSize);
        let buttons = document.querySelectorAll(".note-border");
        buttons.forEach(button=>button.classList.remove("note-border"));
        if(style.bold){
            $("#boldButton").addClass("note-border");
        }
        if(style.italic){
            $("#italicButton").addClass("note-border");
        }
        if(style.underline){
            $("#underlineButton").addClass("note-border");
        }
    }
}

$("#note-text").click((e)=>{
    if(window.getSelection().toString()) {

    }else {
        checkSelected();
    }
});
//-----------------------



//-----------------------
$('#note-text').on('keydown', function (event) {
    if (window.getSelection && event.keyCode  == 13) { // enter
        let textProperty = `font-family: "${style.fontStyle}"; font-size: ${style.fontSize}px;`
        if(style.bold){
            textProperty += `font-weight: bold;`
        }
        if(style.italic){
            textProperty += `font-style: italic;`
        }
        if(style.underline){
            textProperty += `text-decoration: underline;`
        }
        document.execCommand("insertHtml", true, `<br /><span style='${textProperty}'>​</span>`);
        return false;
    }
});
//-----------------------

//-----------------------
function focusFinalSpan(){
    let textEditor = document.getElementById("note-text");
    let index = textEditor.childNodes.length-1;
    while(index>-1){
        if (textEditor.childNodes[index].tagName == "SPAN"){
            setRange(textEditor.childNodes[index].childNodes[0], false);
            break;
        }
        index--;
    }
}

function createFocusChecker(){
    $('body').off("click");
    $("#note-text").focus((e)=>{
        style.focused = true;
        // let textEditor = document.getElementById("note-text");
        // for(let i=0; i<textEditor.childNodes.length; i++){
        //     if(textEditor.childNodes[i].tagName != "SPAN" && textEditor.childNodes[i].tagName != "DIV"){
        //         textEditor.childNodes[i].remove();
        //     }
        // }
    });

    $("#note-title").focus((e)=>{
        $("#fontStyleButton").attr("disabled", true);
        $("#fontSizeButton").attr("disabled", true);
        $("#increaseButton").attr("disabled", true);
        $("#decreaseButton").attr("disabled", true);
        $("#boldButton").attr("disabled", true);
        $("#italicButton").attr("disabled", true);
        $("#underlineButton").attr("disabled", true);
        $("#imageButton").attr("disabled", true);
        $("#videoButton").attr("disabled", true);
        $("#recordButton").attr("disabled", true);
    });
    
    //document.body.addEventListener('click', function(event) {
    $('body').on("click", (event) => {
        let textEditor = document.getElementById("note-text");
        let titleEditor = document.getElementById("note-title");
        let buttons = document.querySelectorAll(".note-btn");
        let isClickInsideText = textEditor.contains(event.target);
        let isClickInsideTitle = titleEditor.contains(event.target);
        let found = false;
        for(let i=0; i<buttons.length; i++){
            found = buttons[i].contains(event.target);
            if(found) {
                break;
            }
        }
        if(!(window.getSelection().toString() && window.getSelection().baseNode.parentNode.tagName == "SPAN")){
            if (!isClickInsideText && !found ) {
                console.log("false");
                style.focused = false;
            }
        }

        if(!isClickInsideTitle){
            $("#fontStyleButton").attr("disabled", false);
            $("#fontSizeButton").attr("disabled", false);
            $("#increaseButton").attr("disabled", false);
            $("#decreaseButton").attr("disabled", false);
            $("#boldButton").attr("disabled", false);
            $("#italicButton").attr("disabled", false);
            $("#underlineButton").attr("disabled", false);
            $("#imageButton").attr("disabled", false);
            $("#videoButton").attr("disabled", false);
            $("#recordButton").attr("disabled", false);
        }
    });
}
//-----------------------

function prevElement(index){
    index--;
    let textEditor = document.getElementById("note-text");
    if(index>-1){
        if(textEditor.childNodes[index].tagName == "SPAN"){
            return 1;
        }else if(textEditor.childNodes[index].tagName == "DIV"){
            return 2;
        }else if(textEditor.childNodes[index].tagName == "BR"){
            return 3;
        }
        index--;
    }
    return -1;
}

function isLeftSpanExist(index){
    index--;
    let textEditor = document.getElementById("note-text");
    while(index>-1){
        if(textEditor.childNodes[index].tagName == "SPAN"){
            return index;
        }
        index--;
    }
    return -1;
}

$('#note-text').on('keydown', function (event) {
    if (window.getSelection && event.which == 8) { // backspace
        if(window.getSelection().toString()){
            let textProperty = `font-family: "${style.fontStyle}"; font-size: ${style.fontSize}px;`
            if(style.bold){
                textProperty += `font-weight: bold;`
            }
            if(style.italic){
                textProperty += `font-style: italic;`
            }
            if(style.underline){
                textProperty += `text-decoration: underline;`
            }

            
            document.execCommand("insertHTML", true, `<span style='${textProperty}'>​</span>`);
            return false;
        }else{
            let textEditor = document.getElementById("note-text");
            let index = Array.prototype.indexOf.call(textEditor.children, window.getSelection().baseNode.parentNode);
            let exist = isLeftSpanExist(index);
            let prevElem = prevElement(index);
            if(exist == -1){
                if((textEditor.childNodes[index].innerHTML.length == 1) && (textEditor.childNodes[index].innerHTML != '​')){
                    textEditor.childNodes[index].innerHTML = '​';
                    setRange(textEditor.childNodes[index].childNodes[0], true);
                    return false;
                }else if((textEditor.childNodes[index].innerHTML.length == 1) && (textEditor.childNodes[index].innerHTML == '​')){
                    return false;
                }
            }else{
                if((textEditor.childNodes[index].innerHTML.length == 1) && (textEditor.childNodes[index].innerHTML != '​')){
                    textEditor.childNodes[index].innerHTML = '​';
                    setRange(textEditor.childNodes[index].childNodes[0], true);
                    return false;
                }else if((textEditor.childNodes[index].innerHTML.length == 1) && (textEditor.childNodes[index].innerHTML == '​')){
                    textEditor.childNodes[index].remove();
                    if(prevElem == 2 || prevElem == 3){
                        textEditor.childNodes[index-1].remove();
                    }
                    setRange(textEditor.childNodes[exist].childNodes[0], false);
                    return false;
                }
            }
        }
    }
});

async function showContents(){
    $("#note-title").val("");
    $("#note-text").html("");
    const userNotes = obj.userNotes;
    if(!userNotes){
        console.log("no userNotes access!");
    }
    if(data.method == "POST"){
        $("#note-text").html(`<span style="font-family:Times New Roman; font-size:15px;" >​</span>`);
    }else{
        let elem = userNotes["path"][data.path][data.id]["data"];
        $("#note-title").val(elem.title);
        $("#note-text").html(elem.text);
    }
    if($("#note-title").val()==''){
        $("#note-title").focus();
        $("#note-text").attr("contenteditable", false);
    }else{
        $("#note-text").attr("contenteditable", true);
        $("#note-text").focus();
        focusFinalSpan();
    }
}

async function showList(){
    $("#noteChildren").html("");
    const userNotes = obj.userNotes;
    if(!userNotes){
        console.log("no userNotes access!");
    }
    if(data.method != "POST"){
        let children = userNotes["path"][data.path][data.id]["children"];
    children.forEach(child =>{
            const liElem = document.createElement("li");
            liElem.classList.add(`color${mainProject.color}-2`);
            const span = document.createElement("span");
            span.innerHTML = child.title;
            const deleteButton = document.createElement("button");
            deleteButton.classList.add(`color${mainProject.color}-2`);
            deleteButton.innerHTML = `
                <img src = "./icons/deleteTasks.svg" alt="deleteButton"/>
            `;
            liElem.appendChild(span);
            liElem.appendChild(deleteButton);
    
            deleteButton.addEventListener("mouseover", (e)=>{
                deleteButton.classList.replace(`color${mainProject.color}-2`, `color${mainProject.color}-3`);
                e.stopPropagation();
            })
            deleteButton.addEventListener("mouseout", (e)=>{
                deleteButton.classList.replace(`color${mainProject.color}-3`, `color${mainProject.color}-2`);
                e.stopPropagation();
            })
            deleteButton.addEventListener("click", (e)=>{
                e.preventDefault();
                const info = {
                    page : "note",
                    url : `/deleteNote/${obj.user.email}/${child.path}/${child.id}`,
                    delete: false,
                    style: mainProject.color,
                    text : child.title,
                    id : child.id,
                    parentId: data.id,
                    projectKeyWord: data.project_keyWord,
                    storage: []
                }
                console.log(info);
                ipcRenderer.send('beforeDelete', info)
                e.stopPropagation();
            })
            
            liElem.addEventListener("click", async (e)=>{
                e.preventDefault();
                let pathName = data.literalPath+userNotes["path"][data.path][data.id]["data"].title+"/";
                const info = {
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
                        id : child.id,
                        path: data.path+data.id+"-",
                        project_keyWord: data.project_keyWord,
                        literalPath: pathName,
                    }
                }
                setBackPath(5, 5, info);
            });
            
            liElem.addEventListener("mouseover", ()=>{
                if(obj.userSettings.style <=2){
                    deleteButton.classList.replace(`color${mainProject.color}-2`, `color${mainProject.color}-3`);
                }
                liElem.classList.replace(`color${mainProject.color}-2`, `color${mainProject.color}-3`);
            });
            
            liElem.addEventListener("mouseout", ()=>{
                if(obj.userSettings.style <=2){
                    deleteButton.classList.replace(`color${mainProject.color}-3`, `color${mainProject.color}-2`);
                }
                liElem.classList.replace(`color${mainProject.color}-3`, `color${mainProject.color}-2`);
            });
            $("#noteChildren").append(liElem);
    });
    }
}

function printPath(){

}

function preparePalette(){
    $("#note-childBox").addClass(`color${mainProject.color}-2`);
    $("#note-text").addClass(`scroll${mainProject.color}`);
    $("#noteAddButton").addClass(`color${mainProject.color}-2`);
}



export function note_getReady(){
    const someData = JSON.parse(sessionStorage.getItem("info"));
    data = someData.info.note;
    style = someData.info.styling;
    $("#fontStyleButton").val(style.fontStyle);
    $("#fontSizeButton").val(style.fontSize);
    if(data.path in obj.userNotes["path"] && data.id in obj.userNotes["path"][data.path]){
        updateLastNote();
    }

    preparePalette();
    printPath();
    createFocusChecker();
    showContents();
    setInputs();
    showList();
}

function saveInfo(){
    if ($("#note-title").val()){
        if($("#note-text").attr("contenteditable") == 'false'){
            $("#note-text").attr("contenteditable", true)
        }
        const userNotes = obj.userNotes;
        if(!userNotes){
            console.log("no userNotes access!");
        }
        if($("#note-text").text() == '' || $("#note-text").text() == String.fromCharCode(160)){
            $("#note-text").html('<span style="font-family:Times New Roman; font-size:15px;" >​</span>');
        }
        if (data.method == "PUT"){   
            const newNote = {
                id : data.id,
                title : $("#note-title").val(),
                text : $("#note-text").html(),
                project_keyWord: data.project_keyWord,
                pictures: obj.userNotes["path"][data.path][data.id]["data"].pictures,
                videos: obj.userNotes["path"][data.path][data.id]["data"].videos,
                audios: obj.userNotes["path"][data.path][data.id]["data"].audios,
                path: data.path,
                ref1: obj.userNotes["path"][data.path][data.id]["data"].ref1,
                ref2: obj.userNotes["path"][data.path][data.id]["data"].ref2,
                ref3: obj.userNotes["path"][data.path][data.id]["data"].ref3
            }
            request_updateNote(obj.user.email, newNote);
            newNotes_updateNote(newNote);
        }else{
            let today = new Date();
            const newNote = {
                id : data.id,
                title : $("#note-title").val(),
                text : $("#note-text").html(),
                project_keyWord: data.project_keyWord,
                path: data.path,
                pictures: "000000",
                videos: "000000",
                audios: "000000",
                date: toIsoString(today).slice(0, 10),
                ref1: false,
                ref2: false,
                ref3: false
            }
            data.method = "PUT";
            const someData = JSON.parse(sessionStorage.getItem("info"));
            someData.info.note.method = "PUT";
            sessionStorage.setItem("info", JSON.stringify(someData));
            request_addNote(obj.user.email, newNote);
            newNotes_addNote(newNote);
            updateLastNote();
        }
    }
}

function updateLastNote(){
    newNotes_updateLast(obj.userNotes["path"][data.path][data.id]["data"]);
    if(obj.userNotes["path"][data.path][data.id]["data"].project_keyWord != "A"){
        request_updateSettingsLastNotes(obj.user.email, obj.userProjects[obj.userNotes["path"][data.path][data.id]["data"].project_keyWord]);
    }
    request_updateSettingsLastNotes(obj.user.email, obj.userProjects["A"]);
}

//---------------------------buttons

function checkOutsiders(start, end){
    let textEditor = document.getElementById('note-text');
    console.log(textEditor.childNodes);
    console.log(start);
    console.log(end);
    if(start+1<textEditor.childNodes.length){
        for(let i=start+1; i<=end; i++){
            if(textEditor.childNodes[i].tagName == "DIV" || textEditor.childNodes[i].tagName == "BR"){
                return true;
            }
        }
    }
    return false;
}
function changeTextEditorStyle(){
    if(style.focused){
        let textProperty = `font-family: "${style.fontStyle}"; font-size: ${style.fontSize}px;`
        if(style.bold){
            textProperty += `font-weight: bold;`
        }
        if(style.italic){
            textProperty += `font-style: italic;`
        }
        if(style.underline){
            textProperty += `text-decoration: underline;`
        }
        console.log("hereso");

        if(window.getSelection().toString()) {
            let textEditor = document.getElementById("note-text");
            console.log(window.getSelection());
            let first = Array.prototype.indexOf.call(textEditor.children, window.getSelection().extentNode.parentNode);
            let second= Array.prototype.indexOf.call(textEditor.children, window.getSelection().baseNode.parentNode);
            if(first<0){
                first = Array.prototype.indexOf.call(textEditor.children, window.getSelection().extentNode);
            }
            if(second<0){
                second = Array.prototype.indexOf.call(textEditor.children, window.getSelection().baseNode);
            }
            let start;
            let end;
            let firstBegin;
            let secondEnd;
            if(first>second){
                start = second;
                end = first;
                firstBegin = window.getSelection().baseOffset;
                secondEnd = window.getSelection().focusOffset;
            }else if(first<=second){
                start = first;
                end = second;
                firstBegin = window.getSelection().focusOffset;
                secondEnd = window.getSelection().baseOffset;
            }
            // console.log(start)
            // console.log(end)
            // console.log(firstBegin)
            // console.log(secondEnd)
            let result = checkOutsiders(start, end);
            if(result){
                let firstText = textEditor.childNodes[start].innerHTML;
                let secondText = textEditor.childNodes[end].innerHTML;
                let textOfSpan=firstText.substring(firstBegin, firstText.length);
                let constructedString = `<span style='${textProperty}'>${textOfSpan}</span>`;
                for(let i=start+1; i<end; i++){
                    if(textEditor.childNodes[i].tagName == "SPAN"){
                        constructedString += `<span style='${textProperty}'>${textEditor.childNodes[i].innerHTML}</span>`;
                    }else if(textEditor.childNodes[i].tagName == "BR"){
                        constructedString += `<br />`;
                    }else if(textEditor.childNodes[i].tagName == "DIV"){
                        constructedString += `${textEditor.childNodes[i].outerHTML}`;
                    }
                }
                textOfSpan=secondText.substring(0, secondEnd);
                constructedString += `<span style='${textProperty}'>${textOfSpan}</span>`;
                document.execCommand("insertHTML", true, `${constructedString}`);
            }else{
                let text = window.getSelection().toString();
                document.execCommand("insertHTML", true, `<span style='${textProperty}'>${text}</span>`);
            }
            //document.execCommand("insertHTML", true, `<span style='${textProperty}'>${text}</span>`);
        }else{
            let textEditor = document.getElementById("note-text");
            let i = Array.prototype.indexOf.call(textEditor.children, window.getSelection().baseNode.parentNode);
            //you can add check left span
            document.execCommand("insertHTML", true, `<span style='${textProperty}'>​</span>`);
            setRange(textEditor.childNodes[i+1].childNodes[0], true);
        }
    }else{
        console.log("not focused");
    }
}

document.getElementById("fontStyleButton").addEventListener(("input"), (e)=>{
    style.fontStyle = $("#fontStyleButton").val();
    changeTextEditorStyle();
})

document.getElementById("fontSizeButton").addEventListener(("input"), (e)=>{
    style.fontSize = $("#fontSizeButton").val();
    changeTextEditorStyle();
})

$("#increaseButton").click((e)=>{
    e.preventDefault();
    console.log(style.fontSize);
    if(style.fontSize<40){
        style.fontSize = parseInt(style.fontSize)+5;
    }
    console.log(style.fontSize);
    $("#fontSizeButton").val(style.fontSize);
    changeTextEditorStyle();
})

$("#decreaseButton").click((e)=>{
    e.preventDefault();
    if(style.fontSize>10){
        style.fontSize -=5;
    }
    $("#fontSizeButton").val(style.fontSize);
    changeTextEditorStyle();
})

$("#boldButton").click((e)=>{
    e.preventDefault();
    style.bold = (style.bold==false)?true:false;
    if(style.bold){
        $("#boldButton").addClass("note-border");
    }else{
        $("#boldButton").removeClass("note-border");
    }
    changeTextEditorStyle();
})

$("#italicButton").click((e)=>{
    e.preventDefault();
    style.italic = (style.italic==false)?true:false;
    if(style.italic){
        $("#italicButton").addClass("note-border");
    }else{
        $("#italicButton").removeClass("note-border");
    }
    changeTextEditorStyle();
});

$("#underlineButton").click((e)=>{
    e.preventDefault();
    style.underline = (style.underline==false)?true:false;
    if(style.underline){
        $("#underlineButton").addClass("note-border");
    }else{
        $("#underlineButton").removeClass("note-border");
    }
    changeTextEditorStyle();
});

function createRecursivly(fullPath, shortPath, id){
    let length = shortPath.length;
    let string;
    for(let i =1; i<length; i+=2){
        string = shortPath.substring(i-1, i+1);
        let finalPath = path.join(fullPath, string);
        if (!fs.existsSync(finalPath)) {
            fs.mkdirSync(finalPath);
        }
        fullPath = finalPath;
    }
    let realFinalPath = path.join(fullPath, id);
    if (!fs.existsSync(realFinalPath)) {
        fs.mkdirSync(realFinalPath);
    }
    return realFinalPath;
}

function findLastSpan(){
    let textEditor = document.getElementById("note-text");
    let length = textEditor.childNodes.length-1;
    while(length>-1){
        if(textEditor.childNodes[length].tagName =="SPAN"){
            setRange(textEditor.childNodes[length].childNodes[0], false);
            console.log(textEditor.childNodes.length);
            console.log(length);
            break;
        }
        length--;
    }
    if(length == -1){
        console.log("how it is possible?");
    }
}

$('#note-text').bind('paste', (e)=>{
    let textProperty = `font-family: "${style.fontStyle}"; font-size: ${style.fontSize}px;`
    if(style.bold){
        textProperty += `font-weight: bold;`
    }
    if(style.italic){
        textProperty += `font-style: italic;`
    }
    if(style.underline){
        textProperty += `text-decoration: underline;`
    }
    

    let cbPayload = [...(e.clipboardData || e.originalEvent.clipboardData).items];     
    cbPayload = cbPayload.filter(i => /image/.test(i.type));                       

    if(!cbPayload.length || cbPayload.length === 0) {
        navigator.clipboard.readText().then(text => {
            if(text != null && text != ' '){
                document.execCommand("insertHtml", true, `<span style='${textProperty}'>${text}</span>`);
            }
          })
          .catch(err => {
            console.error('Failed to read clipboard contents: ', err);
        });
        
        return false;                      
    }
    let reader = new FileReader();                                                     
    reader.readAsDataURL(cbPayload[0].getAsFile()); 
    reader.onloadend = function () {

        const dataPath = remote.app.getPath("userData");
        const filePath = path.join(dataPath, "local");
        if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath);
        }
        const extendedFilePath = createRecursivly(filePath, data.path, `${data.id}-`);
        let start = reader.result.indexOf("/");
        let end = reader.result.indexOf(";");
        let type = reader.result.substring(start+1,end);
        const finalPath = path.join(extendedFilePath,`${obj.userNotes["path"][data.path][data.id]["data"].pictures}-img.${type}`);
        ImageDataURI.outputFile(reader.result, finalPath).then(data=>{
            if(!style.focused){
                if($("#note-title").val().trim().length === 0){
                    $("#note-title").focus;
                }else{
                    findLastSpan();
                }
            }
            document.execCommand("insertHtml", true, `<div class = noteImage contenteditable="false"><img draggable="false" src = "${finalPath}" alt="noteTextImage"/></div><span style='${textProperty}'>​</span>`);
        } );
        newNotes_incrementPhoto(obj.userNotes["path"][data.path][data.id]["data"]);
        saveInfo();
    }   
    return false;
});

$("#imageButton").click((e)=>{
    e.preventDefault();
    $("#fileinputImages").click( (e)=>{
        e.stopPropagation();
    }); 
    $("#fileinputImages").click();
    $("#fileinputImages").change((event) => {
        event.preventDefault();
        const fileList = event.target.files;
        if(!style.focused){
            if($("#note-title").val().trim().length === 0){
                $("#note-title").focus();
            }else{
                findLastSpan();
            }
        }
        if(style.focused){
            for(let i=0; i<fileList.length; i++){
                let srcDir = `${fileList[i].path}`;
                const dataPath = remote.app.getPath("userData");
                const filePath = path.join(dataPath, "local");
                if (!fs.existsSync(filePath)) {
                    fs.mkdirSync(filePath);
                }
                const extendedFilePath = createRecursivly(filePath, data.path, `${data.id}-`);
                let start = fileList[i].name.indexOf(".");
                let end = fileList[i].name.length;
                let type = fileList[i].name.substring(start+1,end);
                const finalPath = path.join(extendedFilePath,`${obj.userNotes["path"][data.path][data.id]["data"].pictures}-img.${type}`);
                let destDir = `${finalPath}`;
                fse.copySync(srcDir, destDir, { overwrite: true },function (err) {
                    if (err) {                 
                    console.error(err);      
                    } else {
                    console.log("success!");
                    }
                });
    
                let textProperty = `font-family: "${style.fontStyle}"; font-size: ${style.fontSize}px;`
                if(style.bold){
                    textProperty += `font-weight: bold;`
                }
                if(style.italic){
                    textProperty += `font-style: italic;`
                }
                if(style.underline){
                    textProperty += `text-decoration: underline;`
                }
                document.execCommand("insertHtml", true, `<div class = noteImage contenteditable="false"><img draggable="false" src = "${finalPath}" alt="noteTextImage"/></div><span style='${textProperty}'>​</span>`);
            }
            $("#forImages").html('<input name="upload" type="file" id="fileinputImages" accept=".jpg, .jpeg, .png">');
            newNotes_incrementPhoto(obj.userNotes["path"][data.path][data.id]["data"]);
            saveInfo();
        }
        
    });

    // document.execCommand("insertHtml", true, '<div class = noteImage contenteditable="false"><img draggable="false" src = "./images/noteImages/image1.jpg" alt="noteTextImage"/></div>');
});
$("#videoButton").click((e)=>{
    e.preventDefault();
    let elem = null;
    let index;
    let textEditor = document.getElementById("note-text");
    if(style.focused){
        elem = window.getSelection().baseNode.parentNode;
        index =Array.prototype.indexOf.call(textEditor.children, elem);
    }
    $("#fileinputVideos").click( (e)=>{
        e.stopPropagation();
    }); 
    $("#fileinputVideos").click();
    $("#fileinputVideos").change((event) => {
        let textProperty = `font-family: "${style.fontStyle}"; font-size: ${style.fontSize}px;`
        if(style.bold){
            textProperty += `font-weight: bold;`
        }
        if(style.italic){
            textProperty += `font-style: italic;`
        }
        if(style.underline){
            textProperty += `text-decoration: underline;`
        }
        event.preventDefault();
        const fileList = event.target.files;
        if(elem == null){
            findLastSpan();
        }
        for(let i=0; i<fileList.length; i++){
            document.execCommand("insertHtml", true, `<div class = noteVideo contenteditable="false"><video src = "${fileList[i].path}" id = "video1" type = "video/mp4" controls preload = "none"></video></div><span style='${textProperty}'>​</span>`);
        }
        textEditor = document.getElementById("note-text");
        if(elem == null){
            index = Array.prototype.indexOf.call(textEditor.children, window.getSelection().baseNode.parentNode);
            setRange(textEditor.childNodes[index+2].childNodes[0], true);
        }else{
            setRange(textEditor.childNodes[index+2].childNodes[0], false);
        }

        $("#forVideos").html('<input name="upload" type="file" id="fileinputVideos" accept=".mp4">');
        saveInfo();
    });
});

function startRecording() {
    
    var constraints = { audio: true, video:false }


	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		console.log("getUserMedia() success, stream created, initializing Recorder.js ...");
		audioContext = new AudioContext();
		gumStream = stream;
		input = audioContext.createMediaStreamSource(stream);
		rec = new Recorder(input,{numChannels:1})
		rec.record()
		console.log("Recording started");

	}).catch(function(err) {
        console.log(err);
	});
}

function stopRecording() {
	rec.stop();
	gumStream.getAudioTracks()[0].stop();
	rec.exportWAV(downloadBlob);
}

function downloadBlob(blob) {
	let textProperty = `font-family: "${style.fontStyle}"; font-size: ${style.fontSize}px;`
    if(style.bold){
        textProperty += `font-weight: bold;`
    }
    if(style.italic){
        textProperty += `font-style: italic;`
    }
    if(style.underline){
        textProperty += `text-decoration: underline;`
    }
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return new Promise(resolve => {
        reader.onloadend = (e) => {
            let encoder = obj.userNotes["path"][data.path][data.id]["data"].audios;
            let buffer = reader.result.replace('data:audio/wav;base64,', '')
            const formData = new FormData();
            //Buffer.from(buffer, 'base64')
            formData.append('file', buffer);
            let myOwnpath = obj.userNotes["path"][data.path][data.id]["data"].path + obj.userNotes["path"][data.path][data.id]["data"].id+"-"+obj.userNotes["path"][data.path][data.id]["data"].audios;
            if(!blocked){
                blocked = true;
                request_passAudio(formData,obj.user.email, myOwnpath).then(resp => {
                    blocked = false;
                    let thisDoc = document.getElementById(`forAudios${encoder}`);
                    let mainDoc = document.getElementById(`noteVoiceText${encoder}`);
                    let button = document.getElementById(`noteTextbutton${encoder}`);
                    console.log(resp.data);
                    if(button.classList.contains("pressed")){
                        mainDoc.innerHTML = resp.data;
                    }
                    thisDoc.innerHTML = resp.data;
                    saveInfo();
                });
            }else{
                thisDoc.innerHTML = "we can handle one audion at a time. Weight please";
            }
            const dataPath = remote.app.getPath("userData");
            const filePath = path.join(dataPath, "local");
            if (!fs.existsSync(filePath)) {
                fs.mkdirSync(filePath);
            }
            const extendedFilePath = createRecursivly(filePath, data.path, `${data.id}-`);
            //const extendedFilePath = path.join(filePath,`${data.path}${data.id}-`);
            // if (!fs.existsSync(extendedFilePath)) {
            //     fs.mkdirSync(extendedFilePath);
            // }
            const binaryAudioPath = path.join(extendedFilePath,`${encoder}-aud.wav`);
            const audioPath = path.join(extendedFilePath,`${encoder}.mp3`);
            console.log(reader.result);
            fs.writeFileSync(binaryAudioPath, Buffer.from(buffer, 'base64'));
            if(!style.focused){
                findLastSpan();
            }
            document.execCommand("insertHtml", true, `<div><div class = "noteAudio" contenteditable="false" id = "noteAudio"><audio src="${binaryAudioPath}" id = "audio1" controls></audio><button class = "noteTextbutton" id = "noteTextbutton${encoder}"><img src = "./icons/speech_to_text.png" alt="voiceImage"/></button></div><div class = "noteVoiceText" id = "noteVoiceText${encoder}"></div><div class="hiddenfile hiddenAudioText" id="forAudios${encoder}"></div></div><span style='${textProperty}'>​</span>`);
            let voiceButton = document.getElementById(`noteTextbutton${encoder}`);
            let voiceText = document.getElementById(`noteVoiceText${encoder}`);
            let thisDoc = document.getElementById(`forAudios${encoder}`);
            voiceButton.addEventListener("mouseover", ()=>{
                voiceButton.classList.add("note-hover");
            });
            voiceButton.addEventListener("mouseout", ()=>{
                voiceButton.classList.remove("note-hover");
            });
            voiceButton.addEventListener("click", async (e)=>{
                voiceButton.classList.toggle("pressed");
                if(voiceButton.classList.contains("pressed")){
        
                    voiceText.classList.add("voicenoteText");
                    if(thisDoc.innerHTML == ''){
                        voiceText.innerHTML = "we are processing your data";
                    }else{
                        voiceText.innerHTML = thisDoc.innerHTML;
                    }
                }else{
                    voiceText.classList.remove("voicenoteText");
                    voiceText.innerHTML = "";
                }
            });
            
            
            let textEditor = document.getElementById("note-text");
            let index = Array.prototype.indexOf.call(textEditor.children, window.getSelection().baseNode.parentNode);
            setRange(textEditor.childNodes[index].childNodes[0], true);
            newNotes_incrementAudio(obj.userNotes["path"][data.path][data.id]["data"]);
            saveInfo();
            /*let audio = new Audio(reader.result);
            audio.play();*/
            resolve(reader.result);
        };
    });
	
}

$("#recordButton").click((e)=>{
    e.preventDefault();
    if($("#recordButtonImg").hasClass("pressedRecordButton")){
        $("#recordButtonImg").removeClass("pressedRecordButton");
        stopRecording();
    }else{
        $("#recordButtonImg").addClass("pressedRecordButton");
        startRecording();
    }
});

//---------------------------buttons


$("#noteAddButton").mouseover(()=>{
    $("#noteAddButton").removeClass(`color${mainProject.color}-2`).addClass(`color${mainProject.color}-3`);
});

$("#noteAddButton").mouseout(()=>{
    $("#noteAddButton").removeClass(`color${mainProject.color}-3`).addClass(`color${mainProject.color}-2`);
});

$("#noteAddButton").click(async ()=>{
    const userNotes = obj.userNotes;
    if(!userNotes){
        console.log("no userNotes access!");
    }
    if($("#note-title").val() && data.path in userNotes["path"] && data.id in userNotes["path"][data.path]){
        let id;
        let nextPath = data.path + data.id+"-";
        if(nextPath in userNotes["path"]){
            id = Object.values(userNotes["path"][nextPath]).length +1;
        }else{
            id = 1;
        }
        let pathName = data.literalPath+userNotes["path"][data.path][data.id]["data"].title+"/";
        const store = {
            styling:{
                fontStyle : "Times New Roman",
                fontSize : 15,
                bold : false,
                italic : false,
                underline : false,
                focused: false,
            },
            note : {
                method : "POST",
                id : id,
                path: nextPath,
                project_keyWord: data.project_keyWord,
                literalPath: pathName
            }
        }
        setBackPath(5, 5, store);
    }else{
        $("#note-title").focus();
    }
});
