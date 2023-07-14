const fs = require('fs');

// Data to be written to the JSON file
const data = {
  name: 'John',
  age: 30,
  email: 'johndoe@example.com'
};

// Convert data to JSON format
const jsonData = JSON.stringify(data);

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
