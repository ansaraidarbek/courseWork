const TabGroup = require("electron-tabs");
const {shell} = require('electron')


$("#myButton").click((e)=>{
    e.preventDefault();
    shell.openExternal(`https://moodle.nu.edu.kz/`);
    // var pdf = 'D:/Личное/толькоВперед/2022/цели/прочитать30книг/1)bitcoin.pdf';
    // window.open(pdf);
})

// const webview = document.getElementById("webview");
// webview.addEventListener('will-navigate', (e) => {
//     const protocol = require('url').parse(e.url).protocol
//     if (protocol === 'http:' || protocol === 'https:') {
//       shell.openExternal(`https://moodle.nu.edu.kz/`)
//     }
//   });