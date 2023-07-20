const { app, BrowserWindow, Menu, Tray, nativeImage   } = require('electron');
const express = require('express');
const ejs = require('ejs');
const path = require('path');
const axios = require('axios');
var cors = require('cors')
const handlebars = require('hbs');
const bodyParser = require('body-parser');
const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }).single('csv');
const session = require('express-session');
const screenshot = require('screenshot-desktop');
const { Readable } = require('stream');
const { Blob } = require('buffer');

let mainWindow;
let aboutWindow;
let logged_user = [];

let screenshotIntervals = [];

let tray = null

const menuTemplate = [  
  {
    label: 'Home',
    click: () => {
      mainWindow.loadURL('http://localhost:3007');
    }
  },
  
  // {
  //   label: 'About',
  //   click: () => {
  //     // Create a new window when "About" is clicked
  //     // createAboutWindow()
  //     mainWindow.webContents.loadFile('about.html');
  //   }
  // },
  {
       role: 'quit' 
  }
]

const menu = Menu.buildFromTemplate(menuTemplate)
Menu.setApplicationMenu(menu)




function createAboutWindow() {
  const aboutWindow = new BrowserWindow({
    width: 1700,
    height: 450,
    webPreferences: {
      nodeIntegration: true
    }
  })

  aboutWindow.loadFile('about.html')
}


function createWindow() {
  mainWindow = new BrowserWindow(
    { 
        width: 1700,
        height: 450,
        resizable: false // Disables window resizing
    });

    // open dev tools
    mainWindow.webContents.openDevTools()

  //mainWindow.setSize(700, 450) // Fix the window size to 800x600

  mainWindow.loadURL('http://localhost:3007');

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}


app.on('ready', () => {

  const iconPath = path.join(__dirname, 'assets/icon.png');

  tray = new Tray(iconPath)

  tray.on('click', () =>{
    mainWindow.isVisible()?mainWindow.hide():mainWindow.show()
  })

  // mainWindow.tray = new Tray(nativeImage.createFromPath(iconPath));

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Item1', type: 'radio' },
    { label: 'Item2', type: 'radio' },
    { label: 'Item3', type: 'radio', checked: true },
    { label: 'Item4', type: 'radio' }
  ])

  tray.setToolTip('Rvs Tracker')

  tray.setContextMenu(menu)

  const expressApp = express();

  expressApp.use(cors())


  // Set up session middleware
  expressApp.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 12 * 60 * 60 * 1000 // 12 hours
    }
  }));

  // Middleware to check if the user is authenticated
  function isAuthenticated(req, res, next) {
    if (req.session.isAuthenticated) {
      next();
    } else {
      res.redirect('/login');
    }
  }

  // expressApp.use('/public', express.static(path.join(__dirname, 'public')));

  // expressApp.use(express.static(__dirname + '/public'));

  expressApp.use(express.static(path.join(__dirname, 'public')));

  expressApp.set('view engine', 'hbs');
  expressApp.set('views', path.join(__dirname, 'views'));

  expressApp.use(bodyParser.urlencoded({ extended: true }));

  expressApp.post('/createFiledd', upload, (req, res) => {
    const name = req.body.name;
    const csvFile = req.file;
  
    console.log(`Creating file: ${csvFile.path}`);
  
    // Add code here to create the file using the uploaded CSV file
    // The CSV file will be available at `csvFile.path`
  
    res.send(`File created: ${name}`);
  });

  expressApp.get('/dashboard', (req, res) => {
    res.render('dashboard');
  });

  expressApp.post('/logout', (req, res) => {
    // const filePath = 'data.json';
    const filePath = path.join(__dirname, 'data.json');
    clearDataFile(filePath);
    logged_user = [];
    // Stop all screenshot processes when the user logs out
    stopAllScreenshotProcesses();


    // const intervalId =  callScreenshot();
    // Clear the scheduled screenshot
    // clearInterval(intervalId);
    // res.redirect(req.originalUrl);
    //expressApp.close(); // close server
    res.render('login');
  });

  expressApp.get('/', userLogin );

  function userLogin(req, res) {

    // res.send('dashboard ..... ');
    
    // Specify the file path
    const filePath = path.join(__dirname, 'data.json');
  
    // Read the JSON file
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error('Error reading JSON file:', err);
      } else {
        try {
          // Parse the JSON data
          const jsonData = JSON.parse(data);

          // console.log(jsonData, 'jsonData');
  
          // Check if the desired object exists
          const hasObject = jsonData.hasOwnProperty('email');
  
          // Decide session based on the existence of the object
          if (hasObject) {
            // Object exists, set session accordingly
            console.log('Session: Object exists');
            logged_user.push(jsonData);
            callScreenshot();
            // res.send('dashboard');
            res.render('dashboard', {user: jsonData});
          } else {
            logged_user = [];
            stopAllScreenshotProcesses();
            // Object doesn't exist, set session accordingly
            console.log('Session: Object does not exist');
            // res.send('login');
            res.render('login');
          }
        } catch (error) {
          console.error('Error parsing JSON data:', error);
        }
      }
    });
  
  }

  expressApp.post('/', upload, (req, res) => {

    let data = {
      email: req.body.email,
      password: req.body.password,
    }

    axios.post('https://app.idevelopment.site/api/login', data ).then(response =>{
        if(response.data.auth === 'fail'){
            // console.log('response ====', response)
            logged_user = [];
            const errorMessage = 'Invalid email or password';
            res.render('login', { errorMessage });
            // res.json({ error: errorMessage});
        }else{
          user = response.data.user;

          // Convert data to JSON format
          const jsonData = JSON.stringify(user);

          // Specify the file path
          // const filePath = 'data.json';
          const filePath = path.join(__dirname, 'data.json');

          // Write data to the JSON file
          fs.writeFile(filePath, jsonData, (err) => {
            if (err) {
              console.error('Error writing JSON file:', err);
              return err;
            } else {
              callScreenshot();
              console.log('Data written to JSON file successfully.', user);
              logged_user.push(user);
              res.render('dashboard', {user: user});
            }
          });
          
          // Store the user object in the session
          // req.session.user = JSON.stringify(response);
          req.session.user = user;
          req.session.isAuthenticated = true;
          // console.log('success', user)

          
        }
    }).catch((err) => {
      console.log('error', err)
    });

    
      // res.render('index', { results: resultsJSON});
  });

 
  

  expressApp.get('/about', (req, res) => {
    res.render('about');
  });

  expressApp.get('/login', (req, res) => {
    res.render('login');
  });
  
  
  expressApp.get('/screenshort', (req, res) => {
    
    // Capture the screenshot
    screenshot({ screen: 'main', filename: `${datetime}.png` })
    .then((imgPath) => {
      console.log(`Screenshot saved: ${imgPath}`);
    })
    .catch((err) => {
      console.error(`Failed to capture screenshot: ${err}`);
    });


  });



  expressApp.listen(3007, () => {
    console.log('Express server running on port 3007');
    createWindow();
  });

});

