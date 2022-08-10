from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from datetime import datetime, date, timedelta
import tabula
import pandas as pd
import speech_recognition as sr
import base64
import pytz
import os

#create connection between flask and database 
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = "mysql://root:Noragami123857694@localhost/flask"
# app.config['SQLALCHEMY_DATABASE_URI'] = "mysql://root:Db,4^pUJ=!l^40C:9twP94[1P$^GOa4l@ls-b28bf22337059b4149975138b8b87b33d8dbd660.c3tme29gsh1i.eu-central-1.rds.amazonaws.com/flask"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
ma = Marshmallow(app)

#create database tables 
#User
#Project
#Tasks
#Notes


class User(db.Model):
    __tablename__ = 'User'
    email = db.Column(db.String(35), primary_key = True)
    password = db.Column(db.String(100), nullable = False)
    name = db.Column(db.String(45), nullable = False)
    surname = db.Column(db.String(45), nullable = False)
    # child1 = db.relationship('Project', lazy=True)
    # child = db.relationship('Profile', backref ="User")
    # child2 = db.relationship('Settings', backref ="User")
    def __init__(self, email, password, name, surname):
        self.email = email
        self.password = password
        self.name = name
        self.surname = surname

class Profile(db.Model):
    __tablename__ = 'Profile'
    user_email = db.Column(db.String(100), db.ForeignKey('User.email'), nullable = False, primary_key = True)
    # parrent = db.relationship('User', backref ="Profile", uselist=False)
    gender = db.Column(db.String(1))
    age = db.Column(db.Integer)
    about = db.Column(db.Text)
    work = db.Column(db.Text)
    study = db.Column(db.Text)
    photo = db.Column(db.LargeBinary)
    def __init__(self, user_email, gender, age, about, work, study, photo):
        self.user_email = user_email
        self.gender = gender
        self.age = age
        self.about = about
        self.work = work
        self.study = study
        self.photo = photo

class Settings(db.Model):
    __tablename__ = 'Settings'
    user_email = db.Column(db.String(100), db.ForeignKey('User.email'), nullable = False, primary_key = True)
    tasks = db.Column(db.Boolean, nullable = False, default = False)
    notes = db.Column(db.Boolean, nullable = False, default = False)
    schedule = db.Column(db.Boolean, nullable = False, default = False)
    scheduleStart = db.Column(db.Integer, nullable = False, default = 6)
    scheduleEnd = db.Column(db.Integer, nullable = False, default = 22)
    style = db.Column(db.Integer, nullable = False)
    upperStyle = db.Column(db.Integer, nullable = False, default = 1)
    maxUpperStyle = db.Column(db.Integer, nullable = False, default = 1)
    # parrent = db.relationship('User', backref ="Settings", uselist=False)
    def __init__(self, user_email, style):
        self.user_email = user_email
        self.style = style

class Project(db.Model):
    __tablename__ = 'Project'
    keyWord = db.Column(db.String(2), primary_key = True)
    name = db.Column(db.String(50), nullable = False)
    user_email = db.Column(db.String(100), db.ForeignKey('User.email'), nullable = False, primary_key = True)
    style1 = db.Column(db.String(50), nullable = False)
    style2 = db.Column(db.String(50), nullable = False)
    style3 = db.Column(db.String(50), nullable = False)
    style4 = db.Column(db.String(50), nullable = False)
    valid = db.Column(db.Boolean, nullable = False, default = True)
    lastOneFirst = db.Column(db.String(52), nullable = True, default = None)
    lastOneSecond = db.Column(db.String(52), nullable = True, default = None)
    def __init__(self, user_email, keyWord, name, style1, style2, style3, style4):
        self.keyWord = keyWord
        self.name = name
        self.user_email = user_email
        self.style1 = style1
        self.style2 = style2
        self.style3 = style3
        self.style4 = style4

class History(db.Model):
    __tablename__ = 'History'
    user_email = db.Column(db.String(100), db.ForeignKey('User.email'), nullable = False, primary_key = True)
    startDate = db.Column(db.Date, primary_key = True)
    endDate = db.Column(db.Date, primary_key = True)
    style = db.Column(db.Integer, nullable = False)
    first = db.Column(db.Boolean, nullable = False)
    percentage = db.Column(db.Float, nullable = True)
    weeks = db.Column(db.Integer, nullable = False)
    def __init__(self, user_email, startDate, endDate, first, percentage, style, weeks):
        self.startDate = startDate
        self.endDate = endDate
        self.first = first
        self.percentage = percentage
        self.style = style
        self.user_email = user_email
        self.weeks = weeks


