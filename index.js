const addbtn = document.getElementById("add");
const chgbtn = document.getElementById("change");
const delbtn = document.getElementById("delete");
const path = require("path");
const sqlite3 = require('sqlite3').verbose();
const tstop = document.getElementById("data");
const { remote, BrowserWindow } = require('electron');
const ipcRenderer = require('electron').ipcRenderer;
let table = "Apparat";
let head = {"fields": {}};
let clicked = null;
let id = 0;

ipcRenderer.on('action', (x, msg) => {
    head = msg;
    load();
})

function load() {
    let db = new sqlite3.Database(path.resolve('testMCHS.db'), sqlite3.OPEN_READWRITE, (err) => {
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
                tstop.innerHTML += `<div id="${i}" style="float:left; border: solid 1px black">${i}</div>`;
                head.fields[i] = ''
            };
        })
        db.each(`SELECT * from ${table}`, (err, row) => {
            if (err) {
            console.error(err);
            }
            id = row.id;
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
    const top = remote.getCurrentWindow();
    let win = new remote.BrowserWindow({
        width: document.documentElement.clientWidth / 2,
        height: document.documentElement.clientHeight / 2,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        },
        show: false,
        parent: top,
        modal: true
    });
    win.loadFile('db.html');
    win.once('ready-to-show', () => {
        for (let i in head.fields) {
            head.fields[i] = '';
        }
        head.fields.id = id + 1;
        head.table = table;
        head.action = "add";
        win.webContents.send('data', head)
        win.show();
    })
    win.on('close', () => {
        win = null;
    })
});

chgbtn.addEventListener('click', () => {
    if (clicked) {
        const top = remote.getCurrentWindow();
        let win = new remote.BrowserWindow({
            width: document.documentElement.clientWidth / 2,
            height: document.documentElement.clientHeight / 2,
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true
            },
            show: false,
            parent: top,
            modal: true
        });
        win.loadFile('db.html');
        win.once('ready-to-show', () => {
            head.table = table;
            head.action = "change";
            win.webContents.send('data', head)
            win.show();
        })
        win.on('close', () => {
            win = null;
        })
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

load();