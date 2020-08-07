const tstop = document.getElementById("data");
const okbtn = document.getElementById("addclose");
const clsbtn = document.getElementById("close");
const { remote } = require('electron');
const ipcRenderer = require('electron').ipcRenderer;


let info = "";

ipcRenderer.on('data', (x, msg) => {
    info = msg;
    for (let i in msg.fields){
        tstop.innerHTML += `<div id="${i}">${i}: <input id = "input${i}" value="${msg.fields[i]}"></div>`;
    }
})

okbtn.addEventListener('click', () => {
    for (let i in info.fields) {
        info.fields[i] = document.getElementById(`input${i}`).value
    }
    remote.getCurrentWindow().getParentWindow().send('action', info)
    remote.getCurrentWindow().close();
})

clsbtn.addEventListener('click', () => {
    remote.getCurrentWindow().getParentWindow().send('action', {})
    remote.getCurrentWindow().close();
});