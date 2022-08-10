import { request_updateUserInfo, request_updateUserTools, request_updateScheduleTime} from './requests.js';
import obj from './file.js';
const electron = require('electron');
const { ipcRenderer } = electron;
const remote = require("@electron/remote");

let settingsPosition;

function showContents(){
    switch(settingsPosition){
        case 0:
            $("#settings-window").html("");
            $("#settings-window").html(`
            <div class="settings-container">
                <div class = "image" id = "image">
                    <img src="images/profile-image.jpg" alt="profileImg">
                </div>
    
                <div class="set-right">    
                    <h1>Profile Information</h1>
                    <h2 class = "name">Name</h2>
                    <input type="text"
                    id="name" class="input" value="Miras Kaidullayev">
    
                    <h2>Surname</h2>
                    <input type="text"
                    id="surname" class="input" value="Kaidullayev">
    
                    <h2>Email</h2>
                    <input type="text"
                    id="email" class="input" value="miras.kaidullayev@nu.edu.kz" readonly="readonly">
    
                    <h2>Password</h2>
                    <input type="password"
                    id="password" class="input" value="123456789">          
                </div>
                </div>
                <div class="set-update-button">
                <button class ='set-update-btn color1-menu' id = "update">Update</button> 
                </div> 
            `);
            break;
        case 1:
            $("#settings-window").html(`
            <div class="settings-container_1">
            <div class="window">    
                <h1 class = "addRemove">Tools</h1>

                <div class="settings-options" id="menu-options">
                    <div class="settings-toolsTasks">
                        <label class="settings-main">Tasks
                            <input 
                            type="checkbox"
                            id="tasks"
                            >
                            <span class="settings-geekmark1"></span>
                        </label>
                    </div>
                    <div class="settings-toolsNotes">
                        <label class="settings-main">Notes
                            <input 
                            type="checkbox"
                            id="notes"
                            >
                            <span class="settings-geekmark2"></span>
                        </label>
                    </div>
                    <div class="settings-toolsSchedule">
                        <label class="settings-main">Schedule
                            <input 
                            type="checkbox"
                            id="schedule"
                            >
                            <span class="settings-geekmark3"></span>
                        </label>
                    </div>
                </div>
            </div>
            <div class="settings-StyleWindow">
                <h1 class = "addRemove">Style</h1>
                <div class="settings-styleButtons">
                    <button class ='set-style-btn color1-menu' id = "style1">Style 1</button>
                    <button class ='set-style-btn color1-menu' id = "style1">Style 2</button>
                </div>
                <div class="settings-styleButtons_1">
                    <button class ='set-style-btn color1-menu' id = "style3">Style 3</button>
                    <button class ='set-style-btn color1-menu' id = "style4">Style 4</button>
                </div>
            </div>
            </div>
            <div class="set-update-button">
            <button class ='set-update-btn color1-menu' id = "update">Update</button> 
            </div>
            `);
            break;
        case 2:
            $("#settings-window").html(`
            <div class="set-schedule-header">
                 Schedule Time Settings
            </div>
            <div class="set-schedule-selector1">
                <p>Choose the number of hours in a day:</p>
                <div class="set-input-container">
                    <input 
                        type="number" 
                        id="scheduletimePlaceholder"
                        placeholder="max 24/ min 12 " 
                        autocomplete="off"
                        min="12" 
                        max="24"
                    />
                    <span class="validity"></span>
                </div>
            </div>
            <div class="set-schedule-selector2">
                <p>
                    Choose the range of hours in a day:
                </p>
                <div class="set-schedule-slider">
                    <div class="set-slidecontainer">
                        <input type="range" min="0" max="12" value="50" class="slider" id="myRange">
                        <span class = "set-initialTime">00:00</span>
                        <span class = "set-finalTime">24:00</span>
                    </div>
                </div>
            </div>
            <div class="set-schedule-selector3">
                <p>Choose the range of hours in a day (input):</p>
                <div class="set-schedule-input">
                    <input class="set-schedule-startTime" type="time" id="startTime" name="appt" disabled>
                    <img src = "./icons/rightSchedule.svg" alt="user"/>
                    <span class="set-span-start">From</span>
                    <input class="set-schedule-endTime" type="time" id="endTime" name="appt"disabled>
                    <span class="set-span-end">Till</span>
                </div>
            </div>
            <div class="set-update-button">
                <button class ='set-update-btn color1-menu' id = "update">Update</button> 
            </div>
    `);
            break;
        default:
            console.log("something went wrong in settings//showContents");
    }
}