class Tasks(db.Model):
    __tablename__ = 'Tasks'
    id = db.Column(db.Integer, primary_key = True)
    text = db.Column(db.String(200), nullable = False)
    date = db.Column(db.Date, primary_key = True, index=True)
    project_keyWord = db.Column(db.String(2), nullable = False, primary_key = True)
    user_email = db.Column(db.String(100), nullable = False, primary_key = True)
    stage = db.Column(db.Float, nullable = False, default = 0)
    start = db.Column(db.Time)
    end = db.Column(db.Time)
    innerBound = db.Column(db.Integer, nullable = False, default = 0)
    outerBound = db.Column(db.Integer, nullable = False, default = 0)
    mutations = db.Column(db.String(100))
    contains = db.Column(db.Boolean, nullable = False)
    music = db.Column(db.Boolean, nullable = False)

    #complex_id_rel = db.relationship("Complex", foreign_keys=[complex_id and user_email])
    #user_email_rel = db.relationship("Complex", foreign_keys=[user_email])
    def __init__(self, user_email, id, text, date, project_keyWord, start, end, mutations, contains, music):
        self.id = id
        self.text = text
        self.date = date
        self.project_keyWord = project_keyWord
        self.user_email = user_email
        self.start = start
        self.end = end
        self.mutations = mutations
        self.contains = contains
        self.music = music


class StudyBlock(db.Model):
    __tablename__ = 'StudyBlock'
    id = db.Column(db.Integer, primary_key = True)
    task_id = db.Column(db.Integer, nullable = False, primary_key = True)
    task_date = db.Column(db.Date, nullable = False, primary_key = True)
    project_keyWord = db.Column(db.String(2), nullable = False, primary_key = True)
    user_email = db.Column(db.String(100), nullable = False, primary_key = True)
    requestType =  db.Column(db.String(100), nullable = False)
    requestLink =  db.Column(db.Text, nullable = False)
    def __init__(self, user_email, id, project_keyWord, requestType, requestLink, task_id, task_date):
        self.id = id
        self.user_email = user_email
        self.requestType = requestType
        self.project_keyWord = project_keyWord
        self.requestLink = requestLink
        self.task_id = task_id
        self.task_date = task_date

class Notes(db.Model):
    __tablename__ = 'Notes'
    id = db.Column(db.Integer, primary_key = True)
    title = db.Column(db.String(50), nullable = False)
    text = db.Column(db.Text, nullable = False)
    project_keyWord = db.Column(db.String(2), nullable = False)
    user_email = db.Column(db.String(100), nullable = False, primary_key = True)
    date = db.Column(db.Date, nullable = False)
    path = db.Column(db.String(50),nullable = False, primary_key = True)
    pictures = db.Column(db.String(6),nullable = False,default = '000000')
    videos = db.Column(db.String(6), nullable = False,default = '000000')
    audios = db.Column(db.String(6), nullable = False,default = '000000')
    ref1 = db.Column(db.Boolean, nullable = False)
    ref2 = db.Column(db.Boolean, nullable = False)
    ref3 = db.Column(db.Boolean, nullable = False)
    def __init__(self, user_email, id, title, text, project_keyWord, date, path, ref1, ref2, ref3):
        self.id = id
        self.title = title
        self.text = text
        self.user_email = user_email
        self.path = path
        self.project_keyWord = project_keyWord
        self.date = date
        self.ref1 = ref1
        self.ref2 = ref2
        self.ref3 = ref3

#create marshmallows to jsonify database data
#UserSchema
#ProjectSchema
#HistorySchema
#TasksSchema
#NotesSchema


class UserSchema(ma.Schema):
    class Meta:
        fields = ( 'email', 'password', 'name', 'surname' )
class FullUserSchema(ma.Schema):
    class Meta:
        fields = ('email', )#, 'name', 'surname', 'password', 'tasks', 'notes', 'schedule', 'gender', 'age', 'about', 'work', 'study', 'photo', 'update', 'style')
class ProfileSchema(ma.Schema):
    class Meta:
        fields = ('gender', 'age', 'about', 'work', 'study', 'photo')
class SettingsSchema(ma.Schema):
    class Meta:
        fields = ('tasks', 'notes', 'schedule', 'scheduleStart', 'scheduleEnd', 'style', 'upperStyle', 'maxUpperStyle')
class ProjectSchema(ma.Schema):
    class Meta:
        fields = ('keyWord', 'name', 'style1', 'style2', 'style3', 'style4', 'valid', 'lastOneFirst', 'lastOneSecond')
class HistorySchema(ma.Schema):
    class Meta:
        fields = ( 'startDate', 'endDate', 'percentage', 'style', 'first', 'weeks')
class TasksSchema(ma.Schema):
    class Meta:
        fields = ('id', 'text', 'date', 'project_keyWord', 'stage', 'start', 'end', 'mutations', 'innerBound', 'outerBound', 'contains', 'music')
class NotesSchema(ma.Schema):
    class Meta:
        fields = ('id', 'title', 'text', 'project_keyWord', 'date', 'pictures', 'videos', 'audios', 'path', 'ref1', 'ref2', 'ref3')
