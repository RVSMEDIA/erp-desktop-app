const { app, BrowserWindow , shell, session} = require("electron");
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

  // Get the default session object
  const mainSession = session.defaultSession;

  // mainSession.cookies.get({ url: 'https://app.idevelopment.site/' }).then(cookies => {
  //   console.log('cookies : ', cookies); // Output: [{ name: 'myCookie', value: 'myCookieValue' }]
  // });

  // shell.openExternal('https://github.com')

  // console.log(data);
    axios.post('http://erp.test/api/login', data ).then(response =>{
        if(response.data.error){
            console.log(response)
            event.reply("login-failed", err.errorSummary);
            return;
        }else{
          user = response.user;

          mainSession.cookies.set({
            url: 'https://app.idevelopment.site/',
            name: 'user',
            value: user
          });
          openHome();
          console.log('success', response)
        }
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
app.whenReady().then(async() => {



  const ses = session.fromPartition('persist:my-partition');
  console.log(ses.isPersistent()) // true 
  console.log(ses.getStoragePath()) // /Users/user/Library/Application Support/app/Partitions/my-partition (on macOS)

  app.getPath('userData');


  createWindow();
  openIndex();


  // Get the default session object
  const mainSession = session.defaultSession;

  // Store a cookie
  // mainSession.cookies.set({
  //   url: 'https://app.idevelopment.site/',
  //   name: 'myCookie',
  //   value: 'myCookieValue'
  // });


  // Retrieve cookies for a specific URL
  // mainSession.cookies.get({ url: 'https://app.idevelopment.site/' }).then(cookies => {
  //   console.log('cookies : ', cookies); // Output: [{ name: 'myCookie', value: 'myCookieValue' }]
  // });

  // Remove a specific cookie
  // mainSession.cookies.remove('https://app.idevelopment.site/', 'myCookie').then(() => {
  //   console.log('Cookie removed');
  // });

  // Clear all cookies
  // mainSession.cookies.removeAll().then(() => {
  //   console.log('All cookies removed');
  // });

// Load a URL with the session
// mainWindow.loadURL('https://app.idevelopment.site/');



// Check if a session exists by its partition name
function isSessionExists(partition) {
  const existingSession = session.fromPartition(partition);
  return existingSession !== null;
}

  // Check if a session exists by its partition
  const customSession = session.fromPartition('your-partition-name');
  const sessionExists = customSession !== null;

  if (sessionExists) {
    // mainWindow.loadFile('home.html');
    console.log('sessionExists', sessionExists);
  } else {
    // mainWindow.loadFile('login.html');
    console.log('in else ....');
  }


// Use the custom session for your desired operations
// sessionExists.cookies.get({}, (error, cookies) => {
//   if (error) {
//     console.error('Failed to get cookies:', error);
//     return;
//   }

//   console.log('Cookies:', cookies);
// });


// end session code

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