function takeScreenshot() {

  // writeLog('takeScreenshot(): ');

  var datetime = Date.now();
  // Capture the screenshot
  screenshot({ screen: 'main', filename: `${datetime}.png` })
  .then((imgPath) => {


    // Example usage
    const imagePath = `${datetime}.png`;
    // const uploadUrl = 'http://erp.test/api/save_screenshort';

    const uploadUrl = 'https://app.idevelopment.site/api/save_screenshort';
    console.log('Taking a screenshot...');
    uploadImage(imagePath, uploadUrl);
  })
  .catch((err) => {
    console.error(`Failed to capture screenshot: ${err}`);
    // writeLog(`Failed to capture screenshot: ${err}`);

  });
}

function callScreenshot() {
  const delay = Math.random() * 6 * 60 * 1000; // 5 minutes
  // setTimeout(() => {
    //   takeScreenshot();
    //   callScreenshot(); // Call the function again to repeat the process
    // }, delay);
    
    const intervalId = setInterval(() =>{
      takeScreenshot();

      console.log('callscreenshort started  delay....', delay);

  }, delay);

  console.log(intervalId);
  screenshotIntervals.push(intervalId);
  // return intervalId;

}

// Function to stop all screenshot processes
function stopAllScreenshotProcesses() {
  if (screenshotIntervals && screenshotIntervals.length > 0) {
    screenshotIntervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    screenshotIntervals = []; // Clear the array
  }
}
// callScreenshot();
// userLogin();

// update images to erp portal start

// Function to convert a Buffer to a Blob
function bufferToBlob(buffer) {
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);

  return new Blob([readable.read()]);
}


// Function to upload an image using Axios
async function uploadImage(imagePath, uploadUrl, user) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBlob = bufferToBlob(imageBuffer);

    const formData = new FormData();
    formData.append('image', imageBlob, imagePath);
    formData.append('id', logged_user[0].id);

    const headers = {
      'Content-Type': 'multipart/form-data',
    };

    const response = await axios.post(uploadUrl, formData, {
      headers: headers,
    });

    deleteImage(imagePath);
    console.log('Image uploaded successfully:', response.data.message);
    // console.log('logged_user : ', logged_user);


  } catch (error) {
    console.error('Error while uploading image:', error.message);
  }
}

// Function to clear the data.json file
function clearDataFile(filePath) {
  // Create an empty JSON object
  const emptyData = {};

  // Convert the empty object to JSON format
  const emptyJsonData = JSON.stringify(emptyData);

  // Write the empty JSON data to the file
  fs.writeFile(filePath, emptyJsonData, (err) => {
    if (err) {
      console.error('Error clearing JSON file:', err);
    } else {
      console.log('Data.json file cleared successfully.');
    }
  });
}


function deleteImage(filePath)
{
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting image file:', err);
      // res.status(500).send('Error deleting image file');
    } else {
      console.log('Image file deleted successfully.');
      // res.send('Image file deleted');
    }
  });

}


// function writeLog(data) {

//   var pdfFileName = `${downloadDir}/${folderName}/log.text`;
//   fs.appendFile(pdfFileName, data + '\n', (err) => {
//     if (err) {
//       console.error('Failed to write to log file:', err);
//     }
//   });
// }

// Log an error
//writeLog('Error occurred: ' + err.message);
// writeLog('Debug message: Some debug info');




app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});