import {request_deleteSomeElement} from './requests.js';
const electron = require('electron');
const { ipcRenderer } = electron;
const remote = require("@electron/remote");

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

ipcRenderer.on('beforeDelete', (event, data)=>{
    console.log(data);
    $("#main-text").html(data.text);
    $("#yesButton").addClass(`color${data.style}-2`);
    $("#noButton").addClass(`color${data.style}-2`);
    $("#yesButton").mouseover(()=>{
        $("#yesButton").removeClass(`color${data.style}-2`).addClass(`color${data.style}-3`);
    });
    $("#yesButton").mouseout(()=>{
        $("#yesButton").removeClass(`color${data.style}-3`).addClass(`color${data.style}-2`);
    });

    $("#noButton").mouseover(()=>{
        $("#noButton").removeClass(`color${data.style}-2`).addClass(`color${data.style}-3`);
    });
    $("#noButton").mouseout(()=>{
        $("#noButton").removeClass(`color${data.style}-3`).addClass(`color${data.style}-2`);
    });

    $("#yesButton").click(async (e)=>{
        e.preventDefault();
        const preload = document.createElement("div");
        preload.classList.add("preloader");
        preload.classList.add(`color${data.style}-through`);
        preload.setAttribute("id", "preloader");
        preload.innerHTML = `
            <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="lds-ripple" style="background:0 0">
                <circle class="color${data.style}-2s" cx="50" cy="50" r="4.719" fill="none" stroke-width="3">
                    <animate attributeName="r" calcMode="spline" values="0;40" keyTimes="0;1" dur="1.5" keySplines="0 0.2 0.8 1" begin="-0.75s" repeatCount="indefinite" animation-duration="0.5s" />
                    <animate attributeName="opacity" calcMode="spline" values="1;0" keyTimes="0;1" dur="1.5" keySplines="0.2 0 0.8 1" begin="-0.75s" repeatCount="indefinite" animation-duration="0.5s"/>
                </circle>
                <circle class="color${data.style}-4s" cx="50" cy="50" r="27.591" fill="none" stroke-width="4">
                    <animate attributeName="r" calcMode="spline" values="0;40" keyTimes="0;1" dur="1.5" keySplines="0 0.2 0.8 1" begin="0s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" calcMode="spline" values="1;0" keyTimes="0;1" dur="1.5" keySplines="0.2 0 0.8 1" begin="0s" repeatCount="indefinite"/>
                </circle>
            </svg>
        `
        $(document.body).append(preload);
        if(data.page != "notes" && data.listOfTasks != null){
            let today = new Date();
            let list = Object.values(data.listOfTasks).reverse();
            for(let i=0; i<list.length ; i++){
                if( list[i].date>=toIsoString(today).slice(0, 10)){
                    console.log(`${data.url}/${list[i].date}/${list[i].project_keyWord}/${list[i].id}`);
                    let elem = await request_deleteSomeElement(`${data.url}/${list[i].date}/${list[i].project_keyWord}/${list[i].id}`);
                    data.storage.push(elem);
                }
            }
        }else{
            let elem = await request_deleteSomeElement(data.url);
            data.storage.push(elem);
        }
        data.delete = true
        ipcRenderer.send("afterDelete", data)
    });

    $("#noButton").click(()=>{
        let data = {
            delete: false,
            title: null
        }
        ipcRenderer.send("afterDelete", data) 
    });
});