function addJsPart(){
    switch(settingsPosition){
        case 0:
            $("#set-profile-icon").addClass("color1-4");
            $("#set-add-remove-icon").removeClass("color1-4");
            $("#set-schedule-time-icon").removeClass("color1-4");
            const user = obj.user;
            if (!user){
                console.log("No access to user!");
            }
            $("#name").val(user.name);
            $("#email").val(user.email);
            $("#password").val(user.password);
            $("#surname").val(user.surname);
            $("#update").mouseover(()=>{
                $("#update").removeClass('color1-2').addClass('color1-3');
            });
            $("#update").mouseout(()=>{
                $("#update").removeClass('color1-3').addClass('color1-2');
            });
            
            $("#update").click( async (e) =>{
                e.preventDefault();
                if($("#name").val()!="" && $("#password").val()!="" && $("#surname").val()!=""){
                    console.log("here");
                    obj.user.password = $("#password").val();
                    obj.user.name = $("#name").val();
                    obj.user.surname = $("#surname").val();
                    request_updateUserInfo(obj.user.email, obj.user);
                    obj.setInstance(obj.getInstance());
                    ipcRenderer.send("changeUserInfo");
                }
            });
            break;
        case 1:
        $("#set-profile-icon").removeClass("color1-4");
        $("#set-schedule-time-icon").removeClass("color1-4");
        $("#set-add-remove-icon").addClass("color1-4");
        const userSettings = obj.userSettings;
        if (!userSettings){
            console.log("No access to userSettings!");
        }
        if(userSettings.tasks){
            $("#tasks").addClass('color1-1');
        }
        if(userSettings.schedule){
            $("#schedule").addClass('color1-1');
        }
        if(userSettings.notes){
            $("#notes").addClass('color1-1');
        }
        $("#tasks").click(async (e)=>{
            $("#tasks").toggleClass('color1-1');
        });
        $("#schedule").click(async (e)=>{
            $("#schedule").toggleClass('color1-1');
        });
        $("#notes").click(async (e)=>{
            $("#notes").toggleClass('color1-1');
        });
        $("#update").click( async e =>{
            obj.userSettings.tasks = false;
            obj.userSettings.schedule = false;
            obj.userSettings.notes = false;
            if($("#tasks").hasClass('color1-1')){
                obj.userSettings.tasks = true;
            }
            if($("#schedule").hasClass('color1-1')){
                obj.userSettings.schedule = true;
            }
            if($("#notes").hasClass('color1-1')){
                obj.userSettings.notes = true;
            }
            console.log( obj.userSettings);
            request_updateUserTools(obj.user.email, obj.userSettings);
            obj.setInstance(obj.getInstance());
            ipcRenderer.send("changeUserInfo");
        });
            break;
            case 2:
                $("#set-profile-icon").removeClass("color1-4");
                $("#set-add-remove-icon").removeClass("color1-4");
                $("#set-schedule-time-icon").addClass("color1-4");
                var time = document.getElementById("scheduletimePlaceholder");
                var slider = document.getElementById("myRange");
                var style = document.querySelector('[data="test"]');
                time.value = obj.userSettings.scheduleEnd - obj.userSettings.scheduleStart;
                slider.value = obj.userSettings.scheduleStart;
                var num = parseInt(time.value, 10);
                var maximum = num;
                var percentage = (num / 24 * 100);
                document.getElementById("myRange").max = "" + (24-maximum);
                setData(percentage);
                if(obj.userSettings.scheduleStart<10){
                    document.getElementById("startTime").value = "0" + slider.value + ":00";
                    if(obj.userSettings.scheduleEnd >= 24){
                        document.getElementById("endTime").value = "00:00";
                    }else{
                        document.getElementById("endTime").value = "" + obj.userSettings.scheduleEnd + ":00";
                    }
                }else{
                    document.getElementById("startTime").value = "" + obj.userSettings.scheduleStart + ":00";
                    if(obj.userSettings.scheduleEnd >= 24){
                        document.getElementById("endTime").value = "00:00";
                    }else{
                        document.getElementById("endTime").value = "" + obj.userSettings.scheduleEnd + ":00";
                    }
                }
                time.addEventListener("input", function(event) {
                    event.preventDefault();
                    if (parseInt(time.value) <= 24 && parseInt(time.value) >= 12) {
                        console.log(parseInt(time.value));
                        var num = parseInt(time.value, 10);
                        var percentage = (num / 24 * 100);
                        setData(percentage);
                        maximum = 24 - num;
                        document.getElementById("myRange").max = "" + maximum;
                
                        if(slider.value < 10){
                            var x = parseInt(slider.value) + parseInt(time.value);
                            document.getElementById("startTime").value = "0" + slider.value + ":00";
                            if(x == 24){
                                 document.getElementById("endTime").value = "00:00";
                            }else{
                                    document.getElementById("endTime").value = "" + x + ":00";
                            }
                        }
                        else{
                            var x = parseInt(slider.value) + parseInt(time.value);
                            document.getElementById("startTime").value = "" + slider.value + ":00";
                            if(x == 24){
                                 document.getElementById("endTime").value = "00:00";
                            }else{
                                document.getElementById("endTime").value = "" + x + ":00";
                            }
                        }
                
                        slider.oninput = function() {
                            if(this.value < 10){
                                document.getElementById("startTime").value = "0" + this.value + ":00";
                                var x = parseInt(this.value) + parseInt(time.value);
                                if(x == 24){
                                    document.getElementById("endTime").value = "00:00";
                                }else{
                                    document.getElementById("endTime").value = "" + x + ":00";
                                }
                            }
                            else{ 
                                document.getElementById("startTime").value = "" + this.value + ":00";
                                var x = parseInt(this.value) + parseInt(time.value);
                                if(x == 24){
                                    document.getElementById("endTime").value = "00:00";
                                }else{
                                    document.getElementById("endTime").value = "" + x + ":00";
                                }
                            }
                        }
                    }
                });
                
                // var x = parseInt(slider.value) + maximum;
                // document.getElementById("startTime").value = "" + slider.value + ":00";
                // if(x == 24){
                //     document.getElementById("endTime").value = "00:00";
                // }
                slider.oninput = function() {
                    if(this.value < 10){
                        document.getElementById("startTime").value = "0" + this.value + ":00";
                        var x = parseInt(this.value) + maximum;
                        if(x == 24){
                            document.getElementById("endTime").value = "00:00";
                        }else{
                            document.getElementById("endTime").value = "" + x + ":00";
                        }
                    }
                    else{
                        document.getElementById("startTime").value = "" + this.value + ":00";
                        var x = parseInt(this.value) + maximum;
                        if(x == 24){
                            document.getElementById("endTime").value = "00:00";
                        }else{
                            document.getElementById("endTime").value = "" + x + ":00";
                        }
                    }
                }
                
                function setData(x){
                    style.innerHTML = ".slider::-webkit-slider-thumb { width: " + x + "%; }";
                }
                            $("#update").mouseover(()=>{
                    $("#update").removeClass('color1-2').addClass('color1-3');
                });
                $("#update").mouseout(()=>{
                    $("#update").removeClass('color1-3').addClass('color1-2');
                });
                
                $("#update").click( async (e) =>{
                    e.preventDefault();
                    console.log($("#endTime").val());
                    if($("#startTime").val()!="" && $("#endTime").val()!=""){
                        console.log("here");
                        let start = $("#startTime").val()[0] + $("#startTime").val()[1];
                        let end = $("#endTime").val()[0] + $("#endTime").val()[1];
                        
                        obj.userSettings.scheduleStart = parseInt(start);
                        if(parseInt(end) == 0){
                            obj.userSettings.scheduleEnd = 24;
                        }else{
                            obj.userSettings.scheduleEnd = parseInt(end);
                        }
    
                        console.log(    obj.userSettings);
                        request_updateScheduleTime(obj.user.email, obj.userSettings);
                        obj.setInstance(obj.getInstance());
                        ipcRenderer.send("changeUserInfo");
                    }
                });
                break;
        default:
            console.log("something went wrong in settings//showContents");

    }
}

export function settings_getReady( num){
    $("#container").click( e =>{
        e.stopPropagation();
    });
    settingsPosition = num;
    showContents();
    addJsPart(); 
}