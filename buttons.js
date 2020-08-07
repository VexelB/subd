const clsbtn = document.getElementById("close");
const { remote } = require('electron');

if (clsbtn) {
  clsbtn.addEventListener('click', () => {
    remote.getCurrentWindow().close();
  });
}