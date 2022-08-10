const { app, BrowserWindow, Menu, ipcMain, globalShortcut, Tray  } = require('electron');
const electronLocalshortcut = require('electron-localshortcut');
const electron = require('electron');
require("electron-reload")(__dirname);
require('@electron/remote/main').initialize();
const path = require('path');

const dataPath = app.getPath("userData");
const filePath = path.join(dataPath, "user.json");
const fs = require('fs');
const fse = require('fs-extra');
let prune = false;
let appIcon;
let authenticationWindow;
let appWindow;
let deleteWindow;
let childWindow;
let newTaskWindow;
let notificationWindow;
let studyWindow;
let startTime;
let endTime;

const menuTemplate = [];
const anotherTemplate = [];

//Create login/register page
function createAuthenticationWindow() {
    authenticationWindow = new BrowserWindow({
        width: 429,
        height: 528,
        show: false,
        webPreferences: {
            nodeIntegration: true, 
            contextIsolation: false
        },
        icon: `${__dirname}/frontEnd/icons/logo.ico`
    });
    require("@electron/remote/main").enable(authenticationWindow.webContents);
    if (fs.existsSync(filePath)) {
        prune = true;
            authenticationWindow.loadURL(`file://${__dirname}/frontEnd/load.html`);
            childWindow = new BrowserWindow({
                width: 429,
                height: 528,
                webPreferences: {
                    nodeIntegration: true, 
                    contextIsolation: false
                },
                icon: `${__dirname}/frontEnd/icons/logo.ico`
            });
            let position = authenticationWindow.getPosition();
            childWindow.setPosition(position[0], position[1]);
            childWindow.loadURL(`file://${__dirname}/frontEnd/child.html`);
            childWindow.on('closed', ()=>childWindow=null);
        }else{
            authenticationWindow.show();
            authenticationWindow.loadURL(`file://${__dirname}/frontEnd/login.html`);
    }

    authenticationWindow.on('closed', ()=>authenticationWindow=null);
    let menuWindow = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menuWindow);
    //Menu.setApplicationMenu(Menu.buildFromTemplate([]));
}

//create main window of app
function createAppWindow(){
    appWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true, 
            contextIsolation: false
        },
        icon: `${__dirname}/frontEnd/icons/logo.ico`
    });
    // let obj = JSON.parse(fs.readFileSync(path, "utf8"));
    // let srcDir = `./frontEnd/css/style${obj.userSettings.style}`;
    // let destDir = `./frontEnd/css`;
    // fse.copySync(srcDir, destDir, { overwrite: true },function (err) {
    //     if (err) {                 
    //       console.error(err);      
    //     } else {
    //       console.log("success!");
    //     }
    //   });
    require("@electron/remote/main").enable(appWindow.webContents);
    appWindow.maximize();
    appWindow.loadURL(`file://${__dirname}/frontend/main.html`);
    var menuWindow = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menuWindow);
    appWindow.on('close', (e)=>{
        if (app.isQuiting) {
        if (!prune) {
            fs.unlinkSync(filePath);
        }
        appWindow = null;
        } else {
        console.log("here");
        e.preventDefault();
        appWindow.hide();
        }
    });

    electronLocalshortcut.register(appWindow, "Ctrl+B", ()=>{
        appWindow.webContents.send('goback');
    });
    electronLocalshortcut.register(appWindow, "Ctrl+X", ()=>{
        appWindow.webContents.send('music');
    });
    electronLocalshortcut.register(appWindow, "Ctrl+Z", ()=>{
        appWindow.webContents.send('prevMusic');
    });
    electronLocalshortcut.register(appWindow, "Ctrl+C", ()=>{
        appWindow.webContents.send('nextMusic');
    });
    
}


//create delete window
function createDeleteWindow(){
    deleteWindow = new BrowserWindow({
      width: 400,
      height: 200,
      webPreferences: {
        nodeIntegration: true, 
        contextIsolation: false
      },
      frame : false,
      parent: appWindow,
      modal: true
    });
    require("@electron/remote/main").enable(deleteWindow.webContents);
    deleteWindow.loadURL(`file://${__dirname}/frontend/delete.html`);
    deleteWindow.on('closed', ()=>{
      deleteWindow=null
    });
    var menuWindow = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menuWindow);
}

function createNewTaskWindow(){
    newTaskWindow = new BrowserWindow({
      width: 1536,
      height: 781,
      webPreferences: {
        nodeIntegration: true, 
        contextIsolation: false
      },
      transparent: true,
      frame : false,
      parent: appWindow,
      modal: true
    });
    require("@electron/remote/main").enable(newTaskWindow.webContents);
    newTaskWindow.loadURL(`file://${__dirname}/frontend/prompt.html`);
    newTaskWindow.on('closed', ()=>{
      newTaskWindow=null
    });
    var menuWindow = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menuWindow);
}

// function createAdditionalWindow(){
//     additionalWindow = new BrowserWindow({
//         plugins: true
//     })
//     additionalWindow.loadURL('https://moodle.nu.edu.kz/');
//     additionalWindow.loadURL('D:/Личное/толькоВперед/2022/цели/прочитать30книг/1)bitcoin.pdf');
// }

