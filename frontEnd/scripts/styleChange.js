import obj from "./file.js";
import { request_weekScores, request_updateHistory, request_addNewHistory, request_updateStyle} from './requests.js';

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

export async function fillPrevStyles(week){
    // go left to the scored week or to the active week
    //check if that week contains score 
        //if not getScore and count 
    //for each next week decrease style by 1 and give 0 performance 
    //change currentStyle and return new Current week getScores
    //finally add currentWeek into history
    //let lastWeek = request_getLastActivatedWeek(currentWeek);
    let start = new Date(week.end);
    let newStart = new Date(start);
    newStart.setDate(newStart.getDate()-7);
    let newEnd = new Date(start);
    newEnd.setDate(newEnd.getDate()-1);
    let newPrevWeek = {
        start: toIsoString(newStart).slice(0, 10),
        end: toIsoString(newEnd).slice(0, 10)
    }
    if(obj.userHistory[week.start+"/"+week.end].first == false){
        let gup= 1;
        while(1){
            let key = newPrevWeek.start+"/"+newPrevWeek.end;
            if( key in obj.userHistory){
                break;
            }else{
                let updatedStart = new Date(newStart);
                updatedStart.setDate(updatedStart.getDate()-7);
                let updatedEnd = new Date(newStart);
                updatedEnd.setDate(updatedEnd.getDate()-1);
                newPrevWeek.start = toIsoString(updatedStart).slice(0, 10);
                newPrevWeek.end = toIsoString(updatedEnd).slice(0, 10);
            }
            gup++;
        }
        if(obj.userHistory[newPrevWeek.start+"/"+newPrevWeek.end].percentage == null){
            let score = await getScores(newPrevWeek);
            obj.userHistory[newPrevWeek.start+'/'+newPrevWeek.end].percentage = score;
            request_updateHistory(obj.user.email, obj.userHistory[newPrevWeek.start+'/'+newPrevWeek.end]);
            obj.setInstance(obj.getInstance());
        }
        let style = obj.userHistory[newPrevWeek.start+"/"+newPrevWeek.end].style;
        if(obj.userHistory[newPrevWeek.start+"/"+newPrevWeek.end].percentage>75){
            style++;
        }else{
            style--;
        }

        let end = new Date(newPrevWeek.end);
        let finalStart = new Date(end);
        finalStart.setDate(finalStart.getDate()+1);
        let finalEnd = new Date(start);
        finalEnd.setDate(finalEnd.getDate()-1);
        let newHistory ={
            startDate: toIsoString(finalStart).slice(0, 10),
            endDate: toIsoString(finalEnd).slice(0, 10),
            style: style,
            first: false,
            percentage: 0,
            weeks: gup
        }
        request_addNewHistory(obj.user.email, newHistory);
        obj.userHistory[newHistory.startDate+'/'+newHistory.endDate] = newHistory;

        for(let i=0; i<gup; i++){
            if(style>1){
                style--;
            }else{
                break;
            }
        }
        
        obj.userSettings.style = style;
        request_updateStyle(obj.user.email, obj.userSettings);

        newHistory ={
            startDate: week.start,
            endDate: week.end,
            style: style,
            first: false,
            percentage: null,
            weeks: 1
        }
        request_addNewHistory(obj.user.email, newHistory);
        obj.userHistory[newHistory.startDate+'/'+newHistory.endDate] = newHistory;
        obj.setInstance(obj.getInstance());

        //create your own
        let today = new Date();
        let period = today.getDay();
        period= (period%7 == 0)?7:period;
        let res = await request_weekScores( obj.user.email, week);
        return res;
    }else{
        let res = await request_weekScores( obj.user.email, week);
        return res;
    }
}

export async function checkOutPrevWeek(week){
    // check if previousWeek has score 
        // if not calculate and update previous Week's percentage by calling previous week getScore
            // change currentStyle
        //add currentWeek into history
        //getScore
        //let string = week.start+'/'+week.end

    let end = new Date(week.end);
    let newStart = new Date(end);
    newStart.setDate(newStart.getDate()+1);
    let newEnd = new Date(end);
    newEnd.setDate(newEnd.getDate()+7);

    if(obj.userHistory[week.start+'/'+week.end].percentage == null){
        let score = await getScores(week);
        obj.userHistory[week.start+'/'+week.end].percentage = score;
        request_updateHistory(obj.user.email, obj.userHistory[week.start+'/'+week.end]);
        

        if(score>75){
            obj.userSettings.style++;
        }else if(score<50 && obj.userSettings.style>1){
            obj.userSettings.style--;
        }
        request_updateStyle(obj.user.email, obj.userSettings);
    
        let newHistory ={
            startDate: toIsoString(newStart).slice(0, 10),
            endDate: toIsoString(newEnd).slice(0, 10),
            style: obj.userSettings.style,
            first: false,
            percentage: null,
            weeks: 1
        }
        request_addNewHistory(obj.user.email, newHistory);
        obj.userHistory[newHistory.startDate+'/'+newHistory.endDate] = newHistory;
        obj.setInstance(obj.getInstance());
    }
    let newWeek = {start:toIsoString(newStart).slice(0, 10), end:toIsoString(newEnd).slice(0, 10)}
    let today = new Date();
    let period = today.getDay();
    period= (period%7 == 0)?7:period;
    let res = await request_weekScores( obj.user.email, newWeek);
    return res;

}

export async function getScores(week){
    //pass request to obtain scores of week
    //obtain result 
    let scores = await request_weekScores( obj.user.email, week);
    console.log(scores);
    let tasks = 0;
    let schedule = 0;
    let notes = 0;
    let count=0
    for(let i =0; i< 7; i++){
        if(obj.userSettings.tasks == true){
            tasks+=scores.tasks[i];
            if(i==6){
                count ++;
            }
        }
        if(obj.userSettings.schedule == true){
            schedule+=scores.schedule[i];
            if(i==6){
                count ++;
            }
        }
        if(obj.userSettings.notes == true){
            notes+=scores.notes[i];
            if(i==6){
                count ++;
            }
        }
    }
    tasks = tasks/7;
    console.log(tasks);
    schedule = schedule/7;
    console.log(schedule);
    notes = notes/7;
    console.log(schedule);
    if(count>0){
        let sum = (tasks+schedule+notes)/count
        console.log(sum);
        return sum;
    }else{
        return 0
    }
}