class StudyBlockSchema(ma.Schema):
    class Meta:
        fields = ('id', 'task_id', 'task_date', 'project_keyWord', 'requestType', 'requestLink', 'task_id', 'task_date')
user_schema = UserSchema()
user_schemas = FullUserSchema(many = True)
profile_schema = ProfileSchema()
settings_schema = SettingsSchema()
project_schema = ProjectSchema()
project_schemas = ProjectSchema(many = True)
history_schema = HistorySchema()
history_schemas = HistorySchema(many = True)
tasks_schema = TasksSchema()
tasks_schemas = TasksSchema(many = True)
notes_schema = NotesSchema()
notes_schemas = NotesSchema(many = True)
studyBlock_schema = StudyBlockSchema()
studyBlock_schemas = StudyBlockSchema(many = True)



# def obtainYearMonth(str):
#     return str[0] + str[1] + str[2] + str[3] + "/" + str[5]+ str[6]

# def obtainDay(str):
#     string = str[8]+str[9]
#     return int(string)

def toMinute(str):
    return str[0] + str[1] + str[2] + str[3] + str[4]

# def addTask(array, day, task, color):
#     for oneDay in array:
#         if(oneDay["number"] == day):
#             oneDay["dayTasks"]["taskCounter"] = oneDay["dayTasks"]["taskCounter"] +1
#             found = False
#             for info in oneDay["dayTasks"]["info"]:
#                 if (info["project"] == task["project_keyWord"]):
#                     info["maxId"] = info["maxId"] + 1
#                     found = True
#             if found == False:
#                 oneDay["dayTasks"]["info"].append({
#                 "project" : task["project_keyWord"],
#                 "maxId" : 2,
#                 "projectColor" : color
#             })
#             if(task["start"] != None):
#                 startMinute = toMinute(task["start"])
#                 endMinute = toMinute(task["end"])
#                 closeInterval = startMinute + "-" + endMinute
#                 oneDay["closedSlots"].append(closeInterval)
#             if(task["stage"] == 0):
#                 array[-1]["dayTasks"]["tasks"][2].append(task)
#             elif(task["stage"] == 1):
#                 array[-1]["dayTasks"]["tasks"][0].append(task)
#             else:
#                 array[-1]["dayTasks"]["tasks"][1].append(task)
#             return array
#     closedSlot = []
#     if(task["start"] != None):
#         startMinute = toMinute(task["start"])
#         endMinute = toMinute(task["end"])
#         closeInterval = startMinute + "-" + endMinute
#         closedSlot.append(closeInterval)
#     array.append(
#         {   "number" : day,
#             "closedSlots" : closedSlot,
#             "dayTasks" : {
#                 "taskCounter" : 1, 
#                 "info" : [{
#                     "project" : task["project_keyWord"],
#                     "maxId" : 2,
#                     "projectColor" : color
#                     }],
#                 "tasks" : [[], [], []],
#                 }
#             }
#                 )
#     if(task["stage"] == 0):
#         array[-1]["dayTasks"]["tasks"][2].append(task)
#     elif(task["stage"] == 1):
#         array[-1]["dayTasks"]["tasks"][0].append(task)
#     else:
#         array[-1]["dayTasks"]["tasks"][1].append(task)
#     return array




# def minimum(string1, string2):
#     if(string2 < string1):
#         return False
#     else:
#         return True

def convertToMinutes(start, end):
    startHours = start[0]+start[1]
    startMinutes = start[3]+start[4]
    endHours = end[0]+end[1]
    endMinutes = end[3]+end[4]
    diff = ((int(endHours)*60)+int(endMinutes))-((int(startHours)*60)+int(startMinutes))
    return diff
#--------------------------------------------------------------------------------- LOGIN ----------------------------------------------------------------------------------
#Login: search if such email exists and if the password is correct
@app.route('/getUser/<email>', methods = ['GET'])
def get_user(email):
    result = User.query.get(email)
    return user_schema.jsonify(result)


