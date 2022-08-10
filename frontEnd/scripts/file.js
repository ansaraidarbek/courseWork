const remote = require("@electron/remote");
const path = require('path');

const dataPath = remote.app.getPath("userData");
const filePath = path.join(dataPath, "user.json");
const fs = require('fs');

function file_getInfo(){
    console.log("I have read user.json");
    let obj = undefined;
    if (fs.existsSync(filePath)) {
        obj = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
    return obj;
}
  
function file_changeInfo(obj){
    fs.writeFileSync(filePath, JSON.stringify(obj));
}


class Counter{
    constructor(){
        if(Counter.instance == null){
            const obj = file_getInfo();
            if(obj){
                this.user = obj.user;
                this.userHistory = obj.userHistory;
                this.userNotes = obj.userNotes;
                this.userTasks = obj.userTasks;
                this.userNewTasks = obj.userNewTasks;
                this.userSettings = obj.userSettings;
                this.userProfile = obj.userProfile;
                this.userProjects = obj.userProjects;
                this.state = obj.state;
                this.userScore = obj.userScore;
                this.taskMutations = obj.taskMutations;
                this.studyBlocks = obj.studyBlocks;
            }else{
                console.log("no user json");
                this.user = undefined;
                this.userHistory = undefined;
                this.userNotes = undefined;
                this.userTasks = undefined;
                this.userNewTasks = undefined;
                this.userSettings = undefined;
                this.userProfile = undefined;
                this.userProjects = undefined;
                this.state = undefined;
                this.userScore = undefined;
                this.taskMutations = undefined;
                this.studyBlocks = undefined;
            }
            Counter.instance = this;
        }
        return Counter.instance;
    }

    getInstance(){
        return {
            user : this.user,
            userHistory : this.userHistory,
            userNotes : this.userNotes,
            userTasks : this.userTasks,
            userNewTasks : this.userNewTasks,
            userSettings : this.userSettings,
            userProfile : this.userProfile,
            userProjects : this.userProjects,
            state : this.state,
            userScore : this.userScore,
            taskMutations : this.taskMutations,
            studyBlocks : this.studyBlocks
        }
    }

    setInstance(obj){
        file_changeInfo(obj);
        this.user = obj.user;
        this.userHistory = obj.userHistory;
        this.userNotes = obj.userNotes;
        this.userTasks = obj.userTasks;
        this.userNewTasks = obj.userNewTasks;
        this.userSettings = obj.userSettings;
        this.userProfile = obj.userProfile;
        this.userProjects = obj.userProjects;
        this.state = obj.state;
        this.userScore = obj.userScore
        this.taskMutations = obj.taskMutations;
        this.studyBlocks = obj.studyBlocks
    }

}

const obj = new Counter();
export default obj;
  
