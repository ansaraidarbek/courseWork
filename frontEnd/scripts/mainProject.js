import obj from './file.js';

class Counter{
    constructor(){
        if(Counter.instance == null){
            // let mainProject = JSON.parse(sessionStorage.getItem("mainProject"));
            // if(!mainProject){
            //     sessionStorage.setItem("mainProject", JSON.stringify({"color":`${this.color}`,"keyword":`${this.keyWord}` }));
            // }else{
            //     this.color = mainProject.color;
            //     this.keyWord = mainProject.keyWord;
            // }
            let project = JSON.parse(sessionStorage.getItem("mainProject"));
            if(project){
                this.color = project.color;
                this.keyWord = project.keyWord;
            }else{
                let mainStyle = 'style' + obj.userSettings.style;
                this.color = obj.userProjects["A"][mainStyle];
                this.keyWord = "A";
                sessionStorage.setItem("mainProject", JSON.stringify({"color":`${this.color}`,"keyWord":`${this.keyWord}` }));
            }
            Counter.instance = this;
        }
        return Counter.instance;
    }

    changeProject(newKeyWord){
        let mainStyle = 'style' + obj.userSettings.style;
        let newColor = obj.userProjects[newKeyWord][mainStyle];
        
        //change Sidebar
        $("#sidebar").removeClass(`color${this.color}-through`);
        $("#sidebar").removeClass(`color${this.color}-2`);
        if($("#sidebar-addProject").hasClass((`color${mainProject.color}-3`))){
            $("#sidebar-addProject").removeClass(`color${mainProject.color}-3`);
            $("#sidebar-addProject").addClass(`color${newColor}-3`);
        }
        let some = document.querySelectorAll(".bottomLine");
        some.forEach(line =>{
            line.classList.remove(`color${this.color}-toolNameLine`)
        });
        $("#circle1").removeClass(`color${this.color}-circle1`);
        $("#circle2").removeClass(`color${this.color}-circle2`);
        $("#circle3").removeClass(`color${this.color}-circle2`);
        $("#circle4").removeClass(`color${this.color}-circle2`);
        $("#circle5").removeClass(`color${this.color}-mainCircle1`);
        $("#circle6").removeClass(`color${this.color}-mainCircle2`);
        $("body").removeClass(`color${this.color}-backGround`);

        //change Projects
        for(let i=0; i<6; i++){
            $("#projects-container" + i).removeClass(`color${this.color}-through`);
            $("#mainProject" + i).removeClass(`color${this.color}-back`);
            $("#forBest" + i).removeClass(`scroll${this.color}`);
        }

        //change Tasks
        $("#leftTaskList").removeClass(`scroll${this.color}`);
        $("#middleTaskList").removeClass(`scroll${this.color}`);
        $("#rightTaskList").removeClass(`scroll${this.color}`);
        $("#leftFront").removeClass(`color${this.color}-3`);
        $("#rightFront").removeClass(`color${this.color}-3`);
        $("#middleBack").removeClass(`color${this.color}-2`);
        $("#middleFront").removeClass(`color${this.color}-3`);
        $("#addNewTask").removeClass(`color${this.color}-3`);
        $("#midAddTask").removeClass(`color${this.color}Back`);

        //change Schedule
        for(let i=0; i<8; i++){
            $("#column"+i).html("");
            $("#column"+i).removeClass(`color${this.color}-1`)
            $("#column"+i).removeClass(`color${this.color}-2`);
            $("#dayBlock"+i).removeClass(`color${this.color}-3`);
            $("#dayBlock"+i).html("");
        }
        $("#column0").html(` <div class="schedule-blockSpace" id="dayBlock0"></div>`);
        for(let i=0; i<9; i++){
            $("#line"+i).removeClass(`color${this.color}-3`);
        }
        for (let i=1; i<7; i++){
            for (let j=1; j<8; j++){
                $("#r"+i+"c"+j).removeClass(`color${this.color}-2`);
            }
        }
        $("#finishLine").removeClass(`color${this.color}-2`);
        $("#horizontalLines").html("");
        $("#weekCalendar").removeClass(`scroll${this.color}`);
        $("#todayTaskList").removeClass(`scroll${this.color}`);
        $("#addTask").removeClass(`color${this.color}-2`);
        $("#leftButton").removeClass(`color${this.color}-1`);
        $("#rightButton").removeClass(`color${this.color}-1`);
        $("#calendar").removeClass(`color${this.color}-1`);

        //change Notes
        $("#mainWindow").removeClass(`color${this.color}-2`);
        $("#addButton").removeClass(`color${this.color}-2`);
        $("#notes-list").removeClass(`scroll${this.color}`);
        $("#noteButton").removeClass(`color${this.color}Back1`);

        //change menu
        $("#menuRight1").removeClass(`color${this.color}-2`);
        $("#menuRight2").removeClass(`color${this.color}-2`);
        $("#menuMiddle1").removeClass();
        $("#menuMiddle2").removeClass();
        $("#menuMiddle1").addClass("menufirstNoteBlock");
        $("#menuMiddle2").addClass("menusecondNoteBlock");
        $("#menuMiddle3").removeClass(`color${this.color}-2`);
        $("#menuMiddle4").removeClass(`color${this.color}-3`);
        $("#menuAddNewTask").removeClass(`color${this.color}-3`);
        $("#menuLeft1").removeClass(`color${this.color}-2`);
        $("#menuLeft2").removeClass(`color${this.color}-2`);
        $("#menuLeft3").removeClass(`color${this.color}-2`);
        $("#menumidAddTask").removeClass(`color${this.color}Back2`);
        for(let i=0; i<5; i++){
            $("#menuScheduleFine"+i).removeClass(`color${this.color}-4`);
        }
        $("#menuScheduleColumn").removeClass(`scroll${this.color}`);

        
        this.color = newColor;
        this.keyWord = newKeyWord;
        sessionStorage.setItem("mainProject", JSON.stringify({"color":`${this.color}`,"keyWord":`${this.keyWord}` }));
    }
    

}

const mainProject = new Counter();
export default mainProject;