#Login: take every needfull information about user account
@app.route('/getAllInfo/<email>', methods = ['GET'])
def get_allInfo(email):
    user = User.query.get(email)
    profile = Profile.query.get(email)
    settings = Settings.query.get(email)
    projects = Project.query.filter_by(user_email = email)
    history = History.query.filter_by(user_email = email)
    notes = Notes.query.order_by(Notes.path).filter_by(user_email = email)
    tasks = Tasks.query.order_by(Tasks.date, Tasks.stage.desc()).filter_by(user_email = email)
    studyBlocks = StudyBlock.query.filter_by(user_email = email)
    tasksList = tasks_schemas.dump(tasks)
    notesList = notes_schemas.dump(notes)
    studyBlocksList = studyBlock_schemas.dump(studyBlocks)
    projectList = project_schemas.dump(projects)
    historyList = history_schemas.dump(history)
    userDefinedSettings = settings_schema.dump(settings)
    # alm = pytz.timezone('Asia/Almaty')
    # currentTime = datetime.now(alm)
    # currentYear = currentTime.year
    # currentMonth = currentTime.month
    # newCurrentMonth = str(currentMonth)
    # if(currentMonth<10):
    #     newCurrentMonth = "0" + newCurrentMonth
    # curentYearMonth = str(currentYear) + "/" + newCurrentMonth
    # anotherProjectList = []
    # data = []
    # currentIndex = 0
    # arrLength = 0
    # stop = False
    # dayCount = None
    # for task in tasksList:
    #     color = None
    #     if(dayCount == None or dayCount!= task["date"]):
    #         anotherProjectList.clear()
    #     if(task["project_keyWord"] not in anotherProjectList):
    #         anotherProjectList.append(task["project_keyWord"])
    #         style = userDefinedSettings["style"]
    #         for project in projectList:
    #             if project["keyWord"] == task["project_keyWord"]:
    #                 style = "style" + str(style)
    #                 color = project[style]
    #     dayCount = task["date"]

    #     yearMonth = obtainYearMonth(task["date"])
    #     day = obtainDay(task["date"])
    #     if not data or data[-1]["date"]!= yearMonth:
    #         arrLength = arrLength + 1
    #         if not stop and not minimum(curentYearMonth, yearMonth):
    #             currentIndex = currentIndex + 1
    #         else:
    #             stop = True
    #         arr = addTask([], day, task, color)
    #         element = {
    #             "date" : yearMonth,
    #             "dayArray" : arr
    #         }
    #         data.append(element)
    #     else:
    #         data[-1]["dayArray"] = addTask(data[-1]["dayArray"], day, task, color)

    # finalData = {
    #     "data" : data,
    #     "currentIndex" : currentIndex,
    #     "arrayLength" : arrLength
    # }

    newProjects = {}
    for project in projectList:
        newProjects[project["keyWord"]] = project

    newTasks = {}
    mutations = {}
    for task in tasksList:
        if(task["date"] in newTasks):
            if(task["project_keyWord"] in newTasks[task["date"]]):
                newMaxId = newTasks[task["date"]][task["project_keyWord"]]+1
                newTasks[task["date"]][task["project_keyWord"]] = newMaxId
            else:
                newTasks[task["date"]][task["project_keyWord"]] = 2
            if(task["stage"] == 0):
                newTasks[task["date"]]["tasks"][0].append(task)
            elif(task["stage"] == 1):
                newTasks[task["date"]]["tasks"][1].append(task)
            else:
                newTasks[task["date"]]["tasks"][2].append(task)
            if(task["start"] != None):
                startMinute = toMinute(task["start"])
                endMinute = toMinute(task["end"])
                closeInterval = startMinute + "-" + endMinute
                newTasks[task["date"]]["closedSlots"].append(closeInterval)
        else:
            closedSlot = []
            if(task["start"] != None):
                startMinute = toMinute(task["start"])
                endMinute = toMinute(task["end"])
                closeInterval = startMinute + "-" + endMinute
                closedSlot.append(closeInterval)
            newTaskBlock = {
            }
            newTaskBlock[task["project_keyWord"]] = 2
            newTaskBlock["tasks"] = [[],[],[]]
            if(task["stage"] == 0):
                newTaskBlock["tasks"][0].append(task)
            elif(task["stage"] == 1):
                newTaskBlock["tasks"][1].append(task)
            else:
                newTaskBlock["tasks"][2].append(task)
            newTaskBlock["closedSlots"] = closedSlot
            
            newTasks[task["date"]] = newTaskBlock
        if(task["mutations"]!= None):
            if(task["mutations"] not in mutations):
                mutations[task["mutations"]] = {}
            some = task["date"]+"/"+task["project_keyWord"]+ "/" + str(task["id"])
            mutations[task["mutations"]][some] = {"date":task["date"], "project_keyWord":task["project_keyWord"], "id":task["id"]}
    
    newNotes= {
        "remember3" : [],
        "remember2" : [],
        "remember1" : [],
        "path" : {}
    }
    alm = pytz.timezone('Asia/Almaty')
    currentTime = datetime.now(alm)
    currentTimeIso = date(currentTime.year, currentTime.month, currentTime.day)
    for note in notesList:
        # nextDate = date.fromisoformat(note["date"])
        nextDate = datetime.strptime(note["date"], "%Y-%m-%d") 
        newDate = date(nextDate.year, nextDate.month, nextDate.day)
        delta = currentTimeIso - newDate
        if(delta == 1):
            newNotes["remember1"].append({"path":note["path"],"id": note['id'],"title": note["title"]})
        elif(delta == 7):
            newNotes["remember2"].append({"path":note["path"],"id": note['id'],"title": note["title"]})
        elif(delta == 14):
            newNotes["remember2"].append({"path":note["path"],"id": note['id'],"title": note["title"]})
        if(note["path"] in newNotes["path"]):
            newNotes["path"][note["path"]][note["id"]] = {
                "data" : note,
                "children" : []
            }
        else:
            newNotes["path"][note["path"]] = { note["id"] : {"data" : note,"children" : [] }}
        length = len(note["path"])
        if(length>2):
            newPath = note["path"][:length-2]
            parentId = note["path"][length-2:length-1]
            newNotes['path'][newPath][int(parentId)]["children"].append({"path":note["path"],"id": note['id'],"title": note["title"]})

    newHistory = {}
    for hist in historyList:
        newHistory[hist["startDate"]+"/"+hist["endDate"]] = hist

    newStudyBlock = {}
    for studyBlock in studyBlocksList:
        some = studyBlock["task_date"]+"/"+studyBlock["project_keyWord"]+ "/" + str(studyBlock["task_id"])
        if(some not in newStudyBlock):
            newStudyBlock[some] = {
                "tool" : [],
                "file" : [],
                "link" : [],
                "maxId" : 1
            }
        newStudyBlock[some][studyBlock["requestType"]].append(studyBlock)
        newStudyBlock[some]["maxId"] = max(newStudyBlock[some]["maxId"], studyBlock["id"])+1

    return jsonify({"user" : user_schema.dump(user),
                    "userProfile" : profile_schema.dump(profile),
                    "userSettings" : settings_schema.dump(settings),
                    "userProjects" : newProjects,
                    "userHistory" : newHistory,
                    "userNotes" : newNotes,
                    "userNewTasks" : newTasks,
                    "state" : 0 ,
                    "userScore": None,
                    "taskMutations": mutations,
                    "studyBlocks": newStudyBlock})


