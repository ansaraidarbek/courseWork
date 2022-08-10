import obj from './file.js';
import { addProjects_getReady } from './addProject.js';
import mainProject  from './mainProject.js';
const electron = require('electron');
const { ipcRenderer } = electron;
const remote = require("@electron/remote");


const observer = new IntersectionObserver(entries =>{
        entries.forEach(entry =>{
            entry.target.classList.toggle("show", entry.isIntersecting);
        });
    },
    {
        threshold:0.5
    }
);

export function projects_getReady( num){
    $("#otherProjects" + num).html("");
    $("#projects-container" + num).addClass(`color${mainProject.color}-through`);
    $("#mainProject" + num).addClass(`color${mainProject.color}-back`);
    $("#forBest" + num).addClass(`scroll${mainProject.color}`);
    let projects = Object.values(obj.userProjects);
    console.log(projects);
    projects.forEach(project => {
        if(project.valid == true){
            const elem = document.createElement("li");
            if(project.keyWord != mainProject.keyWord){
                observer.observe(elem);
                elem.innerHTML = project.keyWord;
                elem.addEventListener("mouseover", ()=>{
                    elem.classList.add(`color${project[`style${obj.userSettings.style}`]}-back`);
                });
                elem.addEventListener("mouseout", ()=>{
                    elem.classList.remove(`color${project[`style${obj.userSettings.style}`]}-back`);
                });
                elem.addEventListener("click", ()=>{
                    mainProject.changeProject(project.keyWord);
                    ipcRenderer.send("changeUserInfo");  
                });
                $("#otherProjects" + num).append(elem);
            }else{
                $("#mainProject" + num).html(project.keyWord);
                $("#mainProject" + num).mouseover(()=>{
                    $("#rotate" + num).addClass(`color${mainProject.color}-rotation`);
                });
                $("#mainProject" + num).mouseout(()=>{
                    $("#rotate" + num).removeClass(`color${mainProject.color}-rotation`);
                });
                $("#mainProject" + num).click((e)=>{
                    $("#project-container").addClass('show');
                    addProjects_getReady(1);
                    e.stopPropagation();
                });
            }
        }
    });
}

// $(document).ready(async (e)=>{
//     projects_getReady();
// });

// ipcRenderer.on("changeUserInfo", ()=>{
//     projects_getReady();
// });
