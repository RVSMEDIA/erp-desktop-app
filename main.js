const { app, BrowserWindow } = require("electron");
const path = require("path");
const OktaAuth = require("@okta/okta-auth-js").OktaAuth;
const axios = require('axios');

const { ipcMain } = require("electron");

let mainWindow;
let user;

var config = {
  // Required config
  issuer: "https://dev-470e3wrp.us.auth0.com/oauth2/default",
  clientId: "BuzBI11PzXJQR3iwRO47qDZ1zJ2xQH1k",
};

var authClient = new OktaAuth(config);

ipcMain.on("user:login", (event, data) => {


  // console.log(data);
    axios.post('http://127.0.0.1:8000/api/login', data ).then(response =>{
        // if(response.data.error){
        //     console.log(response)
        // }else{
        //     console.log('success', response)
        // }
        console.log('dddd', response);
    } )


});
// ipcMain.on("user:login", (event, data) => {
//   authClient
//     .signInWithCredentials(data)
//     .then(function (res) {
//       console.log(res);

//       if (res.data.status != "SUCCESS") {
//         event.reply("login-failed", err.errorSummary);
//         return;
//       }

//       user = res.user;
//       openHome();
//     })
//     .catch(function (err) {
//       console.log(err);
//       event.reply("login-failed", err.errorSummary);
//     });
// });

ipcMain.handle("user:get", (event) => {
  return user;
});

ipcMain.on("user:logout", (event) => {
  user = null;
  openIndex();
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
}

function openIndex() {
  mainWindow.loadFile("index.html");

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
}

function openHome() {
  mainWindow.loadFile("home.html");
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  openIndex();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});