#Register: check if the user exists, and add him if not 
@app.route('/weekScores/<email>/<startDate>/<endDate>', methods = ['GET'])
def get_weekScores(email, startDate, endDate):
    scores = {
        "tasks" : [],
        "schedule":[],
        "notes":[]
    }
    for i in range(7):
        newDate = datetime.strptime(startDate, "%Y-%m-%d")+timedelta(days=i)
        weekDay = date(newDate.year, newDate.month, newDate.day)
        tasks = Tasks.query.filter(Tasks.user_email==email, Tasks.date == weekDay)
        prevDate1 = newDate- timedelta(days=1)
        prevDay1 = date(prevDate1.year, prevDate1.month, prevDate1.day)
        notes1 = Notes.query.filter(Notes.user_email==email, Notes.date==prevDay1)
        prevDate2 = newDate- timedelta(days=7)
        prevDay2 = date(prevDate2.year, prevDate2.month, prevDate2.day)
        notes2 = Notes.query.filter(Notes.user_email==email, Notes.date==prevDay2)
        prevDate3 = newDate- timedelta(days=14)
        prevDay3 = date(prevDate3.year, prevDate3.month, prevDate3.day)
        notes3 = Notes.query.filter(Notes.user_email==email, Notes.date==prevDay3)
        tasksList = tasks_schemas.dump(tasks)
        notesList1 = notes_schemas.dump(notes1)
        notesList2 = notes_schemas.dump(notes2)
        notesList3 = notes_schemas.dump(notes3)
        count=0
        done=0
        countTasksMinutes = 0
        countDoneTasksMinutes = 0
        for task in tasksList:
            count = count+1
            if(task["stage"] == 1):
                done=done+1
            if(task["start"]!=None):
                taskMinutes = convertToMinutes(task["start"], task["end"])
                countTasksMinutes = countTasksMinutes + taskMinutes
                if(task["contains"]== True):
                    countDoneTasksMinutes = max((task["innerBound"]-task["outerBound"]), 0) + countDoneTasksMinutes
                else:
                    if(task["stage"]==1):
                        doneTaskMinutes = convertToMinutes(task["start"], task["end"])
                        countDoneTasksMinutes = countDoneTasksMinutes + doneTaskMinutes
        notRevisedNotes = 0
        totalNotes = 0
        for note in notesList1:
            totalNotes = totalNotes +1
            if(note["ref1"] == False):
                notRevisedNotes = notRevisedNotes+1
        for note in notesList2:
            totalNotes = totalNotes +1
            if(note["ref2"] == False):
                notRevisedNotes = notRevisedNotes+1
        for note in notesList3:
            totalNotes = totalNotes +1
            if(note["ref3"] == False):
                notRevisedNotes = notRevisedNotes+1

        minTasks = min(count, 10)
        maxTasks = max(minTasks, 3)
        overall = done/maxTasks
        minDayTasks = min(overall, 1)
        scores["tasks"].append(minDayTasks)
        if(countTasksMinutes!=0):
            taskHours = countDoneTasksMinutes/countTasksMinutes
        else:
            taskHours = 0.7
        scores["schedule"].append(taskHours)
        if(totalNotes!=0):
            notesRecup = (100-(100*(notRevisedNotes/totalNotes)))/100
        else:
            notesRecup=0.7
        scores["notes"].append(notesRecup)
        

    return jsonify(scores)