function createNotificationsWindow () {
    const screenElectron = electron.screen;
    const display = screenElectron.getPrimaryDisplay();
    const dimensions = display.workAreaSize;
    notificationWindow = new BrowserWindow({
        width: parseInt((dimensions.width/100) * 29),
        height: parseInt((dimensions.height/100)*12 ),
        x:  parseInt(dimensions.width - ((dimensions.width/100) * 28)) -30,
        y: parseInt(dimensions.height - ((dimensions.height/100)*12 )) -10,
        frame: false,
        transparent: true,
        webPreferences: {
            nodeIntegration: true, 
            contextIsolation: false
        },
        alwaysOnTop: true,
        skipTaskbar: true
    })
    console.log(__dirname);
    notificationWindow.loadURL(`file://${__dirname}/frontend/notifications.html`);
}

function createStudyWindow(){
    studyWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true, 
            contextIsolation: false,
            webviewTag: true,
            plugins: true
        },
        icon: `${__dirname}/frontEnd/icons/logo.ico`
    });
    require("@electron/remote/main").enable(appWindow.webContents);
    studyWindow.maximize();
    //studyWindow.loadURL(`file://${__dirname}/frontend/studyHard.html`);
    studyWindow.loadURL('D:/Учеба/Назарбаев Университет/5) FourthYear/secondSemester/machineLearning/backpropagation-practice.pdf');
    var menuWindow = Menu.buildFromTemplate(anotherTemplate);
    Menu.setApplicationMenu(menuWindow);
    
}
  
// ipcMain.on('notify', ()=>{
//     createNotificationsWindow();
//     // require('electron').shell.openExternal(`https://moodle.nu.edu.kz/`);
// });

ipcMain.on('appStart', ()=>{
    createAppWindow();
    authenticationWindow.close();
    setInterval(function () {
        time = new Date();
        if(time.getSeconds()== 0){
            appWindow.webContents.send('takeNow', time);
        }
    }, 1000);
    // createNotificationsWindow();
});

ipcMain.on('changeUserInfo', ()=>{
    appWindow.webContents.send('changeUserInfo');
});


ipcMain.on('beforeDelete', (event, data)=>{
    createDeleteWindow();
    deleteWindow.webContents.on('did-finish-load', function () {
        deleteWindow.webContents.send('beforeDelete', data);
    });
});

ipcMain.on('afterDelete', (event, data)=>{
    deleteWindow.close();
    appWindow.webContents.send('afterDelete', (data));
});

ipcMain.on('readyFaceReco', ()=>{
    let position = childWindow.getPosition();
    childWindow.close();
    authenticationWindow.setPosition(position[0], position[1]);
    authenticationWindow.show();
});


ipcMain.on('save', ()=>{
    prune = true;
});

//quit app
ipcMain.on('appFinish', ()=>{
    app.quit();
});

ipcMain.on('addTaskItself', (event, data)=>{
    createNewTaskWindow();
    newTaskWindow.webContents.on('did-finish-load', function () {
        newTaskWindow.webContents.send('addTaskItself', data);
    });
});

ipcMain.on('taskItselfAdded', (event, result)=>{
    newTaskWindow.close();
    appWindow.webContents.send('taskItselfAdded', result);
});

ipcMain.on('startStudy', (event, message)=>{
    console.log(message["tool"][0].requestLink);
    startTime = new Date();
    createStudyWindow();
    if(message["tool"][0].requestLink == "none"){
        appWindow.hide();
    }else{
        appWindow.minimize();
        appWindow.show();
        let sizes = appWindow.getBounds();
        const screenElectron = electron.screen;
        const display = screenElectron.getPrimaryDisplay();
        const dimensions = display.workAreaSize;
        let newPlaceX = dimensions.width - sizes.width;
        let newPlaceY = dimensions.height - sizes.height;
        appWindow.setPosition(newPlaceX, newPlaceY);
        appWindow.webContents.send('studyStarted', message["tool"][0].requestLink);
    }
});
  

// when parent process (Electron) is ready start app
app.whenReady().then(() => {
    try {
        appIcon = new Tray(`${__dirname}/frontend/icons/logo.ico`);
        appIcon.on("click", ()=>{
        appWindow.show();
        })
        const contextMenu = Menu.buildFromTemplate([
        { label: 'Show App', click:  function(){
            appWindow.show();
        } },
        { label: 'Quit', click:  function(){
            app.isQuiting = true;
            app.quit();
        } }
        ]);
        appIcon.setToolTip('ProductivityApp')
        appIcon.setContextMenu(contextMenu)
        createAuthenticationWindow();
    } catch(err) {
    console.error(err)
    }
})

// closes the app
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
})

// menu of the app
if (process.env.NODE_ENV !== 'production'){
    if (process.env.NODE_ENV !== 'production'){
        menuTemplate.push({
            label: 'Developer',
            submenu: [
            {
                label: 'Toggle developer tools',
                accelerator:'F12',
                click(item, focusedWindow){
                focusedWindow.toggleDevTools();
                }
            },
            {
                label: 'Refresh',
                accelerator:'F5',
                click(item, focusedWindow){
                focusedWindow.reload();
                }
            }
            ]
        })
    }
}
// loadURL('D:/Личное/толькоВперед/2022/цели/прочитать30книг/1)bitcoin.pdf');
// loadURL(`https://www.youtube.com/watch?v=aEplopx9pj0`);

anotherTemplate.push({
    label: 'Developer',
    submenu: [
    {
        label: 'pdfVersion',
        click(item, focusedWindow){
        focusedWindow.loadURL('D:/Личное/толькоВперед/2022/цели/прочитать30книг/1)bitcoin.pdf');
        }
    },
    {
        label: 'youtubeLink',
        accelerator:'F5',
        click(item, focusedWindow){
        focusedWindow.loadURL(`https://www.youtube.com/watch?v=aEplopx9pj0`);
        }
    }
    ]
})


