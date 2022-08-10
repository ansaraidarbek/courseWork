import { request_addProject, request_saveProject,request_deleteProject, request_updateUserInfo, request_updateUserTools, request_updateScheduleTime} from './requests.js';
import obj from './file.js';
import mainProject  from './mainProject.js';
const electron = require('electron');
const { ipcRenderer } = electron;
const remote = require("@electron/remote");

let projectChoice;
let projectColor;


function showContents(){
    switch(projectChoice){
        case 0:
            $("#projectWindow").html("");
            $("#projectWindow").html(`
            <div class="mainProjectWindow" id = "mainProjectWindow">
            <div class="firstRow">
                <div class="projectNameAdd">
                    Name
                <input 
                    type="text" 
                    id="projectNameplaceholder"
                    placeholder="max 20 " 
                    autocomplete="off"
                    maxlength="20"
                />
                </div>
                <div class="projectCodeAdd">
                    Project Code
                    <input 
                    type="text" 
                    id="projectCodeplaceholder"
                    placeholder="max 2 "  
                    autocomplete="off"
                    maxlength="2"
                    style="text-transform:uppercase"
                />
                </div>
            </div>
            <div class="secondRow">
                <div class="projectColorAdd">
                    Color
                    <div class="projectColorRow">
                        <div class="projectColor color1-box " id = "projectColor1"> 
                            <img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>
                        </div>
                        <div class="projectColor color2-box " id = "projectColor2"></div>
                        <div class="projectColor color3-box" id = "projectColor3"></div>
                        <div class="projectColor color4-box" id = "projectColor4"></div>
                        <div class="projectColor color5-box" id = "projectColor5"></div>
                        <div class="projectColor color6-box" id = "projectColor6"></div>
                        <div class="projectColor color7-box" id = "projectColor7"></div>
                        <div class="projectColor color8-box" id = "projectColor8"></div>
                    </div>
                </div>
            </div>
        </div> 
        <div class="bottomProjectWindow ">
        <div class="rightbottomProjectWindow">

        </div>
        <div class="leftbottomProjectWindow">                
            <button class="projectSave" id="projectSave">Add</button>
            <button class="projectCancel" id="projectCancel">Cancel</button>
        </div>
        </div>
            `);
            break;
        case 1:
            $("#projectWindow").html(`
            <div class="selectmainProjectWindow" id = "selectmainProjectWindow">
            <button class="selectleftArrow" id = "selectleftArrow">
                <img src = "./icons/leftSchedule.svg" alt="selectleftArrow" class = "style"/>
            </button>
            <button class="selectrightArrow" id = "selectrightArrow">
                <img src = "./icons/rightSchedule.svg" alt="selectleftArrow" class = "style"/>
            </button>
            <div class="topProjectName" id="topProjectName">
                
            </div>
            <div class="selectProjectwindow">
                <div class="selectfirstRow">
                    <div class="selectprojectNameAdd">
                        Name
                    <input 
                        type="text" 
                        id="projectNameplaceholder"
                        placeholder="Project Name" 
                        autocomplete="off"
                        maxlength="20"
                    />
                    </div>
                    <div class="selectprojectCodeAdd">
                        Project Code
                        <input 
                        type="text" 
                        id="projectCodePlaceholder"
                        placeholder="Project Code" 
                        autocomplete="off"
                        maxlength="2"
                        style="text-transform:uppercase"
                        disabled
                    />
                    </div>
                </div>
                <div class="selectsecondRow">
                    <div class="selectprojectColorAdd">
                        Color
                        <div class="projectColorRow">
                            <div class="selectprojectColor color1-box" id = "selectprojectColor1"></div>
                            <div class="selectprojectColor color2-box" id = "selectprojectColor2">
                                <img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>
                            </div>
                            <div class="selectprojectColor color3-box" id = "selectprojectColor3"></div>
                            <div class="selectprojectColor color4-box" id = "selectprojectColor4"></div>
                            <div class="selectprojectColor color5-box" id = "selectprojectColor5"></div>
                            <div class="selectprojectColor color6-box" id = "selectprojectColor6"></div>
                            <div class="selectprojectColor color7-box" id = "selectprojectColor7"></div>
                            <div class="selectprojectColor color8-box" id = "selectprojectColor8"></div>
                        </div>
                    </div>
                </div> 
            </div>
        </div>
        <div class="bottomProjectWindow ">

        <div class="rightbottomProjectWindow">
            <button class="projectSave " id="projectDelete" >Delete</button>
        </div>

        <div class="leftbottomProjectWindow">                
            <button class="projectSave " id="projectSave" >Save</button>
            <button class="projectCancel" id="projectCancel">Cancel</button>
        </div>
        </div>
        `);
            break;
        default:
            console.log("something went wrong in settings//showContents");
    }
}
function addJsPart(){
    switch(projectChoice){
        case 0:
            $("#addProjectButton").addClass("selected");
            $("#selectProjectButton").removeClass("selected");
            // $("#projectCancel").mouseover(()=>{
            //     $("#projectCancel").addClass('color1-2');
            // });
            // $("#projectCancel").mouseout(()=>{
            //     $("#projectCancel").removeClass('color1-2');
            // });
            
            $("#projectCancel").click( e =>{
                $("#project-container").removeClass('show');
                e.stopPropagation();
            });
            // $("#projectSave").mouseover(()=>{
            //     $("#projectSave").removeClass('color1-4');
            //     $("#projectSave").addClass('color1-2');
            // });
            // $("#projectSave").mouseout(()=>{
            //     $("#projectSave").removeClass('color1-2');
            // });
            projectColor = 1;
            $("#projectColor1").click( e =>{
                $("#projectColor2").html("");
                $("#projectColor3").html("");
                $("#projectColor4").html("");
                $("#projectColor5").html("");
                $("#projectColor6").html("");
                $("#projectColor7").html("");
                $("#projectColor8").html("");
                $("#projectColor1").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                projectColor = 1;
                e.stopPropagation();
            });
            $("#projectColor2").click( e =>{
                $("#projectColor1").html("");
                $("#projectColor3").html("");
                $("#projectColor4").html("");
                $("#projectColor5").html("");
                $("#projectColor6").html("");
                $("#projectColor7").html("");
                $("#projectColor8").html("");
                $("#projectColor2").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                projectColor = 2;
                e.stopPropagation();
            });
            $("#projectColor3").click( e =>{
                $("#projectColor2").html("");
                $("#projectColor1").html("");
                $("#projectColor4").html("");
                $("#projectColor5").html("");
                $("#projectColor6").html("");
                $("#projectColor7").html("");
                $("#projectColor8").html("");
                $("#projectColor3").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                projectColor = 3;
                e.stopPropagation();
            });
            $("#projectColor4").click( e =>{
                $("#projectColor2").html("");
                $("#projectColor3").html("");
                $("#projectColor1").html("");
                $("#projectColor5").html("");
                $("#projectColor6").html("");
                $("#projectColor7").html("");
                $("#projectColor8").html("");
                $("#projectColor4").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                projectColor = 4;
                e.stopPropagation();
            });
            $("#projectColor5").click( e =>{
                $("#projectColor2").html("");
                $("#projectColor3").html("");
                $("#projectColor4").html("");
                $("#projectColor1").html("");
                $("#projectColor6").html("");
                $("#projectColor7").html("");
                $("#projectColor8").html("");
                $("#projectColor5").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                projectColor = 5;
                e.stopPropagation();
            });
            $("#projectColor6").click( e =>{
                $("#projectColor2").html("");
                $("#projectColor3").html("");
                $("#projectColor4").html("");
                $("#projectColor5").html("");
                $("#projectColor1").html("");
                $("#projectColor7").html("");
                $("#projectColor8").html("");
                $("#projectColor6").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                projectColor = 6;
                e.stopPropagation();
            });
            $("#projectColor7").click( e =>{
                $("#projectColor2").html("");
                $("#projectColor3").html("");
                $("#projectColor4").html("");
                $("#projectColor5").html("");
                $("#projectColor6").html("");
                $("#projectColor1").html("");
                $("#projectColor8").html("");
                $("#projectColor7").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                projectColor = 7;
                e.stopPropagation();
            });
            $("#projectColor8").click( e =>{
                $("#projectColor2").html("");
                $("#projectColor3").html("");
                $("#projectColor4").html("");
                $("#projectColor5").html("");
                $("#projectColor6").html("");
                $("#projectColor7").html("");
                $("#projectColor1").html("");
                $("#projectColor8").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                projectColor = 8;
                e.stopPropagation();


            });
            var projectName = document.getElementById("projectNameplaceholder");
            var projectCode = document.getElementById("projectCodeplaceholder");

            $("#projectSave").click( e =>{
                if(projectName.value && projectCode.value && projectColor){
                    let projects = Object.values(obj.userProjects);
                    let validProjects = 0;
                    let validity = true;
                    projects.forEach(project =>{
                        if(project.valid == true){
                            validProjects++;
                            if(project.keyWord == projectCode.value.toUpperCase()){
                                console.log("projectCodes are same");
                                validity = false;
                            }
                        }
                        else{
                            if(project.keyWord == projectCode.value.toUpperCase()){
                                console.log("projectCodes was used before");
                                validity = false;
                            }
                        }
                    });
                    if(validity){
                        if(validProjects<8){
                            let newProjectObj = {
                                "keyWord": projectCode.value.toUpperCase(),
                                "name": projectName.value,
                                "valid": true,
                            }
                            for(let i = 1; i< 5; i++){
                                if(obj.userSettings.style == i){
                                    newProjectObj["style"+i] = projectColor.toString();
                                }else{
                                    newProjectObj["style"+i] = '1';
                                }
                            }
                            obj.userProjects[newProjectObj.keyWord] = newProjectObj;
                            console.log(newProjectObj);
                            request_addProject(obj.user.email, newProjectObj);
                            obj.setInstance(obj.getInstance());
                            mainProject.changeProject(newProjectObj.keyWord);
                            $("#project-container").removeClass('show');
                            ipcRenderer.send("changeUserInfo");
                            e.stopPropagation();
                        }
                    }
                }
            });
            break;
        case 1:
            $("#selectProjectButton").addClass("selected");
            $("#addProjectButton").removeClass("selected");
            // $("#projectCancel").mouseover(()=>{
            //     $("#projectCancel").addClass('color1-2');
            // });
            // $("#projectCancel").mouseout(()=>{
            //     $("#projectCancel").removeClass('color1-2');
            // });
            
            $("#projectCancel").click( e =>{
                $("#project-container").removeClass('show');
                e.stopPropagation();
            });

            // $("#projectSave").mouseover(()=>{
            //     $("#projectSave").removeClass('color1-4');
            //     $("#projectSave").addClass('color1-2');
            // });
            // $("#projectSave").mouseout(()=>{
            //     $("#projectSave").removeClass('color1-2');
            // });
            $("#selectprojectColor1").click( e =>{
                $("#selectprojectColor2").html("");
                $("#selectprojectColor3").html("");
                $("#selectprojectColor4").html("");
                $("#selectprojectColor5").html("");
                $("#selectprojectColor6").html("");
                $("#selectprojectColor7").html("");
                $("#selectprojectColor8").html("");
                $("#selectprojectColor1").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                projectColor = 1;
                e.stopPropagation();
            });
            $("#selectprojectColor2").click( e =>{
                $("#selectprojectColor1").html("");
                $("#selectprojectColor3").html("");
                $("#selectprojectColor4").html("");
                $("#selectprojectColor5").html("");
                $("#selectprojectColor6").html("");
                $("#selectprojectColor7").html("");
                $("#selectprojectColor8").html("");
                $("#selectprojectColor2").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                projectColor = 2;
                e.stopPropagation();
            });
            $("#selectprojectColor3").click( e =>{
                $("#selectprojectColor2").html("");
                $("#selectprojectColor1").html("");
                $("#selectprojectColor4").html("");
                $("#selectprojectColor5").html("");
                $("#selectprojectColor6").html("");
                $("#selectprojectColor7").html("");
                $("#selectprojectColor8").html("");
                $("#selectprojectColor3").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                projectColor = 3;
                e.stopPropagation();
            });
            $("#selectprojectColor4").click( e =>{
                $("#selectprojectColor2").html("");
                $("#selectprojectColor3").html("");
                $("#selectprojectColor1").html("");
                $("#selectprojectColor5").html("");
                $("#selectprojectColor6").html("");
                $("#selectprojectColor7").html("");
                $("#selectprojectColor8").html("");
                $("#selectprojectColor4").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                projectColor = 4;
                e.stopPropagation();
            });
            $("#selectprojectColor5").click( e =>{
                $("#selectprojectColor2").html("");
                $("#selectprojectColor3").html("");
                $("#selectprojectColor4").html("");
                $("#selectprojectColor1").html("");
                $("#selectprojectColor6").html("");
                $("#selectprojectColor7").html("");
                $("#selectprojectColor8").html("");
                $("#selectprojectColor5").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                projectColor = 5;
                e.stopPropagation();
            });
            $("#selectprojectColor6").click( e =>{
                $("#selectprojectColor2").html("");
                $("#selectvprojectColor3").html("");
                $("#selectprojectColor4").html("");
                $("#selectprojectColor5").html("");
                $("#selectprojectColor1").html("");
                $("#selectprojectColor7").html("");
                $("#selectprojectColor8").html("");
                $("#selectprojectColor6").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                projectColor = 6;
                e.stopPropagation();
            });
            $("#selectprojectColor7").click( e =>{
                $("#selectprojectColor2").html("");
                $("#selectprojectColor3").html("");
                $("#selectprojectColor4").html("");
                $("#selectprojectColor5").html("");
                $("#selectprojectColor6").html("");
                $("#selectprojectColor1").html("");
                $("#selectprojectColor8").html("");
                $("#selectprojectColor7").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                projectColor = 7;
                e.stopPropagation();
            });
            $("#selectprojectColor8").click( e =>{
                $("#selectprojectColor2").html("");
                $("#selectprojectColor3").html("");
                $("#selectprojectColor4").html("");
                $("#selectprojectColor5").html("");
                $("#selectprojectColor6").html("");
                $("#selectprojectColor7").html("");
                $("#selectprojectColor1").html("");
                $("#selectprojectColor8").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                projectColor = 8;
                e.stopPropagation();
            });
            $("#selectleftArrow").mouseover(()=>{
                $("#selectleftArrow").addClass('color1-2');
            });
            $("#selectleftArrow").mouseout(()=>{
                $("#selectleftArrow").removeClass('color1-2');
            });
            $("#selectrightArrow").mouseover(()=>{
                $("#selectrightArrow").addClass('color1-2');
            });
            $("#selectrightArrow").mouseout(()=>{
                $("#selectrightArrow").removeClass('color1-2');
            });
            $("#projectDelete").mouseover(()=>{
                $("#projectDelete").removeClass('color1-5');
                $("#projectDelete").addClass('color1-2');
            });
            $("#projectDelete").mouseout(()=>{
                $("#projectDelete").removeClass('color1-2');
            });
            
            document.getElementById("topProjectName").innerHTML = "" + obj.userProjects[mainProject.keyWord].name;
            document.getElementById("projectNameplaceholder").value = "" + obj.userProjects[mainProject.keyWord].name;
            document.getElementById("projectCodePlaceholder").value = "" + mainProject.keyWord;
            if(mainProject.color == 1){
                $("#selectprojectColor2").html("");
                $("#selectprojectColor3").html("");
                $("#selectprojectColor4").html("");
                $("#selectprojectColor5").html("");
                $("#selectprojectColor6").html("");
                $("#selectprojectColor7").html("");
                $("#selectprojectColor8").html("");
                $("#selectprojectColor1").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                projectColor = 1;
            }
            if(mainProject.color == 2){
                $("#selectprojectColor1").html("");
                $("#selectprojectColor3").html("");
                $("#selectprojectColor4").html("");
                $("#selectprojectColor5").html("");
                $("#selectprojectColor6").html("");
                $("#selectprojectColor7").html("");
                $("#selectprojectColor8").html("");
                $("#selectprojectColor2").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                projectColor = 2;
            }
            if(mainProject.color == 3){
                $("#selectprojectColor1").html("");
                $("#selectprojectColor2").html("");
                $("#selectprojectColor4").html("");
                $("#selectprojectColor5").html("");
                $("#selectprojectColor6").html("");
                $("#selectprojectColor7").html("");
                $("#selectprojectColor8").html("");
                $("#selectprojectColor3").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                projectColor = 3;
            }
            if(mainProject.color == 4){
                $("#selectprojectColor1").html("");
                $("#selectprojectColor2").html("");
                $("#selectprojectColor3").html("");
                $("#selectprojectColor5").html("");
                $("#selectprojectColor6").html("");
                $("#selectprojectColor7").html("");
                $("#selectprojectColor8").html("");
                $("#selectprojectColor4").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                projectColor = 4;
            }
            if(mainProject.color == 5){
                $("#selectprojectColor1").html("");
                $("#selectprojectColor2").html("");
                $("#selectprojectColor3").html("");
                $("#selectprojectColor4").html("");
                $("#selectprojectColor6").html("");
                $("#selectprojectColor7").html("");
                $("#selectprojectColor8").html("");
                $("#selectprojectColor5").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                projectColor = 5;
            }
            if(mainProject.color == 6){
                $("#selectprojectColor1").html("");
                $("#selectprojectColor2").html("");
                $("#selectprojectColor3").html("");
                $("#selectprojectColor4").html("");
                $("#selectprojectColor5").html("");
                $("#selectprojectColor7").html("");
                $("#selectprojectColor8").html("");
                $("#selectprojectColor6").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                projectColor = 6;
            }
            if(mainProject.color == 7){
                $("#selectprojectColor1").html("");
                $("#selectprojectColor2").html("");
                $("#selectprojectColor3").html("");
                $("#selectprojectColor4").html("");
                $("#selectprojectColor5").html("");
                $("#selectprojectColor5").html("");
                $("#selectprojectColor8").html("");
                $("#selectprojectColor7").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                projectColor = 7;
            }
            if(mainProject.color == 8){
                $("#selectprojectColor1").html("");
                $("#selectprojectColor2").html("");
                $("#selectprojectColor3").html("");
                $("#selectprojectColor4").html("");
                $("#selectprojectColor5").html("");
                $("#selectprojectColor5").html("");
                $("#selectprojectColor7").html("");
                $("#selectprojectColor8").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                projectColor = 8;
            }




            let projects = Object.values(obj.userProjects);
            let x = 0;
            let index = 0;
            projects.forEach(project =>{
                if(project.keyWord == mainProject.keyWord){
                    index = x;
                }
                x++;
            });
            console.log(projects.length);

            $("#selectleftArrow").click( e =>{
                index--;
                if(index < 0){
                    index = projects.length - 1;
                }
                for (let i = 0; i < projects.length; i++){
                    if( projects[index].valid == false){ 
                        index--;
                        continue; 
                    }
                    if(index < 0){ 
                        index = projects.length - 1;
                        continue; 
                    }
                    if(projects[index].valid == true){
                        document.getElementById("topProjectName").innerHTML = "" + projects[index].name;
                        document.getElementById("projectNameplaceholder").value = "" + projects[index].name;
                        document.getElementById("projectCodePlaceholder").value = "" + projects[index].keyWord;
                    
                    if(projects[index]["style1"] == 1){
                        $("#selectprojectColor2").html("");
                        $("#selectprojectColor3").html("");
                        $("#selectprojectColor4").html("");
                        $("#selectprojectColor5").html("");
                        $("#selectprojectColor6").html("");
                        $("#selectprojectColor7").html("");
                        $("#selectprojectColor8").html("");
                        $("#selectprojectColor1").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                        projectColor = 1;
                    }
                    if(projects[index]["style1"] == 2){
                        $("#selectprojectColor1").html("");
                        $("#selectprojectColor3").html("");
                        $("#selectprojectColor4").html("");
                        $("#selectprojectColor5").html("");
                        $("#selectprojectColor6").html("");
                        $("#selectprojectColor7").html("");
                        $("#selectprojectColor8").html("");
                        $("#selectprojectColor2").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                        projectColor = 2;
                    }
                    if(projects[index]["style1"] == 3){
                        $("#selectprojectColor1").html("");
                        $("#selectprojectColor2").html("");
                        $("#selectprojectColor4").html("");
                        $("#selectprojectColor5").html("");
                        $("#selectprojectColor6").html("");
                        $("#selectprojectColor7").html("");
                        $("#selectprojectColor8").html("");
                        $("#selectprojectColor3").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                        projectColor = 3;
                    }
                    if(projects[index]["style1"] == 4){
                        $("#selectprojectColor1").html("");
                        $("#selectprojectColor2").html("");
                        $("#selectprojectColor3").html("");
                        $("#selectprojectColor5").html("");
                        $("#selectprojectColor6").html("");
                        $("#selectprojectColor7").html("");
                        $("#selectprojectColor8").html("");
                        $("#selectprojectColor4").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                        projectColor = 4;
                    }
                    if(projects[index]["style1"] == 5){
                        $("#selectprojectColor1").html("");
                        $("#selectprojectColor2").html("");
                        $("#selectprojectColor3").html("");
                        $("#selectprojectColor4").html("");
                        $("#selectprojectColor6").html("");
                        $("#selectprojectColor7").html("");
                        $("#selectprojectColor8").html("");
                        $("#selectprojectColor5").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                        projectColor = 5;
                    }
                    if(projects[index]["style1"] == 6){
                        $("#selectprojectColor1").html("");
                        $("#selectprojectColor2").html("");
                        $("#selectprojectColor3").html("");
                        $("#selectprojectColor4").html("");
                        $("#selectprojectColor5").html("");
                        $("#selectprojectColor7").html("");
                        $("#selectprojectColor8").html("");
                        $("#selectprojectColor6").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                        projectColor = 6;
                    }
                    if(projects[index]["style1"]== 7){
                        $("#selectprojectColor1").html("");
                        $("#selectprojectColor2").html("");
                        $("#selectprojectColor3").html("");
                        $("#selectprojectColor4").html("");
                        $("#selectprojectColor5").html("");
                        $("#selectprojectColor5").html("");
                        $("#selectprojectColor8").html("");
                        $("#selectprojectColor7").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                        projectColor = 7;
                    }
                    if(projects[index]["style1"] == 8){
                        $("#selectprojectColor1").html("");
                        $("#selectprojectColor2").html("");
                        $("#selectprojectColor3").html("");
                        $("#selectprojectColor4").html("");
                        $("#selectprojectColor5").html("");
                        $("#selectprojectColor5").html("");
                        $("#selectprojectColor7").html("");
                        $("#selectprojectColor8").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                        projectColor = 8;
                    }
                    if(projects[index].keyWord == "A"){
                        $("#projectNameplaceholder").prop('disabled', true);
                        const deleteButton = document.getElementById('projectDelete')
                        deleteButton.disabled = true;
                    }
                    else{
                        $("#projectNameplaceholder").prop('disabled', false);
                        const deleteButton = document.getElementById('projectDelete')
                        deleteButton.disabled = false;
                    }
                    break;
                }

                }                
            });
            $("#selectrightArrow").click( e =>{
                index++;
                if(index == projects.length){
                    index = 0;
                }
                for (let i = 0; i < projects.length; i++){
                    if(index == projects.length){ 
                        index = 0;
                        continue; 
                    }
                     if( projects[index].valid == false){ 
                        index++;
                        continue; 
                    }
                    else if(projects[index].valid == true){
                        document.getElementById("topProjectName").innerHTML = "" + projects[index].name;
                        document.getElementById("projectNameplaceholder").value = "" + projects[index].name;
                        document.getElementById("projectCodePlaceholder").value = "" + projects[index].keyWord;
                        
                        if(projects[index]["style1"] == 1){
                            $("#selectprojectColor2").html("");
                            $("#selectprojectColor3").html("");
                            $("#selectprojectColor4").html("");
                            $("#selectprojectColor5").html("");
                            $("#selectprojectColor6").html("");
                            $("#selectprojectColor7").html("");
                            $("#selectprojectColor8").html("");
                            $("#selectprojectColor1").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                            projectColor = 1;
                        }
                        if(projects[index]["style1"] == 2){
                            $("#selectprojectColor1").html("");
                            $("#selectprojectColor3").html("");
                            $("#selectprojectColor4").html("");
                            $("#selectprojectColor5").html("");
                            $("#selectprojectColor6").html("");
                            $("#selectprojectColor7").html("");
                            $("#selectprojectColor8").html("");
                            $("#selectprojectColor2").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                            projectColor = 2;
                        }
                        if(projects[index]["style1"] == 3){
                            $("#selectprojectColor1").html("");
                            $("#selectprojectColor2").html("");
                            $("#selectprojectColor4").html("");
                            $("#selectprojectColor5").html("");
                            $("#selectprojectColor6").html("");
                            $("#selectprojectColor7").html("");
                            $("#selectprojectColor8").html("");
                            $("#selectprojectColor3").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                            projectColor = 3;
                        }
                        if(projects[index]["style1"] == 4){
                            $("#selectprojectColor1").html("");
                            $("#selectprojectColor2").html("");
                            $("#selectprojectColor3").html("");
                            $("#selectprojectColor5").html("");
                            $("#selectprojectColor6").html("");
                            $("#selectprojectColor7").html("");
                            $("#selectprojectColor8").html("");
                            $("#selectprojectColor4").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                            projectColor = 4;
                        }
                        if(projects[index]["style1"] == 5){
                            $("#selectprojectColor1").html("");
                            $("#selectprojectColor2").html("");
                            $("#selectprojectColor3").html("");
                            $("#selectprojectColor4").html("");
                            $("#selectprojectColor6").html("");
                            $("#selectprojectColor7").html("");
                            $("#selectprojectColor8").html("");
                            $("#selectprojectColor5").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                            projectColor = 5;
                        }
                        if(projects[index]["style1"] == 6){
                            $("#selectprojectColor1").html("");
                            $("#selectprojectColor2").html("");
                            $("#selectprojectColor3").html("");
                            $("#selectprojectColor4").html("");
                            $("#selectprojectColor5").html("");
                            $("#selectprojectColor7").html("");
                            $("#selectprojectColor8").html("");
                            $("#selectprojectColor6").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                            projectColor = 6;
                        }
                        if(projects[index]["style1"]== 7){
                            $("#selectprojectColor1").html("");
                            $("#selectprojectColor2").html("");
                            $("#selectprojectColor3").html("");
                            $("#selectprojectColor4").html("");
                            $("#selectprojectColor5").html("");
                            $("#selectprojectColor5").html("");
                            $("#selectprojectColor8").html("");
                            $("#selectprojectColor7").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                            projectColor = 7;
                        }
                        if(projects[index]["style1"] == 8){
                            $("#selectprojectColor1").html("");
                            $("#selectprojectColor2").html("");
                            $("#selectprojectColor3").html("");
                            $("#selectprojectColor4").html("");
                            $("#selectprojectColor5").html("");
                            $("#selectprojectColor5").html("");
                            $("#selectprojectColor7").html("");
                            $("#selectprojectColor8").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                            projectColor = 8;
                        }
                        if(projects[index].keyWord == "A"){
                            $("#projectNameplaceholder").prop('disabled', true);
                            const deleteButton = document.getElementById('projectDelete')
                            deleteButton.disabled = true;
                        }
                        else{
                            $("#projectNameplaceholder").prop('disabled', false);;
                            const deleteButton = document.getElementById('projectDelete')
                            deleteButton.disabled = false;
                        }
                        break;
                    }

                 }      
            });
                if(projects[index].keyWord == "A"){
                    $("#projectNameplaceholder").prop('disabled', true);
                    const deleteButton = document.getElementById('projectDelete')
                    deleteButton.disabled = true;
                }
                else{
                    $("#projectNameplaceholder").prop('disabled', false);
                    const deleteButton = document.getElementById('projectDelete')
                    deleteButton.disabled = false;
                }
                var projectName = document.getElementById("projectNameplaceholder");
                var projectCode = document.getElementById("projectCodePlaceholder");
                $("#projectSave").click( e =>{
                    console.log(projectName.value);
                    console.log(projectCode.value);
                    console.log(projectColor);
                    obj.userProjects[projects[index].keyWord].name = projectName.value;
                    let someString = "style"+obj.userSettings.style;
                    obj.userProjects[projects[index].keyWord][someString] = projectColor.toString();
                    console.log(obj.userProjects[projects[index].keyWord]);         
                    request_saveProject(obj.user.email, obj.userProjects[projects[index].keyWord]);
                    mainProject.changeProject(projectCode.value);
                    obj.setInstance(obj.getInstance());
                    ipcRenderer.send("changeUserInfo");
                });
                $("#projectDelete").click( e =>{
                    console.log(projectCode.value);
                    obj.userProjects[projects[index].keyWord].valid = false;
                    console.log(obj.userProjects[projects[index].keyWord]);
                    request_deleteProject(obj.user.email, obj.userProjects[projects[index].keyWord]);
                    mainProject.changeProject("A");
                    document.getElementById("topProjectName").innerHTML = "" + obj.userProjects["A"].name;
                    document.getElementById("projectNameplaceholder").value = "" + obj.userProjects["A"].name;
                    document.getElementById("projectCodePlaceholder").value = "A";
                        
                        if(obj.userProjects['A']["style1"] == 1){
                            $("#selectprojectColor2").html("");
                            $("#selectprojectColor3").html("");
                            $("#selectprojectColor4").html("");
                            $("#selectprojectColor5").html("");
                            $("#selectprojectColor6").html("");
                            $("#selectprojectColor7").html("");
                            $("#selectprojectColor8").html("");
                            $("#selectprojectColor1").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                            projectColor = 1;
                        }
                        if(obj.userProjects['A']["style1"]  == 2){
                            $("#selectprojectColor1").html("");
                            $("#selectprojectColor3").html("");
                            $("#selectprojectColor4").html("");
                            $("#selectprojectColor5").html("");
                            $("#selectprojectColor6").html("");
                            $("#selectprojectColor7").html("");
                            $("#selectprojectColor8").html("");
                            $("#selectprojectColor2").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                            projectColor = 2;
                        }
                        if(obj.userProjects['A']["style1"]  == 3){
                            $("#selectprojectColor1").html("");
                            $("#selectprojectColor2").html("");
                            $("#selectprojectColor4").html("");
                            $("#selectprojectColor5").html("");
                            $("#selectprojectColor6").html("");
                            $("#selectprojectColor7").html("");
                            $("#selectprojectColor8").html("");
                            $("#selectprojectColor3").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                            projectColor = 3;
                        }
                        if(obj.userProjects['A']["style1"]  == 4){
                            $("#selectprojectColor1").html("");
                            $("#selectprojectColor2").html("");
                            $("#selectprojectColor3").html("");
                            $("#selectprojectColor5").html("");
                            $("#selectprojectColor6").html("");
                            $("#selectprojectColor7").html("");
                            $("#selectprojectColor8").html("");
                            $("#selectprojectColor4").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                            projectColor = 4;
                        }    
                        if(obj.userProjects['A']["style1"]  == 5){
                            $("#selectprojectColor1").html("");
                            $("#selectprojectColor2").html("");
                            $("#selectprojectColor3").html("");
                            $("#selectprojectColor4").html("");
                            $("#selectprojectColor6").html("");
                            $("#selectprojectColor7").html("");
                            $("#selectprojectColor8").html("");
                            $("#selectprojectColor5").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                            projectColor = 5;
                        }
                        if(obj.userProjects['A']["style1"]  == 6){
                            $("#selectprojectColor1").html("");
                            $("#selectprojectColor2").html("");
                            $("#selectprojectColor3").html("");
                            $("#selectprojectColor4").html("");
                            $("#selectprojectColor5").html("");
                            $("#selectprojectColor7").html("");
                            $("#selectprojectColor8").html("");
                            $("#selectprojectColor6").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                            projectColor = 6;
                        }
                        if(obj.userProjects['A']["style1"] == 7){
                            $("#selectprojectColor1").html("");
                            $("#selectprojectColor2").html("");
                            $("#selectprojectColor3").html("");
                            $("#selectprojectColor4").html("");
                            $("#selectprojectColor5").html("");
                            $("#selectprojectColor5").html("");
                            $("#selectprojectColor8").html("");
                            $("#selectprojectColor7").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                            projectColor = 7;
                        }
                        if(obj.userProjects['A']["style1"]  == 8){
                            $("#selectprojectColor1").html("");
                            $("#selectprojectColor2").html("");
                            $("#selectprojectColor3").html("");
                            $("#selectprojectColor4").html("");
                            $("#selectprojectColor5").html("");
                            $("#selectprojectColor5").html("");
                            $("#selectprojectColor7").html("");
                            $("#selectprojectColor8").html(`<img src = "./icons/Black_check.svg" alt="checkProject" class = "style"/>`);
                            projectColor = 8;
                        }
                        let y = 0;
                        let num = 0;
                        projects.forEach(project =>{
                            if(project.keyWord == "A"){
                                num = y;
                            }
                            y++;
                        });
                        if(projects[num].keyWord == "A"){
                            $("#projectNameplaceholder").prop('disabled', true);
                            const deleteButton = document.getElementById('projectDelete')
                            deleteButton.disabled = true;
                        }
                        else{
                            $("#projectNameplaceholder").prop('disabled', false);;
                            const deleteButton = document.getElementById('projectDelete')
                            deleteButton.disabled = false;
                        }
                    obj.setInstance(obj.getInstance());
                    ipcRenderer.send("changeUserInfo");
                });
            
            
            
            break;
        default:
            console.log("something went wrong in settings//showContents");

    }
}
export function addProjects_getReady(num){
    $("#pContainer").click( e =>{
        e.stopPropagation();
    });
    projectChoice = num;
    showContents();
    addJsPart(); 
}