#Login: add new history
@app.route('/addNewHistory/<email>', methods = ['POST'])
def add_newHistory(email):
    hist = History(email, request.json["startDate"], request.json["endDate"], request.json["first"], request.json["percentage"], request.json["style"], request.json["weeks"])
    db.session.add(hist)
    db.session.commit()
    return history_schema.jsonify(hist)

#change user info
@app.route('/updateHistory/<email>', methods = ['PUT'])
def update_history(email):
    hist = History.query.filter_by(user_email=email, startDate = request.json["startDate"], endDate = request.json["endDate"]).first()
    hist.percentage = request.json["percentage"]
    db.session.commit()
    return history_schema.jsonify(hist)

#change user info
@app.route('/updateStyle/<email>', methods = ['PUT'])
def update_style(email):
    user = Settings.query.get(email)
    user.style = request.json['style']
    db.session.commit()
    return settings_schema.jsonify(user)

#--------------------------------------------------------------------------------- LOGIN ----------------------------------------------------------------------------------


#--------------------------------------------------------------------------------- REGISTER ----------------------------------------------------------------------------------

#Register: check if the user exists, and add him if not 
@app.route('/getAllUsers', methods = ['GET'])
def get_userEmails():
    all_users = User.query.all()
    return user_schemas.jsonify(all_users)

#Register: add user
@app.route('/addUser', methods = ['POST'])
def add_user():
    alm = pytz.timezone('Asia/Almaty')
    currentTime = datetime.now(alm)
    today = date(currentTime.year, currentTime.month, currentTime.day)
    first = User( request.json['email'], request.json['password'], request.json['name'], request.json['surname'])
    second = Project( request.json['email'], "A", "All Projects", "1", "1", "1", "1")
    third = Settings(request.json['email'], 1)
    fourth = History(request.json["email"], request.json["weekStart"], request.json["weekEnd"], True, None, 1, 1)
    db.session.add(first)
    db.session.commit()
    db.session.add(second)
    db.session.add(third)
    db.session.add(fourth)
    db.session.commit()
    return jsonify({"created" : True})

#--------------------------------------------------------------------------------- REGISTER ----------------------------------------------------------------------------------


#--------------------------------------------------------------------------------- SIDEBAR ----------------------------------------------------------------------------------

#change user info
@app.route('/updateUser/<email>', methods = ['PUT'])
def update_user(email):
     user = User.query.get(email)
     user.password = request.json["password"]
     user.name=request.json["name"]
     user.surname=request.json["surname"]
     db.session.commit()
     return user_schema.jsonify(user)

#update user tools
@app.route('/updateTools/<email>', methods = ['PUT'])
def update_tools(email):
    user = Settings.query.get(email)
    user.tasks = request.json['tasks']
    user.schedule  = request.json['schedule']
    user.notes = request.json['notes']
    db.session.commit()
    print(request.json['tasks'])
    return settings_schema.jsonify(user)

#update schedule time
@app.route('/updateSchedule/<email>', methods = ['PUT'])
def update_schedule(email):
    user = Settings.query.get(email)
    user.scheduleEnd = request.json['scheduleEnd']
    user.scheduleStart  = request.json['scheduleStart']
    db.session.commit()
    return settings_schema.jsonify(user)

#--------------------------------------------------------------------------------- SIDEBAR ----------------------------------------------------------------------------------

#--------------------------------------------------------------------------------- DELETE ----------------------------------------------------------------------------------

@app.route('/deleteTask/<userEmail>/<date>/<projectKeyWord>/<id>', methods = ['DELETE'])
def delete_simpleTask(userEmail, date, projectKeyWord, id):
    tasks = Tasks.query.order_by(Tasks.id).filter_by(user_email = userEmail, project_keyWord=projectKeyWord, date=date)
    for task in tasks:
        if task.id == int(id):
            mainTask = task
            blocks = StudyBlock.query.filter_by(user_email = userEmail, project_keyWord = projectKeyWord, task_date = date, task_id = id)
            for block in blocks:
                db.session.delete(block)
            db.session.delete(task)
            db.session.commit()
        elif task.id > int(id):
            blocks = StudyBlock.query.filter_by(user_email = userEmail, project_keyWord = projectKeyWord, task_date = date, task_id = task.id)
            task.id = task.id-1
            for block in blocks:
                block.task_id = block.task_id-1
            db.session.commit()
    return tasks_schema.jsonify(mainTask)

