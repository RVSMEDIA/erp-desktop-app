const screenshot = require('screenshot-desktop');
const fs = require('fs');

var datetime = Date.now();
console.log(datetime);

// Capture the screenshot
screenshot({ screen: 'main', filename: `${datetime}.png` })
  .then((imgPath) => {
    console.log(`Screenshot saved: ${imgPath}`);
  })
  .catch((err) => {
    console.error(`Failed to capture screenshot: ${err}`);
  });
