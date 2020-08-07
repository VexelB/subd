const tstop = document.getElementById("data");
const okbtn = document.getElementById("addclose");
const path = require("path");

const sqlite3 = require('sqlite3').verbose();

const ipcRenderer = require('electron').ipcRenderer;

let info = "";

ipcRenderer.on('data', (x, msg) => {
    info = msg;
    for (let i in msg.fields){
        if (i == "cID") {
            tstop.innerHTML += `<div id="${i}">${i}: <input disabled id="input${i}" value="${msg.fields[i]}"></div>`;
        } else {
            tstop.innerHTML += `<div id="${i}">${i}: <input id = "input${i}" value="${msg.fields[i]}"></div>`;
        }
        
    }
})

okbtn.addEventListener('click', () => {
    for (let i in info.fields) {
        info.fields[i] = document.getElementById(`input${i}`).value
    }
    remote.getCurrentWindow().getParentWindow().send('action', info)
    remote.getCurrentWindow().close();
})