#Notes: delete the note of specific user
@app.route('/deleteNote/<email>/<path>/<id>', methods = ['DELETE'])
def delete_notes(email, id, path):
    notes = Notes.query.order_by(Notes.path).filter_by(user_email = email)
    fullPath = path+id+"-"
    level = len(fullPath)
    for note in notes:
        stringNote = notes_schema.dump(note)
        length = len(stringNote["path"])
        if note.path == path and note.id == int(id):
            mainNote = note
            db.session.delete(note)
            db.session.commit()
        elif fullPath in stringNote["path"] :
            db.session.delete(note)
            db.session.commit()
        elif note.path == path and note.id>int(id):
            note.id=note.id-1
        elif length>=level and stringNote["path"][level-2]>id:
            num = int(stringNote["path"][level-2])-1
            newString = stringNote["path"][:level-2]+str(num)+stringNote["path"][level-1:]
            note.path =  newString

    db.session.commit()
    return notes_schema.jsonify(mainNote)
#--------------------------------------------------------------------------------- DELETE ----------------------------------------------------------------------------------

#--------------------------------------------------------------------------------- TASKS ----------------------------------------------------------------------------------

@app.route('/updateTask/<email>', methods = ['PUT'])
def update_TaskStage(email):
    id = request.json['id']
    projectKeyWord = request.json['project_keyWord']
    stage = request.json['stage']
    date = request.json['date']
    contains = request.json['contains']
    innerBound = request.json['innerBound']
    outerBound = request.json['outerBound']
    text = request.json['text']
    mutations = request.json['mutations']
    start = request.json['start']
    end = request.json['end']
    simpleTask = Tasks.query.filter_by(user_email = email, project_keyWord=projectKeyWord, id = id, date = date).first()
    simpleTask.stage = stage
    simpleTask.innerBound = innerBound
    simpleTask.outerBound = outerBound
    simpleTask.text = text
    simpleTask.mutations = mutations
    simpleTask.contains = contains
    simpleTask.start = start
    simpleTask.end = end
    db.session.commit()
    return tasks_schema.jsonify(simpleTask)

@app.route('/addTask/<email>', methods = ['POST'])
def add_Task(email):
    user_tasks = Tasks(email, request.json['id'], request.json['text'], request.json['date'], request.json['project_keyWord'], request.json['start'], request.json['end'], request.json['mutations'], request.json['contains'], request.json['music'])
    db.session.add(user_tasks)
    db.session.commit()
    return tasks_schema.jsonify(user_tasks)

#--------------------------------------------------------------------------------- TASKS ----------------------------------------------------------------------------------


#--------------------------------------------------------------------------------- NOTES ----------------------------------------------------------------------------------

#add note to notes
@app.route('/addNote/<email>', methods = ['POST'])
def add_note(email):
    user_notes = Notes(email, request.json['id'], request.json['title'], request.json['text'], request.json['project_keyWord'], request.json['date'], request.json['path'], request.json['ref1'], request.json['ref2'], request.json['ref3'])
    db.session.add(user_notes)
    db.session.commit()
    return notes_schema.jsonify(user_notes)

#get audio
@app.route('/convertToText/<email>/<path>', methods = ['POST'])
def convertToText(email, path):
    file = request.form['file']
    # file_name = request.form['fileName']
    # file = request.json['code']
    wav_file = open(email+path+".wav", "wb")
    decode_string = base64.b64decode(file)
    wav_file.write(decode_string)
    filename = email+path+".wav"
    r = sr.Recognizer()
    with sr.AudioFile(filename) as source:
        audio_data = r.record(source)
        print(audio_data)
        text = r.recognize_google(audio_data)
    # os.remove(filename)
    return jsonify({"data": text})

#Notes: update the note of specific user
@app.route('/updateNote/<email>', methods = ['PUT'])
def update_note(email):
    note = Notes.query.filter_by(user_email = email, id=request.json['id'], path = request.json['path']).first()
    note.title = request.json['title']
    note.text = request.json['text']
    note.pictures = request.json['pictures']
    note.videos = request.json['videos']
    note.audios = request.json['audios']
    note.ref1 = request.json['ref1']
    note.ref2 = request.json['ref2']
    note.ref3 = request.json['ref3']
    db.session.commit()
    return notes_schema.jsonify(note)


#--------------------------------------------------------------------------------- NOTES ----------------------------------------------------------------------------------

#--------------------------------------------------------------------------------- PROJECTS ----------------------------------------------------------------------------------
#add project to projects
@app.route('/addProject/<email>', methods = ['POST'])
def add_project(email):
    project = Project(email, request.json['keyWord'], request.json['name'], request.json['style1'], request.json['style2'], request.json['style3'], request.json['style4'])
    db.session.add(project)
    db.session.commit()
    return project_schema.jsonify(project)

