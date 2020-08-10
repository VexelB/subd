const addbtn = document.getElementById("add");
const chgbtn = document.getElementById("change");
const delbtn = document.getElementById("delete");
const okbtn = document.getElementById("addclose");
const clsbtn = document.getElementById("close");
// const path = require("path");
const sqlite3 = require('sqlite3').verbose();
const tstop = document.getElementById("data");
const tstop1 = document.getElementById("data1");
// const { remote, BrowserWindow } = require('electron');
// const ipcRenderer = require('electron').ipcRenderer;
const modal = document.getElementById("myModal");
let table = "Apparat";
let head = {"fields": {}};
let clicked = null;
// let id = 0;
// let path = 'mda';

// ipcRenderer.on('opend-file', (e, file) => {
//     console.log(file);
// })

function load() {
    let db = new sqlite3.Database('testMCHS.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
          console.error(err.message);
        }
    });
    db.serialize(() => {
        let sql = ``;
        if (head.action == "change") {
            sql += `UPDATE ${head.table} SET `
            for (let i in head.fields) {
                sql += `${i} = '${head.fields[i]}',`
            }
            sql = sql.slice(0,sql.length-1) + ` WHERE id = ${head.fields.id};`
        }
        if (head.action == "add") {
            sql += `INSERT into ${head.table} VALUES (`;
            for (let i in head.fields) {
                sql += `'${head.fields[i]}',`
            }
            sql = sql.slice(0,sql.length-1) + ');'
        }
        if (head.action == "delete") {
            sql += `DELETE from ${table} WHERE id = ${head.fields.id}`
        }
        if (sql) {
            db.run(sql, (err) => {
                if (err) {
                    console.error(err.message);
                    if (err.message.includes("SQLITE_CONSTRAINT: UNIQUE constraint failed")) {
                        alert('ID должен быть уникальным!');
                    }
                    if (err.message.includes("SQLITE_MISMATCH: datatype mismatch")) {
                        alert('Ошибка типа данных');
                    }
                }
            });
        }
        clicked = null;
        head = {"fields": {}};
        tstop.innerHTML = "";
        db.get(`SELECT * from ${table}`, (err, row) => {
            for (let i in row) {
                tstop.innerHTML += `<div class = "table" id="${i}">${i}</div>`;
                head.fields[i] = ''
            };
        })
        db.each(`SELECT * from ${table}`, (err, row) => {
            if (err) {
            console.error(err);
            }
            for (let i in row) {
                document.getElementById(i).innerHTML += `<div class="row" id="row${row.id}">${row[i]}</div>  `;
            };
            document.querySelectorAll('.row').forEach( (x) => {
                x.addEventListener('click', () => {
                    if (clicked) {
                        document.querySelectorAll(`#${clicked}`).forEach( (x) => {
                            x.style.backgroundColor = 'white';
                        })
                    }
                    if (clicked !== x.id) {
                        clicked = x.id
                        let j = 0;
                        let body = document.querySelectorAll(`#${clicked}`);
                        for (let i in head.fields) {
                            head.fields[i] = body[j].textContent;
                            j++;
                        }
                        document.querySelectorAll(`#${clicked}`).forEach( (x) => {
                            x.style.backgroundColor = 'blue';
                        })
                    }
                    else {
                        clicked = null;
                    }
    
                })
            })
        });
        db.close();
    });
}

addbtn.addEventListener('click', () => {
    // const top = remote.getCurrentWindow();
    // let win = new remote.BrowserWindow({
    //     width: document.documentElement.clientWidth / 2,
    //     height: document.documentElement.clientHeight / 2,
    //     webPreferences: {
    //         nodeIntegration: true,
    //         enableRemoteModule: true
    //     },
    //     show: false,
    //     parent: top,
    //     modal: true
    // });
    // win.loadFile('db.html');
    // win.once('ready-to-show', () => {
    //     head.fields.id = id + 1;
    //     win.webContents.send('data', head)
    //     win.show();
    // })
    // win.on('close', () => {
    //     win = null;
    // })
    head.table = table;
    head.action = "add";
    for (let i in head.fields) {
        head.fields[i] = '';
    }
    for (let i in head.fields){
        tstop1.innerHTML += `<div id="div${i}">${i}: <input id = "input${i}" value="${head.fields[i]}"></div>`;
    }
    modal.style.display = "block";
});

chgbtn.addEventListener('click', () => {
    if (clicked) {
        // const top = remote.getCurrentWindow();
        // let win = new remote.BrowserWindow({
        //     width: document.documentElement.clientWidth / 2,
        //     height: document.documentElement.clientHeight / 2,
        //     webPreferences: {
        //         nodeIntegration: true,
        //         enableRemoteModule: true
        //     },
        //     show: false,
        //     parent: top,
        //     modal: true
        // });
        // win.loadFile('db.html');
        // win.once('ready-to-show', () => {
        //     head.table = table;
        //     head.action = "change";
        //     win.webContents.send('data', head)
        //     win.show();
        // })
        // win.on('close', () => {
        //     win = null;
        // })
        head.table = table;
        head.action = "add";
        for (let i in head.fields){
            tstop1.innerHTML += `<div id="div${i}">${i}: <input id = "input${i}" value="${head.fields[i]}"></div>`;
        }
        modal.style.display = "block";
    }
    else {
        alert("Выберете запись");
    }
});

delbtn.addEventListener('click', () => {
    if (clicked) {
        head.action = "delete";
        load();
    }
    else {
        alert("Не выбрано")
    }
})

document.querySelectorAll(".tables").forEach((x) => {
    x.addEventListener('click', () => {
        table = x.id;
        load();
    })
})

okbtn.addEventListener('click', () => {
    for (let i in head.fields) {
        head.fields[i] = document.getElementById(`input${i}`).value;
    }
    modal.style.display = "none";
    tstop1.innerHTML = '';
    load();
})

// window.addEventListener('click', (e) => {
//     if (e.target == modal) {
//         if (modal.style.display != "none") {
//             modal.style.display = "none";
//         }
//     }
// })

clsbtn.addEventListener('click', () => {
    modal.style.display = "none";
    tstop1.innerHTML = '';
});

load();
// ipcRenderer.send('open-file','mda');