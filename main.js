const { app, BrowserWindow, Menu } = require('electron');
const express = require('express');
const ejs = require('ejs');
const path = require('path');
const axios = require('axios');
const handlebars = require('hbs');
const bodyParser = require('body-parser');
const fs = require('fs');
const multer = require('multer');
const pdf = require('html-pdf');
const upload = multer({ dest: 'uploads/' }).single('csv');
const session = require('express-session');
const screenshot = require('screenshot-desktop');
const { Readable } = require('stream');
const { Blob } = require('buffer');

let mainWindow;
let aboutWindow;





const menuTemplate = [  {    label: 'File',    submenu: [      { role: 'quit' }    ]
  },
  {
    label: 'About',
    click: () => {
      // Create a new window when "About" is clicked
      createAboutWindow()
    }
  }
]

const menu = Menu.buildFromTemplate(menuTemplate)
Menu.setApplicationMenu(menu)




function createAboutWindow() {
  const aboutWindow = new BrowserWindow({
    width: 700,
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
        height: 450
    });

    // open dev tools
    mainWindow.webContents.openDevTools()

  mainWindow.loadURL('http://localhost:4089');

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', () => {

  const expressApp = express();

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

  expressApp.get('/home', (req, res) => {
    res.redirect('/');
  });

  expressApp.post('/', upload, (req, res) => {

    let data = {
      email: req.body.email,
      password: req.body.password,
    }

    

    axios.post('http://erp.test/api/login', data ).then(response =>{
        if(response.data.auth === 'fail'){
            console.log(response)
            // event.reply("login-failed", err.errorSummary);
            return;
        }else{
          user = response.data.user;

          // Convert data to JSON format
          const jsonData = JSON.stringify(user);

          // Specify the file path
          const filePath = 'data.json';

          // Write data to the JSON file
          fs.writeFile(filePath, jsonData, (err) => {
            if (err) {
              console.error('Error writing JSON file:', err);
            } else {
              console.log('Data written to JSON file successfully.');
            }
          });

          
          // Store the user object in the session
          // req.session.user = JSON.stringify(response);
          req.session.user = user;
          req.session.isAuthenticated = true;
          // console.log('success', user)

          res.redirect('/dashboard');
        }
    }).catch((err) => {
      console.log('error', err)
    });

    
      // res.render('index', { results: resultsJSON});
  });

 
  expressApp.get('/', (req, res) => {
    if (req.session.isAuthenticated) {
      // User session exists, redirect to the dashboard
      res.redirect('/dashboard');
    } else {
      // User session does not exist, redirect to login
      res.redirect('/login');
    }
  });

  expressApp.get('/about', (req, res) => {
    res.render('about');
  });

  expressApp.get('/login', (req, res) => {

    userLogin();
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


  // expressApp.get('/dashboard', (req, res) => {
  //   // Access the user object from the session
  //   const user = req.session.user;


  //   console.log( 'usersing : => ' ,user);
  //   res.render('dashboard', { user});

  //   if (req.session.isAuthenticated) {
  //     next();
  //   } else {
  //     res.redirect('/login');
  //   }

  // });



  // Route for dashboard
  expressApp.get('/dashboard', isAuthenticated, (req, res) => {
    // Render the dashboard view
    res.render('dashboard');
  });



  expressApp.listen(4089, () => {
    console.log('Express server running on port 4089');
    createWindow();
  });

});


function takeScreenshot2() {
  var datetime = Date.now();

  // Capture the screenshot
  screenshot({ screen: 'main', filename: `${datetime}.png` })
    .then((imgPath) => {
      fetch(`file://${imgPath}`)
        .then((response) => response.blob())
        .then((blob) => {
          let formData = new FormData();
          formData.append('image', blob, `${datetime}.png`);

          axios
            .post('http://erp.test/api/save_screenshot', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            })
            .then((response) => {
              console.log('Screenshot:');
              console.dir(response.data, { depth: null });
            })
            .catch((error) => {
              console.log('Error:', error);
            });
        });
    })
    .catch((err) => {
      console.error(`Failed to capture screenshot: ${err}`);
    });
}

// Rest of your code...


// Rest of your code...


function takeScreenshot() {


var datetime = Date.now();

  // Capture the screenshot
  screenshot({ screen: 'main', filename: `${datetime}.png` })
  .then((imgPath) => {

    // Example usage
    const imagePath = `${datetime}.png`;
    const uploadUrl = 'http://erp.test/api/save_screenshort';

    uploadImage(imagePath, uploadUrl);

  })
  .catch((err) => {
    console.error(`Failed to capture screenshot: ${err}`);
  });
}

function callScreenshot() {
  const delay = Math.random() * 1 * 60 * 1000; // 5 minutes
  
  setTimeout(() => {
    takeScreenshot();
    callScreenshot(); // Call the function again to repeat the process
  }, delay);

}


callScreenshot();


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
async function uploadImage(imagePath, uploadUrl) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBlob = bufferToBlob(imageBuffer);

    const formData = new FormData();
    formData.append('image', imageBlob, imagePath);

    const headers = {
      'Content-Type': 'multipart/form-data',
    };

    const response = await axios.post(uploadUrl, formData, {
      headers: headers,
    });

    console.log('Image uploaded successfully:', response.data.message);
  } catch (error) {
    console.error('Error while uploading image:', error.message);
  }
}




function userLogin() {

  // Specify the file path
  const filePath = 'data.json';

  // Read the JSON file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
    } else {
      try {
        // Parse the JSON data
        const jsonData = JSON.parse(data);

        // Check if the desired object exists
        const hasObject = jsonData.hasOwnProperty('email');

        // Decide session based on the existence of the object
        if (hasObject) {
          // Object exists, set session accordingly
          console.log('Session: Object exists');
        } else {
          // Object doesn't exist, set session accordingly
          console.log('Session: Object does not exist');
        }
      } catch (error) {
        console.error('Error parsing JSON data:', error);
      }
    }
  });

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

// Usage example
const filePath = 'data.json';
clearDataFile(filePath);


// test end



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