#change project in projects
@app.route('/saveProject/<email>', methods = ['PUT'])
def save_project(email):
    keyword = request.json['keyWord']
    name = request.json['name']
    style1 = request.json['style1']
    style2 = request.json['style2']
    style3 = request.json['style3']
    style4 = request.json['style4'] 
    project= Project.query.filter_by(user_email = email, keyWord=keyword).first()
    project.name = name
    project.style1 = style1
    project.style2 = style2
    project.style3 = style3
    project.style4 = style4
    db.session.commit()
    return project_schema.jsonify(project)
#delete project in projects
@app.route('/deleteProject/<email>', methods = ['PUT'])
def delete_project(email):
    keyword = request.json['keyWord']
    valid = request.json['valid']
    project= Project.query.filter_by(user_email = email, keyWord=keyword).first()
    project.valid = valid
    db.session.commit()
    return project_schema.jsonify(project)
#update note last settings
@app.route('/updateNotesLast/<email>', methods = ['PUT'])
def update_notesSettings(email):
    user = Project.query.filter_by(user_email = email, keyWord=request.json['keyWord']).first()
    user.lastOneFirst = request.json['lastOneFirst']
    user.lastOneSecond  = request.json['lastOneSecond']
    db.session.commit()
    return settings_schema.jsonify(user)
#--------------------------------------------------------------------------------- PROJECTS ----------------------------------------------------------------------------------


#--------------------------------------------------------------------------------- STUDY ----------------------------------------------------------------------------------

#add note to notes
@app.route('/addStudyBlockElems/<email>', methods = ['POST'])
def add_studyBlockElems(email):
    if(request.json['mutation'] !=None):
        tasks = Tasks.query.filter_by(user_email = email, mutations = request.json['mutation'])
        for task in tasks:
            user_block = StudyBlock(email, request.json['id'], request.json['project_keyWord'],request.json['requestType'],request.json['requestLink'],task.id,task.date)
            db.session.add(user_block)
            db.session.commit()
    else:
        user_block = StudyBlock(email, request.json['id'], request.json['project_keyWord'],request.json['requestType'],request.json['requestLink'],request.json['task_id'],request.json['task_date'])
        db.session.add(user_block)
        db.session.commit()
    return studyBlock_schema.jsonify(user_block)

@app.route('/updateallStudyBlocks/<email>', methods = ['PUT'])
def update_allStudyBlocks(email):
    blocks = StudyBlock.query.filter_by(user_email = email, project_keyWord = request.json['project_keyWord'], task_date = request.json['prevDate'], task_id = request.json['prevId'])
    for block in blocks:
        block.task_date = request.json['nextDate']
        block.task_id = request.json['nextId']
    db.session.commit()
    db.session.commit()
    return studyBlock_schemas.jsonify(blocks)

@app.route('/removeStudyBlockElem/<userEmail>/<date>/<projectKeyWord>/<taskId>/<id>/<mutation>', methods = ['DELETE'])
def delete_studyBlockElem(userEmail, date, projectKeyWord, taskId, id, mutation):
    if(mutation != "null"):
        mutation = mutation.replace("--", "/")
        tasks = Tasks.query.filter_by(user_email = userEmail, mutations = mutation)
        for task in tasks:
            user_block = StudyBlock.query.filter_by(user_email = userEmail, project_keyWord=projectKeyWord, task_date=task.date, task_id = task.id, id=id).first()
            db.session.delete(user_block)
            db.session.commit()
    else:
        user_block = StudyBlock.query.filter_by(user_email = userEmail, project_keyWord=projectKeyWord, task_date=date, task_id = taskId, id=id).first()
        db.session.delete(user_block)
        db.session.commit()
    return jsonify({"success":"yes"})

#--------------------------------------------------------------------------------- STUDY ----------------------------------------------------------------------------------

#--------------------------------------------------------------------------------- SCHEDULE ----------------------------------------------------------------------------------

#get audio
@app.route('/convertToPdf/<email>', methods = ['POST'])
def convertToPdf(email):
    file = request.form['file']
    fileName = request.form['fileName']
    # file_name = request.form['fileName']
    # file = request.json['code']
    pdfFile = open(fileName, "wb")
    decode_string = base64.b64decode(file)
    pdfFile.write(decode_string)
    tabula.convert_into(fileName, fileName+".csv", output_format="csv", pages='all')
    some = pd.read_csv(fileName+".csv")
    arr = []
    for val in some:
        numbers = some[val].values.tolist()
        arr.append(numbers)
    os.remove(pdfFile)
    os.remove(fileName+".csv")
    return jsonify({"data": arr})

#--------------------------------------------------------------------------------- SCHEDULE ----------------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(debug=True)